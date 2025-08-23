class MapManager {
    constructor(containerId, waterStationService, userLocation = null) {
        this.containerId = containerId;
        this.waterStationService = waterStationService;
        this.map = null;
        this.markers = [];
        this.currentOverlay = null;
        this.markerImage = null;
        this.userLocationMarker = null; // 사용자 위치 마커
        this.initialUserLocation = userLocation; // 초기 사용자 위치
    }

    async initialize() {
        try {
            await this.createMap();
            this.setupMarkerImage();
            
            // 구청 정보 로드
            await window.districtManager.loadDistricts();
            
            // 오류 신고 시스템 초기화
            if (window.errorReportManager) {
                await window.errorReportManager.initialize();
            }
            
            await this.loadAndDisplayStations();
            
            // 초기 사용자 위치가 있으면 마커 표시
            if (this.initialUserLocation) {
                this.showUserLocation(this.initialUserLocation.lat, this.initialUserLocation.lng);
            }
            
            console.log('맵 매니저 초기화 완료');
        } catch (error) {
            console.error('맵 매니저 초기화 실패:', error);
            throw error;
        }
    }

    createMap() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error('지도 컨테이너를 찾을 수 없습니다.');
        }

        // 사용자 위치가 있으면 그것을 중심으로, 없으면 서울 시청을 중심으로
        let centerLat = 37.566826; // 서울 시청 기본값
        let centerLng = 126.9786567;
        let initialLevel = 8;

        if (this.initialUserLocation) {
            centerLat = this.initialUserLocation.lat;
            centerLng = this.initialUserLocation.lng;
            initialLevel = 6; // 사용자 위치일 때는 더 확대해서 보여줌
            console.log('지도 중심을 사용자 위치로 설정:', centerLat, centerLng);
        } else {
            console.log('지도 중심을 서울 시청으로 설정 (기본값)');
        }

        const options = {
            center: new kakao.maps.LatLng(centerLat, centerLng),
            level: initialLevel
        };

        this.map = new kakao.maps.Map(container, options);
        
        // 전역 오버레이 닫기 함수 설정
        window.closeOverlay = () => this.closeCurrentOverlay();
    }

    setupMarkerImage() {
        // 예쁜 생수 마커 이미지 사용
        const imageSrc = 'images/water-marker.svg';
        const imageSize = new kakao.maps.Size(40, 50);
        const imageOption = {offset: new kakao.maps.Point(20, 50)};
        this.markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
        console.log('예쁜 생수 마커 이미지 설정 완료');
    }

    setupUserLocationMarkerImage() {
        // 사용자 위치 마커 이미지 생성 (빨간색 원)
        const svgContent = `
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <!-- 외부 원 (맥동 효과) -->
                <circle cx="15" cy="15" r="14" fill="#FF5722" opacity="0.3">
                    <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <!-- 중간 원 -->
                <circle cx="15" cy="15" r="10" fill="#FF5722" opacity="0.7"/>
                <!-- 내부 원 (중심) -->
                <circle cx="15" cy="15" r="6" fill="#D32F2F"/>
                <!-- 중앙 점 -->
                <circle cx="15" cy="15" r="3" fill="white"/>
                <!-- 십자 표시 -->
                <path d="M15 9 L15 21 M9 15 L21 15" stroke="white" stroke-width="1.5"/>
            </svg>
        `;
        
        const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
        const imageSize = new kakao.maps.Size(30, 30);
        const imageOption = {offset: new kakao.maps.Point(15, 15)};
        return new kakao.maps.MarkerImage(svgDataUrl, imageSize, imageOption);
    }

    async loadAndDisplayStations() {
        const stations = await this.waterStationService.getAllStations();
        this.clearMarkers();
        stations.forEach(station => this.addMarker(station));
    }

    addMarker(station) {
        const position = new kakao.maps.LatLng(station.position.lat, station.position.lng);
        
        const marker = new kakao.maps.Marker({
            position: position,
            image: this.markerImage,
            zIndex: 5 // 사용자 위치보다는 위, 정보창보다는 아래
        });

        marker.setMap(this.map);
        this.markers.push(marker);

        // 커스텀 오버레이 생성
        const customOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: this.createStationInfoContent(station),
            yAnchor: 1,
            zIndex: 1000 // 정보창을 가장 위에 표시
        });

        // 마커 클릭 이벤트
        kakao.maps.event.addListener(marker, 'click', () => {
            this.closeCurrentOverlay();
            customOverlay.setMap(this.map);
            this.currentOverlay = customOverlay;
        });
    }

    createStationInfoContent(station) {
        // 구청 정보 가져오기
        const phone = window.districtManager.getDistrictPhone(station.district);
        const isMobile = window.innerWidth <= 768;
        
        // 모바일에서는 구청 이름을 클릭 가능한 전화링크로 만들기
        const operatorDisplay = isMobile && phone 
            ? `<a href="tel:${phone}" style="color: #0066cc; text-decoration: none;">${station.operator}</a>`
            : station.operator;

        // 실제 운영시간 체크 함수
        function isCurrentlyOperating(operatingHours, status) {
            // 기본적으로 status가 "운영중"이 아니면 운영 안함
            if (status !== "운영중") return false;
            
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTime = currentHour * 60 + currentMinute; // 분 단위로 변환
            
            // 운영시간 파싱
            const timeMatch = operatingHours.match(/(\d{1,2}):(\d{2})[~-](\d{1,2}):(\d{2})/);
            if (!timeMatch) {
                // 특수한 경우들 처리
                if (operatingHours.includes('24시간') || operatingHours.includes('상시')) return true;
                if (operatingHours.includes('생수소진시까지') || operatingHours.includes('소진시')) {
                    // 일반적으로 오전 10시부터 오후 6시까지로 가정
                    return currentTime >= 600 && currentTime <= 1080; // 10:00-18:00
                }
                return true; // 파싱 실패시 기본적으로 운영중으로 표시
            }
            
            const startHour = parseInt(timeMatch[1]);
            const startMinute = parseInt(timeMatch[2]);
            const endHour = parseInt(timeMatch[3]);
            const endMinute = parseInt(timeMatch[4]);
            
            const startTime = startHour * 60 + startMinute;
            const endTime = endHour * 60 + endMinute;
            
            // 시간 범위 체크
            if (startTime <= endTime) {
                // 일반적인 경우 (예: 09:00-18:00)
                return currentTime >= startTime && currentTime <= endTime;
            } else {
                // 자정을 넘어가는 경우 (예: 22:00-06:00)
                return currentTime >= startTime || currentTime <= endTime;
            }
        }

        const isOperating = isCurrentlyOperating(station.operatingHours, station.status);
        const statusColor = isOperating ? '#0066cc' : '#666666'; // 파란색 또는 진한 회색
        const statusIcon = isOperating ? '🟦' : '⬜'; // 파란 사각형 또는 회색 사각형
        const waterDropColor = isOperating ? '#0066cc' : '#666666'; // 물방울: 파란색 또는 진한 회색
        const titleTextColor = isOperating ? '#ffffff' : '#666666'; // 타이틀 글자: 흰색 또는 회색

        // 사업이름 추출 함수
        function extractProjectName(title) {
            if (title.includes('힐링 냉장고')) {
                return '힐링 냉장고';
            } else if (title.includes('오!빙고!')) {
                return '오!빙고!';
            } else if (title.includes('중랑옹달샘')) {
                return '중랑옹달샘';
            } else if (title.includes('봉달샘')) {
                return '봉달샘';
            } else if (title.includes('마포샘터')) {
                return '마포샘터';
            } else if (title.includes('생수나눔')) {
                return '생수나눔 냉장고';
            } else {
                // 사업이름을 찾을 수 없으면 구청이름 반환
                return station.operator;
            }
        }

        // 위치정보 추출 함수 (사업명 제거)
        function extractLocationOnly(title) {
            let location = title;
            // 각 사업명 패턴을 제거하여 위치정보만 남김
            location = location.replace(/힐링 냉장고\s*/, '');
            location = location.replace(/오!빙고!\s*/, '');
            location = location.replace(/중랑옹달샘\s*/, '');
            location = location.replace(/봉달샘\s*/, '');
            location = location.replace(/마포샘터\s*/, '');
            location = location.replace(/생수나눔\s*(냉장고)?\s*/, '');
            location = location.replace(/냉장고\s*/, '');
            return location.trim();
        }

        const projectName = extractProjectName(station.title);
        const locationOnly = extractLocationOnly(station.title);
        
        // 운영시간에서 불필요한 텍스트 정리
        const cleanOperatingHours = station.operatingHours.replace(/시간$/, '').trim();
        
        return `
            <div class="wrap">
                <div class="info">
                    <div class="title">
                        <span style="color: ${titleTextColor};">🚰 ${locationOnly}</span>
                        <div class="close" onclick="closeOverlay()" title="닫기"></div>
                    </div>
                    <div class="body">
                        <div class="img">
                            <div style="width:73px;height:70px;background:#f0f8ff;display:flex;align-items:center;justify-content:center;font-size:24px;color:${waterDropColor};">💧</div>
                        </div>
                        <div class="desc">
                            <div style="margin-bottom: 4px; font-size: 13px; color: ${statusColor}; font-weight: bold;">
                                ${statusIcon} ${isOperating ? '운영중' : '운영종료'} (${cleanOperatingHours})
                            </div>
                            <div style="margin-bottom: 4px; font-size: 13px; color: #666;">
                                ${station.operatingPeriod}
                            </div>
                            <div style="margin-bottom: 6px; font-size: 14px;">
                                ${projectName} (${operatorDisplay})
                            </div>
                                <div style="margin-top: 4px;">
                                    <select 
                                        id="error-report-select-${station.id}"
                                        data-station-id="${station.id}"
                                        data-station-title="${station.title}"
                                        onchange="window.handleErrorReportSelect(this)"
                                        style="
                                            background: #ff4444;
                                            color: white;
                                            border: none;
                                            padding: 4px 8px;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            font-size: 10px;
                                            width: 100%;
                                            appearance: none;
                                            -webkit-appearance: none;
                                            -moz-appearance: none;
                                            height: 28px;
                                        ">
                                        <option value="">⚠️ 정보 오류 신고</option>
                                        <option value="운영시간 오류">운영시간이 틀려요</option>
                                        <option value="운영상태 오류">운영상태가 틀려요</option>
                                        <option value="위치 오류">위치가 틀려요</option>
                                        <option value="시설 문제">시설에 문제가 있어요</option>
                                        <option value="기타">기타 문제</option>
                                    </select>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    closeCurrentOverlay() {
        if (this.currentOverlay) {
            this.currentOverlay.setMap(null);
            this.currentOverlay = null;
        }
    }

    clearMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
        this.closeCurrentOverlay();
    }

    async filterByDistrict(district) {
        if (district) {
            const stations = await this.waterStationService.getStationsByFilter({district});
            this.clearMarkers();
            stations.forEach(station => this.addMarker(station));
        } else {
            await this.loadAndDisplayStations();
        }
    }

    async searchStations(query) {
        if (query.trim()) {
            const stations = await this.waterStationService.getStationsByFilter({search: query});
            this.clearMarkers();
            stations.forEach(station => this.addMarker(station));
        } else {
            await this.loadAndDisplayStations();
        }
    }

    async showNearbyStations(userLat, userLng, radius = 5) {
        const stations = await this.waterStationService.getNearbyStations(
            {lat: userLat, lng: userLng}, 
            radius
        );
        this.clearMarkers();
        stations.forEach(station => this.addMarker(station));
        
        // 사용자 위치 마커 표시
        this.showUserLocation(userLat, userLng);
        
        // 사용자 위치 중심으로 지도 이동
        const userPosition = new kakao.maps.LatLng(userLat, userLng);
        this.map.setCenter(userPosition);
        this.map.setLevel(6);
    }

    // 지도 중심 이동
    moveToLocation(lat, lng, level = 5) {
        const position = new kakao.maps.LatLng(lat, lng);
        this.map.setCenter(position);
        this.map.setLevel(level);
    }

    // 모든 마커가 보이도록 지도 범위 조정
    fitBounds() {
        if (this.markers.length === 0) return;
        
        const bounds = new kakao.maps.LatLngBounds();
        this.markers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });
        this.map.setBounds(bounds);
    }

    // 사용자 위치 마커 표시
    showUserLocation(lat, lng) {
        // 기존 사용자 위치 마커 제거
        this.removeUserLocation();
        
        const position = new kakao.maps.LatLng(lat, lng);
        const userMarkerImage = this.setupUserLocationMarkerImage();
        
        this.userLocationMarker = new kakao.maps.Marker({
            position: position,
            image: userMarkerImage,
            zIndex: 0 // 가장 뒤에 표시
        });
        
        this.userLocationMarker.setMap(this.map);
        
        // 사용자 위치에 정보창 추가
        const userOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: this.createUserLocationInfoContent(),
            yAnchor: 2.5,
            zIndex: 1000 // 정보창을 가장 위에 표시
        });
        
        // 사용자 위치 마커 클릭시 정보창 표시
        kakao.maps.event.addListener(this.userLocationMarker, 'click', () => {
            this.closeCurrentOverlay();
            userOverlay.setMap(this.map);
            this.currentOverlay = userOverlay;
        });
        
        console.log('사용자 위치 마커 표시 완료:', lat, lng);
    }
    
    // 사용자 위치 마커 제거
    removeUserLocation() {
        if (this.userLocationMarker) {
            this.userLocationMarker.setMap(null);
            this.userLocationMarker = null;
        }
    }
    
    // 사용자 위치 정보창 내용 생성
    createUserLocationInfoContent() {
        return `
            <div class="wrap">
                <div class="info">
                    <div class="title">
                        📍 내 위치
                        <div class="close" onclick="closeOverlay()" title="닫기"></div>
                    </div>
                    <div class="body">
                        <div class="img">
                            <div style="width:73px;height:70px;background:#ffebee;display:flex;align-items:center;justify-content:center;font-size:24px;">🎯</div>
                        </div>
                        <div class="desc">
                            <div class="ellipsis"><strong>현재 위치</strong></div>
                            <div class="jibun ellipsis">📱 GPS로 확인된 위치</div>
                            <div class="jibun ellipsis">🚰 주변 생수 제공소를 확인하세요</div>
                            <div class="ellipsis">정확도: ±10-50m</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}