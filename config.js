// 환경 변수에서 API 키를 로드하는 함수
async function loadConfig() {
    try {
        const response = await fetch('.env');
        const text = await response.text();
        const lines = text.split('\n');
        const config = {};
        
        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                config[key.trim()] = value.trim();
            }
        });
        
        return config;
    } catch (error) {
        console.error('환경 변수 로드 실패:', error);
        return {};
    }
}