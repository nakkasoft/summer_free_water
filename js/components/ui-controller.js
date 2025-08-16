class UIController {
    constructor(waterStationService, mapManager) {
        this.waterStationService = waterStationService;
        this.mapManager = mapManager;
        this.userLocation = null;
    }

    initialize() {
        this.setupEventListeners();
        this.setupGeolocation();
        console.log('UI 컨트롤러 초기화 완료');
    }

    setupEventListeners() {
        // 구 필터
        const districtFilter = document.getElementById('districtFilter');
        if (districtFilter) {
            districtFilter.addEventListener('change', (e) => {
                this.handleDistrictFilter(e.target.value);
            });
        }

        // 타입 필터
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.handleTypeFilter(e.target.value);
            });
        }

        // 검색
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput ? searchInput.value : '';
                this.handleSearch(query);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(e.target.value);
                }
            });
        }

        // 내 주변 버튼
        const nearbyBtn = document.getElementById('nearbyBtn');
        if (nearbyBtn) {
            nearbyBtn.addEventListener('click', () => {
                this.handleNearby();
            });
        }

        // 전체 보기 버튼 (선택사항)
        const showAllBtn = document.getElementById('showAllBtn');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => {
                this.handleShowAll();
            });
        }
    }

    setupGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('사용자 위치 확인:', this.userLocation);
                },
                (error) => {
                    console.warn('위치 정보를 가져올 수 없습니다:', error.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5분
                }
            );
        } else {
            console.warn('이 브라우저는 위치 서비스를 지원하지 않습니다.');
        }
    }

    async handleDistrictFilter(district) {
        try {
            this.showLoading(true);
            await this.mapManager.filterByDistrict(district);
            this.clearOtherFilters('district');
            console.log('구 필터 적용:', district || '전체');
        } catch (error) {
            console.error('구 필터 처리 실패:', error);
            this.showError('구 필터를 적용하는데 실패했습니다.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleTypeFilter(type) {
        try {
            this.showLoading(true);
            await this.mapManager.filterByType(type);
            this.clearOtherFilters('type');
            console.log('타입 필터 적용:', type || '전체');
        } catch (error) {
            console.error('타입 필터 처리 실패:', error);
            this.showError('타입 필터를 적용하는데 실패했습니다.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleSearch(query) {
        try {
            this.showLoading(true);
            await this.mapManager.searchStations(query);
            this.clearOtherFilters('search');
            console.log('검색 실행:', query || '전체');
        } catch (error) {
            console.error('검색 처리 실패:', error);
            this.showError('검색을 실행하는데 실패했습니다.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleNearby() {
        if (!this.userLocation) {
            // 위치 정보가 없으면 다시 시도
            this.getCurrentLocation()
                .then((location) => {
                    this.userLocation = location;
                    this.executeNearbySearch();
                })
                .catch((error) => {
                    console.error('위치 정보 획득 실패:', error);
                    this.showError('위치 정보를 가져올 수 없습니다. 위치 서비스를 활성화해주세요.');
                });
        } else {
            this.executeNearbySearch();
        }
    }

    async executeNearbySearch() {
        try {
            this.showLoading(true);
            await this.mapManager.showNearbyStations(
                this.userLocation.lat, 
                this.userLocation.lng, 
                5 // 5km 반경
            );
            this.clearAllFilters();
            console.log('내 주변 검색 실행');
        } catch (error) {
            console.error('내 주변 검색 실패:', error);
            this.showError('내 주변 검색을 실행하는데 실패했습니다.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleShowAll() {
        try {
            this.showLoading(true);
            await this.mapManager.loadAndDisplayStations();
            this.clearAllFilters();
            this.mapManager.fitBounds();
            console.log('전체 보기 실행');
        } catch (error) {
            console.error('전체 보기 실패:', error);
            this.showError('전체 보기를 실행하는데 실패했습니다.');
        } finally {
            this.showLoading(false);
        }
    }

    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('위치 서비스가 지원되지 않습니다.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    clearOtherFilters(exceptType) {
        if (exceptType !== 'district') {
            const districtFilter = document.getElementById('districtFilter');
            if (districtFilter) districtFilter.value = '';
        }

        if (exceptType !== 'type') {
            const typeFilter = document.getElementById('typeFilter');
            if (typeFilter) typeFilter.value = '';
        }

        if (exceptType !== 'search') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
        }
    }

    clearAllFilters() {
        this.clearOtherFilters();
    }

    showLoading(show) {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        alert(message); // 간단한 알림, 나중에 더 예쁜 UI로 교체 가능
    }

    // 통계 정보 업데이트 (선택사항)
    async updateStats() {
        try {
            const allStations = await this.waterStationService.getAllStations();
            const operatingCount = allStations.filter(s => s.status === '운영중').length;
            
            // 통계 정보 표시 (UI 요소가 있다면)
            const statsEl = document.getElementById('stats');
            if (statsEl) {
                statsEl.innerHTML = `
                    <span>전체: ${allStations.length}개</span>
                    <span>운영중: ${operatingCount}개</span>
                `;
            }
        } catch (error) {
            console.error('통계 정보 업데이트 실패:', error);
        }
    }
}