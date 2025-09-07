class WaterStationService {
    constructor(database) {
        this.db = database;
    }

    async initialize() {
        return await this.db.connect();
    }

    async getAllStations() {
        try {
            return await this.db.getAllStations();
        } catch (error) {
            console.error('데이터 조회 실패:', error);
            return [];
        }
    }

    async getStationsByFilter(filters) {
        try {
            let stations = await this.db.getAllStations();

            if (filters.district) {
                stations = await this.db.getStationsByDistrict(filters.district);
            }

            if (filters.type) {
                stations = stations.filter(station => station.type === filters.type);
            }

            if (filters.status) {
                stations = stations.filter(station => station.status === filters.status);
            }

            if (filters.search) {
                stations = await this.db.searchStations(filters.search);
            }

            return stations;
        } catch (error) {
            console.error('필터링된 데이터 조회 실패:', error);
            return [];
        }
    }

    async getNearbyStations(userLocation, radius = 5) {
        try {
            return await this.db.getNearbyStations(
                userLocation.lat, 
                userLocation.lng, 
                radius
            );
        } catch (error) {
            console.error('주변 데이터 조회 실패:', error);
            return [];
        }
    }

    async addStation(stationData) {
        try {
            return await this.db.addStation(stationData);
        } catch (error) {
            console.error('데이터 추가 실패:', error);
            throw error;
        }
    }

    async updateStation(id, updates) {
        try {
            return await this.db.updateStation(id, updates);
        } catch (error) {
            console.error('데이터 업데이트 실패:', error);
            throw error;
        }
    }

    async deleteStation(id) {
        try {
            return await this.db.deleteStation(id);
        } catch (error) {
            console.error('데이터 삭제 실패:', error);
            throw error;
        }
    }

    // 거리 계산 유틸리티 메서드
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // 지구 반지름 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // 운영 상태 확인
    isOperating(station) {
        // 운영 종료일이 있으면 오늘 날짜와 비교
        if (station.endDate) {
            const today = new Date();
            const end = new Date(station.endDate);
            // 종료일이 오늘 이전이면 운영중 아님
            if (today > end) return false;
        }
        return station.status === '운영중';
    }

    // 24시간 운영 여부 확인
    is24Hours(station) {
        return station.operatingHours.includes('24시간');
    }
}
