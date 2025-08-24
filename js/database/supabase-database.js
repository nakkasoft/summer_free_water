class SupabaseDatabase extends DatabaseInterface {
    constructor(url, anonKey) {
        super();
        this.url = url;
        this.anonKey = anonKey;
        this.client = null;
        this.connected = false;
    }

    async connect() {
        try {
            // 전역 싱글톤 Supabase 클라이언트 사용
            if (typeof supabase !== 'undefined') {
                console.log('🔧 Supabase 데이터베이스 연결 시도 (전역 싱글톤)...');
                
                // window.initializeGlobalSupabase 함수 존재 확인
                if (typeof window.initializeGlobalSupabase !== 'function') {
                    console.error('❌ window.initializeGlobalSupabase 함수가 정의되지 않았습니다.');
                    console.error('💡 supabase-global.js가 제대로 로드되었는지 확인하세요.');
                    this.connected = false;
                    return false;
                }
                
                // 전역 싱글톤 클라이언트 초기화
                this.client = window.initializeGlobalSupabase(this.url, this.anonKey);
                
                if (!this.client) {
                    console.error('❌ 전역 Supabase 클라이언트 초기화 실패');
                    this.connected = false;
                    return false;
                }
                
                // 연결 테스트
                const { data, error } = await this.client.from('error_reports').select('count', { count: 'exact', head: true });
                
                if (error && error.code !== 'PGRST116') { // 테이블이 없는 경우는 무시
                    console.warn('Supabase 연결 경고:', error.message);
                }
                
                this.connected = true;
                console.log('✅ Supabase 데이터베이스 연결 성공 (전역 싱글톤)');
                return true;
            } else {
                console.error('❌ Supabase 라이브러리가 로드되지 않았습니다.');
                return false;
            }
        } catch (error) {
            console.error('Supabase 연결 실패:', error);
            this.connected = false;
            return false;
        }
    }

    async getAllStations() {
        if (!this.connected) {
            console.warn('Supabase 연결이 필요합니다.');
            return [];
        }
        
        try {
            // const { data, error } = await this.client
            //     .from('water_stations')
            //     .select('*');
            // 
            // if (error) throw error;
            // return data;
            return [];
        } catch (error) {
            console.error('Supabase 데이터 조회 실패:', error);
            return [];
        }
    }

    async getStationById(id) {
        if (!this.connected) return null;
        
        try {
            // const { data, error } = await this.client
            //     .from('water_stations')
            //     .select('*')
            //     .eq('id', id)
            //     .single();
            // 
            // if (error) throw error;
            // return data;
            return null;
        } catch (error) {
            console.error('Supabase 단일 데이터 조회 실패:', error);
            return null;
        }
    }

    async getStationsByDistrict(district) {
        if (!this.connected) return [];
        
        try {
            // const { data, error } = await this.client
            //     .from('water_stations')
            //     .select('*')
            //     .eq('district', district);
            // 
            // if (error) throw error;
            // return data;
            return [];
        } catch (error) {
            console.error('Supabase 구별 데이터 조회 실패:', error);
            return [];
        }
    }

    async getStationsByType(type) {
        if (!this.connected) return [];
        
        try {
            // const { data, error } = await this.client
            //     .from('water_stations')
            //     .select('*')
            //     .eq('type', type);
            // 
            // if (error) throw error;
            // return data;
            return [];
        } catch (error) {
            console.error('Supabase 타입별 데이터 조회 실패:', error);
            return [];
        }
    }

    async getStationsByStatus(status) {
        if (!this.connected) return [];
        
        try {
            // const { data, error } = await this.client
            //     .from('water_stations')
            //     .select('*')
            //     .eq('status', status);
            // 
            // if (error) throw error;
            // return data;
            return [];
        } catch (error) {
            console.error('Supabase 상태별 데이터 조회 실패:', error);
            return [];
        }
    }

    async searchStations(query) {
        if (!this.connected) return [];
        
        try {
            // const { data, error } = await this.client
            //     .from('water_stations')
            //     .select('*')
            //     .or(`title.ilike.%${query}%,address.ilike.%${query}%`);
            // 
            // if (error) throw error;
            // return data;
            return [];
        } catch (error) {
            console.error('Supabase 검색 실패:', error);
            return [];
        }
    }

    async getNearbyStations(lat, lng, radius) {
        if (!this.connected) return [];
        
        try {
            // 지리적 거리 계산은 PostGIS 또는 별도 함수가 필요
            console.log('Supabase 근처 검색 (미구현):', lat, lng, radius);
            return [];
        } catch (error) {
            console.error('Supabase 근처 검색 실패:', error);
            return [];
        }
    }

    async addStation(station) {
        if (!this.connected) return null;
        
        try {
            // const { data, error } = await this.client
            //     .from('water_stations')
            //     .insert([station])
            //     .select();
            // 
            // if (error) throw error;
            // return data[0];
            return null;
        } catch (error) {
            console.error('Supabase 데이터 추가 실패:', error);
            return null;
        }
    }

    async updateStation(id, updates) {
        if (!this.connected) return null;
        
        try {
            // const { data, error } = await this.client
            //     .from('water_stations')
            //     .update(updates)
            //     .eq('id', id)
            //     .select();
            // 
            // if (error) throw error;
            // return data[0];
            return null;
        } catch (error) {
            console.error('Supabase 데이터 업데이트 실패:', error);
            return null;
        }
    }

    async deleteStation(id) {
        if (!this.connected) return false;
        
        try {
            // const { error } = await this.client
            //     .from('water_stations')
            //     .delete()
            //     .eq('id', id);
            // 
            // if (error) throw error;
            // return true;
            return false;
        } catch (error) {
            console.error('Supabase 데이터 삭제 실패:', error);
            return false;
        }
    }
}