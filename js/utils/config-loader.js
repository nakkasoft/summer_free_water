class ConfigLoader {
    constructor() {
        this.config = {};
    }

    async loadConfig() {
        try {
            // 로컬 개발환경에서는 직접 API 키를 설정
            // 실제 배포시에는 서버에서 환경변수를 로드하도록 수정
            
            // 기본 설정
            this.config = {
                KAKAO_API_KEY: '932066d1403575d3521925f322ec1d8b', // 실제 API 키로 교체 필요
                DATABASE_TYPE: 'local',
                // 추후 Supabase/Firebase 설정 추가
                // SUPABASE_URL: '',
                // SUPABASE_ANON_KEY: '',
                // FIREBASE_CONFIG: {}
            };

            // API 키 유효성 검증
            if (!this.config.KAKAO_API_KEY || this.config.KAKAO_API_KEY === 'YOUR_ACTUAL_API_KEY_HERE') {
                console.error('❌ 카카오맵 API 키가 설정되지 않았습니다!');
                console.log('💡 해결 방법:');
                console.log('1. https://developers.kakao.com/ 에서 API 키를 발급받으세요');
                console.log('2. js/utils/config-loader.js 파일의 KAKAO_API_KEY 값을 변경하세요');
                throw new Error('카카오맵 API 키가 필요합니다. 개발자 도구 콘솔의 안내를 확인하세요.');
            }

            console.log('✅ 설정 로드 성공');
            return this.config;
        } catch (error) {
            console.error('❌ 설정 로드 실패:', error);
            throw error;
        }
    }

    getDatabaseType() {
        return this.config.DATABASE_TYPE || 'local';
    }

    getDatabaseConfig() {
        const type = this.getDatabaseType();
        
        switch (type) {
            case 'supabase':
                return {
                    SUPABASE_URL: this.config.SUPABASE_URL,
                    SUPABASE_ANON_KEY: this.config.SUPABASE_ANON_KEY
                };
            
            case 'firebase':
                return {
                    FIREBASE_CONFIG: this.config.FIREBASE_CONFIG
                };
            
            default:
                return {};
        }
    }

    getKakaoApiKey() {
        return this.config.KAKAO_API_KEY;
    }

    // 환경별 설정 로드 (개발/운영)
    isProduction() {
        return this.config.NODE_ENV === 'production';
    }

    isDevelopment() {
        return !this.isProduction();
    }
}
