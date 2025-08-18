// 구청 정보 관리 클래스
class DistrictManager {
    constructor() {
        this.districts = new Map();
        this.loaded = false;
    }

    // 구청 정보 로드
    async loadDistricts() {
        if (this.loaded) return;
        
        try {
            const response = await fetch('./data/districts.json');
            const districtsData = await response.json();
            
            // Map으로 변환하여 빠른 검색 가능
            districtsData.forEach(district => {
                this.districts.set(district.name, district);
            });
            
            this.loaded = true;
            console.log('구청 정보 로드 완료:', this.districts.size, '개 구청');
        } catch (error) {
            console.error('구청 정보 로드 실패:', error);
        }
    }

    // 구청 정보 가져오기
    getDistrict(districtName) {
        return this.districts.get(districtName) || null;
    }

    // 구청 전화번호 가져오기
    getDistrictPhone(districtName) {
        const district = this.getDistrict(districtName);
        return district ? district.phone : '';
    }

    // 구청 웹사이트 가져오기
    getDistrictWebsite(districtName) {
        const district = this.getDistrict(districtName);
        return district ? district.website : '';
    }

    // 모든 구청 목록 가져오기
    getAllDistricts() {
        return Array.from(this.districts.values());
    }

    // 구청별 생수 제공소 개수 통계
    getDistrictStats(stations) {
        const stats = {};
        this.districts.forEach((district, name) => {
            stats[name] = {
                district: district,
                stationCount: stations.filter(station => station.district === name).length
            };
        });
        return stats;
    }
}

// 전역 인스턴스 생성
window.districtManager = new DistrictManager();
