// Supabase 연동 테스트 함수들
window.testSupabase = {
    // 연결 테스트
    async testConnection() {
        console.log('🔍 Supabase 연결 테스트 시작...');
        
        const isInitialized = await window.errorReportManager.initialize();
        
        if (isInitialized) {
            console.log('✅ Supabase 연결 성공!');
            return true;
        } else {
            console.log('❌ Supabase 연결 실패. 로컬 모드로 동작합니다.');
            return false;
        }
    },

    // 테스트 신고 제출
    async testSubmit() {
        console.log('📝 테스트 신고 제출 중...');
        
        const testReport = {
            stationId: '1',
            stationTitle: '테스트 제공소',
            errorType: '기타',
            description: '연동 테스트용 신고입니다.',
            contactInfo: 'test@example.com'
        };

        const result = await window.errorReportManager.submitErrorReport(testReport);
        
        if (result.success) {
            console.log('✅ 테스트 신고 제출 성공!', result);
            return result;
        } else {
            console.log('❌ 테스트 신고 제출 실패:', result);
            return result;
        }
    },

    // 신고 목록 조회 테스트
    async testRetrieve() {
        console.log('📋 신고 목록 조회 테스트 중...');
        
        const reports = await window.errorReportManager.getAllReports(10);
        
        console.log('📊 조회된 신고 개수:', reports.length);
        console.table(reports);
        
        return reports;
    },

    // 통계 조회 테스트
    async testStats() {
        console.log('📈 통계 조회 테스트 중...');
        
        const stats = await window.errorReportManager.getReportStats();
        
        console.log('📊 신고 통계:', stats);
        
        return stats;
    },

    // 전체 테스트 실행
    async runAllTests() {
        console.group('🧪 Supabase 전체 테스트 실행');
        
        const connectionTest = await this.testConnection();
        const submitTest = await this.testSubmit();
        const retrieveTest = await this.testRetrieve();
        const statsTest = await this.testStats();
        
        console.log('\n📋 테스트 결과 요약:');
        console.log('연결 테스트:', connectionTest ? '✅' : '❌');
        console.log('제출 테스트:', submitTest.success ? '✅' : '❌');
        console.log('조회 테스트:', retrieveTest.length >= 0 ? '✅' : '❌');
        console.log('통계 테스트:', statsTest ? '✅' : '❌');
        
        console.groupEnd();
        
        return {
            connection: connectionTest,
            submit: submitTest.success,
            retrieve: retrieveTest.length >= 0,
            stats: !!statsTest
        };
    }
};

// 페이지 로드 완료 후 자동 연결 테스트
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        if (window.errorReportManager) {
            console.log('🚀 Supabase 자동 연결 테스트...');
            await window.testSupabase.testConnection();
            
            console.log('\n💡 수동 테스트 방법:');
            console.log('window.testSupabase.runAllTests() - 전체 테스트');
            console.log('window.testSupabase.testSubmit() - 신고 제출 테스트');
            console.log('window.testSupabase.testRetrieve() - 신고 조회 테스트');
        }
    }, 2000);
});
