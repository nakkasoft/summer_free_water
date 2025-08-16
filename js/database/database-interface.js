/**
 * 데이터베이스 추상 인터페이스
 * 모든 데이터베이스 구현체는 이 인터페이스를 따라야 함
 */
class DatabaseInterface {
    constructor() {
        if (this.constructor === DatabaseInterface) {
            throw new Error("추상 클래스는 직접 인스턴스화할 수 없습니다.");
        }
    }

    // 필수 구현 메서드들
    async connect() {
        throw new Error("connect() 메서드를 구현해야 합니다.");
    }

    async getAllStations() {
        throw new Error("getAllStations() 메서드를 구현해야 합니다.");
    }

    async getStationById(id) {
        throw new Error("getStationById() 메서드를 구현해야 합니다.");
    }

    async getStationsByDistrict(district) {
        throw new Error("getStationsByDistrict() 메서드를 구현해야 합니다.");
    }

    async getStationsByType(type) {
        throw new Error("getStationsByType() 메서드를 구현해야 합니다.");
    }

    async getStationsByStatus(status) {
        throw new Error("getStationsByStatus() 메서드를 구현해야 합니다.");
    }

    async addStation(station) {
        throw new Error("addStation() 메서드를 구현해야 합니다.");
    }

    async updateStation(id, updates) {
        throw new Error("updateStation() 메서드를 구현해야 합니다.");
    }

    async deleteStation(id) {
        throw new Error("deleteStation() 메서드를 구현해야 합니다.");
    }

    async searchStations(query) {
        throw new Error("searchStations() 메서드를 구현해야 합니다.");
    }

    async getNearbyStations(lat, lng, radius) {
        throw new Error("getNearbyStations() 메서드를 구현해야 합니다.");
    }
}
