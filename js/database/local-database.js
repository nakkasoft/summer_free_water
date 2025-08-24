class LocalDatabase extends DatabaseInterface {
    constructor() {
        super();
        this.data = [];
        this.connected = false;
    }

    async connect() {
        try {
            const response = await fetch('./data/water_stations.json');
            
            if (!response.ok) {
                throw new Error(`HTTP 오류: ${response.status} ${response.statusText}`);
            }
            
            this.data = await response.json();
            this.connected = true;
            console.log('✅ 로컬 데이터베이스 연결 완료:', this.data.length + '개 레코드');
            return true;
        } catch (error) {
            console.error('❌ 로컬 데이터베이스 연결 실패:', error);
            this.connected = false;
            this.data = [];
            return false;
        }
    }

    async getAllStations() {
        if (!this.connected) {
            await this.connect();
        }
        return [...this.data];
    }

    async getStationById(id) {
        if (!this.connected) await this.connect();
        return this.data.find(station => station.id === id) || null;
    }

    async getStationsByDistrict(district) {
        if (!this.connected) await this.connect();
        return this.data.filter(station => 
            station.district === district || 
            (station.operator && station.operator.includes(district))
        );
    }

    async getStationsByType(type) {
        if (!this.connected) await this.connect();
        return this.data.filter(station => station.type === type);
    }

    async getStationsByStatus(status) {
        if (!this.connected) await this.connect();
        return this.data.filter(station => station.status === status);
    }

    async addStation(station) {
        if (!this.connected) await this.connect();
        station.id = Math.max(...this.data.map(s => s.id), 0) + 1;
        station.created_at = new Date().toISOString();
        station.updated_at = new Date().toISOString();
        this.data.push(station);
        return station;
    }

    async updateStation(id, updates) {
        if (!this.connected) await this.connect();
        const index = this.data.findIndex(station => station.id === id);
        if (index === -1) return null;
        
        updates.updated_at = new Date().toISOString();
        this.data[index] = { ...this.data[index], ...updates };
        return this.data[index];
    }

    async deleteStation(id) {
        if (!this.connected) await this.connect();
        const index = this.data.findIndex(station => station.id === id);
        if (index === -1) return false;
        
        this.data.splice(index, 1);
        return true;
    }

    async searchStations(query) {
        if (!this.connected) await this.connect();
        const searchTerm = query.toLowerCase();
        return this.data.filter(station => 
            station.title.toLowerCase().includes(searchTerm) ||
            station.address.toLowerCase().includes(searchTerm) ||
            station.operator.toLowerCase().includes(searchTerm)
        );
    }

    async getNearbyStations(lat, lng, radius = 5) {
        if (!this.connected) await this.connect();
        return this.data
            .map(station => ({
                ...station,
                distance: this.calculateDistance(lat, lng, station.position.lat, station.position.lng)
            }))
            .filter(station => station.distance <= radius)
            .sort((a, b) => a.distance - b.distance);
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}