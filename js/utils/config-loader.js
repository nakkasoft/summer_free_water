class ConfigLoader {
    constructor() {
        this.config = {};
    }

    async loadConfig() {
        try {
            // 브라우저 환경에서 환경변수 로드 시도
            // 다양한 방법으로 환경변수 접근 시도
            const getEnvVar = (name) => {
                // 글로벌 ENV 객체 (수동 설정된 경우)
                if (typeof window !== 'undefined' && window.ENV) {
                    const value = window.ENV[name];
                    if (value) return value;
                }
                
                // 서버 환경 또는 Node.js 환경
                if (typeof process !== 'undefined' && process.env) {
                    const value = process.env[name];
                    if (value) return value;
                }
                
                return null;
            };

            this.config = {
                KAKAO_API_KEY: getEnvVar('KAKAO_API_KEY'),
                DATABASE_TYPE: getEnvVar('DATABASE_TYPE') || 'local',
                SUPABASE_URL: getEnvVar('SUPABASE_URL'),
                SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY')
            };

            // 디버그 정보 출력
            console.log('🔍 환경변수 로드 상태:');
            console.log('- KAKAO_API_KEY:', this.config.KAKAO_API_KEY ? '✅ 설정됨' : '❌ 없음');
            console.log('- DATABASE_TYPE:', this.config.DATABASE_TYPE);
            console.log('- SUPABASE_URL:', this.config.SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
            console.log('- SUPABASE_ANON_KEY:', this.config.SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음');

            // 필수 환경변수 검증
            if (!this.config.KAKAO_API_KEY) {
                console.error('❌ 카카오맵 API 키가 설정되지 않았습니다!');
                console.log('💡 해결 방법:');
                console.log('1. https://developers.kakao.com/ 에서 API 키를 발급받으세요');
                console.log('2. 로컬: .env 파일에 VITE_KAKAO_API_KEY를 설정하세요');
                console.log('3. Vercel: 환경변수에 VITE_KAKAO_API_KEY를 설정하세요');
                throw new Error('카카오맵 API 키가 필요합니다. 환경변수 설정을 확인하세요.');
            }

            // Supabase 사용시 필수 환경변수 검증
            if (this.config.DATABASE_TYPE === 'supabase') {
                console.log('🔍 Supabase 환경변수 상세 검증:');
                console.log('- SUPABASE_URL 존재:', !!this.config.SUPABASE_URL);
                console.log('- SUPABASE_URL 값:', this.config.SUPABASE_URL || 'undefined');
                console.log('- SUPABASE_URL 길이:', this.config.SUPABASE_URL?.length || 0);
                console.log('- SUPABASE_ANON_KEY 존재:', !!this.config.SUPABASE_ANON_KEY);
                console.log('- SUPABASE_ANON_KEY 값:', this.config.SUPABASE_ANON_KEY || 'undefined');
                console.log('- SUPABASE_ANON_KEY 길이:', this.config.SUPABASE_ANON_KEY?.length || 0);
                
                if (!this.config.SUPABASE_URL || !this.config.SUPABASE_ANON_KEY) {
                    console.error('❌ Supabase 설정이 완전하지 않습니다!');
                    console.log('💡 해결 방법:');
                    console.log('1. VITE_SUPABASE_URL 환경변수를 설정하세요');
                    console.log('2. VITE_SUPABASE_ANON_KEY 환경변수를 설정하세요');
                    console.log('3. 현재 DATABASE_TYPE:', this.config.DATABASE_TYPE);
                    
                    // 임시로 로컬 데이터베이스로 폴백
                    console.log('⚠️ 임시로 로컬 데이터베이스를 사용합니다.');
                    this.config.DATABASE_TYPE = 'local';
                }
            }

            console.log('✅ 설정 로드 성공');
            console.log('🔑 사용 중인 데이터베이스:', this.config.DATABASE_TYPE);
            console.log('🔑 API 키 설정됨:', !!this.config.KAKAO_API_KEY);
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
            
            case 'local':
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
