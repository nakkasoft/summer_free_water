// 전역 Supabase 클라이언트 싱글톤
class GlobalSupabaseClient {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.url = null;
        this.anonKey = null;
    }

    static getInstance() {
        if (!window.__GLOBAL_SUPABASE_INSTANCE__) {
            window.__GLOBAL_SUPABASE_INSTANCE__ = new GlobalSupabaseClient();
        }
        return window.__GLOBAL_SUPABASE_INSTANCE__;
    }

    // 한 번만 초기화
    initialize(url, anonKey) {
        if (this.isInitialized && this.url === url && this.anonKey === anonKey) {
            console.log('✅ Supabase 클라이언트가 이미 초기화되었습니다.');
            return this.client;
        }

        if (this.client) {
            console.log('🔄 기존 Supabase 클라이언트 교체...');
        }

        console.log('🔧 새로운 Supabase 클라이언트 생성...');
        
        this.client = supabase.createClient(url, anonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        });

        this.url = url;
        this.anonKey = anonKey;
        this.isInitialized = true;

        console.log('✅ 전역 Supabase 클라이언트 초기화 완료');
        return this.client;
    }

    getClient() {
        if (!this.isInitialized || !this.client) {
            console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
            return null;
        }
        return this.client;
    }

    isConnected() {
        return this.isInitialized && this.client !== null;
    }
}

// 전역 함수로 노출
window.getGlobalSupabaseClient = function() {
    return GlobalSupabaseClient.getInstance().getClient();
};

window.initializeGlobalSupabase = function(url, anonKey) {
    return GlobalSupabaseClient.getInstance().initialize(url, anonKey);
};

console.log('🌐 전역 Supabase 싱글톤 로드됨');
