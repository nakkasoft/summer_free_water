class MapManager {
    constructor(containerId, waterStationService) {
        this.containerId = containerId;
        this.waterStationService = waterStationService;
        this.map = null;
        this.markers = [];
        this.currentOverlay = null;
        this.markerImage = null;
    }

    async initialize() {
        try {
            await this.createMap();
            this.setupMarkerImage();
            await this.loadAndDisplayStations();
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

        const options = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청
            level: 8
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

    async loadAndDisplayStations() {
        const stations = await this.waterStationService.getAllStations();
        this.clearMarkers();
        stations.forEach(station => this.addMarker(station));
    }

    addMarker(station) {
        const position = new kakao.maps.LatLng(station.position.lat, station.position.lng);
        
        const marker = new kakao.maps.Marker({
            position: position,
            image: this.markerImage
        });

        marker.setMap(this.map);
        this.markers.push(marker);

        // 커스텀 오버레이 생성
        const customOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: this.createStationInfoContent(station),
            yAnchor: 1
        });

        // 마커 클릭 이벤트
        kakao.maps.event.addListener(marker, 'click', () => {
            this.closeCurrentOverlay();
            customOverlay.setMap(this.map);
            this.currentOverlay = customOverlay;
        });
    }

    createStationInfoContent(station) {
        const statusIcon = station.status === "운영중" ? "✅" : "❌";
        const phoneInfo = station.phone || "정보없음";
        
        return `
            <div class="wrap">
                <div class="info">
                    <div class="title">
                        🚰 ${station.title}
                        <div class="close" onclick="closeOverlay()" title="닫기"></div>
                    </div>
                    <div class="body">
                        <div class="img">
                            <div style="width:73px;height:70px;background:#f0f8ff;display:flex;align-items:center;justify-content:center;font-size:24px;">💧</div>
                        </div>
                        <div class="desc">
                            <div class="ellipsis"><strong>${station.address}</strong></div>
                            <div class="jibun ellipsis">⏰ ${station.operatingHours}</div>
                            <div class="jibun ellipsis">🏢 ${station.operator}</div>
                            <div class="jibun ellipsis">📞 ${phoneInfo}</div>
                            <div class="ellipsis">${statusIcon} ${station.status} (${station.type})</div>
                            <div class="jibun ellipsis">📅 ${station.operatingPeriod}</div>
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

    async filterByType(type) {
        if (type) {
            const stations = await this.waterStationService.getStationsByFilter({type});
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
}