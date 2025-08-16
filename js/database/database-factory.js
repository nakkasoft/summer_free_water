class DatabaseFactory {
    static create(type, config) {
        switch (type.toLowerCase()) {
            case 'local':
                return new LocalDatabase();
            
            case 'supabase':
                return new SupabaseDatabase(
                    config.SUPABASE_URL, 
                    config.SUPABASE_ANON_KEY
                );
            
            case 'firebase':
                return new FirebaseDatabase(config.FIREBASE_CONFIG);
            
            default:
                console.warn(`지원하지 않는 데이터베이스 타입: ${type}, 로컬 데이터베이스를 사용합니다.`);
                return new LocalDatabase();
        }
    }

    static getAvailableTypes() {
        return ['local', 'supabase', 'firebase'];
    }
}