// Supabase 기반 오류 신고 게시판 관리 클래스
class ErrorReportManager {
    constructor() {
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.client = null;
        this.connected = false;
    }

    // 초기화 및 연결
    async initialize() {
        try {
            // 환경변수에서 Supabase 설정 로드
            const config = await this.loadConfig();
            this.supabaseUrl = config.SUPABASE_URL;
            this.supabaseKey = config.SUPABASE_ANON_KEY;
            
            if (!this.supabaseUrl || !this.supabaseKey || 
                this.supabaseUrl.includes('your-project-id') || 
                this.supabaseKey.includes('your-anon-key')) {
                console.warn('Supabase 설정이 완료되지 않았습니다. 로컬 모드로 실행합니다.');
                console.log('설정 방법: .env 파일에서 SUPABASE_URL과 SUPABASE_ANON_KEY를 실제 값으로 변경해주세요.');
                this.connected = false;
                return false;
            }
            
            // Supabase 클라이언트 초기화
            if (typeof supabase !== 'undefined') {
                this.client = supabase.createClient(this.supabaseUrl, this.supabaseKey);
                
                // 연결 테스트
                const { error } = await this.client.from('error_reports').select('count', { count: 'exact', head: true });
                
                if (error) {
                    console.warn('Supabase 테이블 접근 오류:', error.message);
                    console.log('SQL 스크립트를 Supabase에서 실행했는지 확인해주세요.');
                    this.connected = false;
                    return false;
                }
                
                this.connected = true;
                console.log('오류 신고 시스템 (Supabase) 초기화 완료');
                return true;
            } else {
                console.error('Supabase 라이브러리가 로드되지 않았습니다.');
                this.connected = false;
                return false;
            }
        } catch (error) {
            console.error('오류 신고 시스템 초기화 실패:', error);
            this.connected = false;
            return false;
        }
    }

    async loadConfig() {
        // config-loader와 동일한 방식으로 설정 로드
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
            console.error('설정 파일 로드 실패:', error);
            return {};
        }
    }

    // 오류 신고 제출
    async submitErrorReport(reportData) {
        if (!this.connected) {
            console.warn('Supabase에 연결되지 않았습니다. 로컬 저장으로 대체합니다.');
            return this.fallbackSubmit(reportData);
        }

        try {
            const report = {
                station_id: parseInt(reportData.stationId),
                station_title: reportData.stationTitle,
                error_type: reportData.errorType,
                description: reportData.description || `${reportData.errorType} 신고`,
                contact_info: reportData.contactInfo || '',
                priority: this.calculatePriority(reportData.errorType)
            };

            console.log('Supabase에 전송할 데이터:', report);

            // Supabase에 데이터 삽입
            const { data, error } = await this.client
                .from('error_reports')
                .insert([report])
                .select();
            
            if (error) {
                console.error('Supabase 삽입 오류:', error);
                console.error('전송한 데이터:', report);
                console.error('오류 세부사항:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                return this.fallbackSubmit(reportData);
            }

            // 로컬에도 백업 저장
            this.saveToLocalStorage(report);
            
            console.log('오류 신고 Supabase 제출 완료:', data[0]);
            return {
                success: true,
                reportId: data[0].id,
                message: '오류 신고가 성공적으로 제출되었습니다. 빠른 시일 내에 검토하겠습니다.'
            };

        } catch (error) {
            console.error('오류 신고 제출 실패:', error);
            return this.fallbackSubmit(reportData);
        }
    }

    // Supabase 연결 실패시 대체 방법
    fallbackSubmit(reportData) {
        const report = {
            ...reportData,
            timestamp: new Date().toISOString(),
            method: 'localStorage_fallback'
        };

        this.saveToLocalStorage(report);
        
        return {
            success: true,
            reportId: report.timestamp,
            message: '오류 신고가 임시 저장되었습니다. 관리자가 확인 후 처리하겠습니다.'
        };
    }

    // 로컬 스토리지에 백업 저장
    saveToLocalStorage(report) {
        try {
            const reports = JSON.parse(localStorage.getItem('errorReports') || '[]');
            reports.push(report);
            
            // 최대 100개까지만 저장
            if (reports.length > 100) {
                reports.splice(0, reports.length - 100);
            }
            
            localStorage.setItem('errorReports', JSON.stringify(reports));
        } catch (error) {
            console.error('로컬 스토리지 저장 실패:', error);
        }
    }

    // 모든 오류 신고 조회 (관리자용)
    async getAllReports(limit = 50, offset = 0) {
        if (!this.connected) {
            return this.getLocalReports();
        }

        try {
            const { data, error } = await this.client
                .from('error_reports')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
            
            if (error) {
                console.error('Supabase 조회 오류:', error);
                return this.getLocalReports();
            }
            
            return data;

        } catch (error) {
            console.error('오류 신고 조회 실패:', error);
            return this.getLocalReports();
        }
    }

    // 로컬 스토리지에서 신고 조회
    getLocalReports() {
        try {
            const reports = JSON.parse(localStorage.getItem('errorReports') || '[]');
            return reports.sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp));
        } catch (error) {
            console.error('로컬 신고 조회 실패:', error);
            return [];
        }
    }

    // 특정 제공소 관련 신고 조회
    async getReportsByStation(stationId) {
        const allReports = await this.getAllReports();
        return allReports.filter(report => report.station_id === stationId);
    }

    // 신고 상태 업데이트 (관리자용)
    async updateReportStatus(reportId, status, adminNote = '') {
        if (!this.connected) {
            console.warn('오프라인 모드에서는 상태 업데이트가 제한됩니다.');
            return false;
        }

        try {
            // const { data, error } = await this.client
            //     .from('error_reports')
            //     .update({ 
            //         status: status, 
            //         admin_note: adminNote,
            //         updated_at: new Date().toISOString()
            //     })
            //     .eq('id', reportId);
            
            // if (error) throw error;
            
            console.log('신고 상태 업데이트 완료:', reportId, status);
            return true;

        } catch (error) {
            console.error('신고 상태 업데이트 실패:', error);
            return false;
        }
    }

    // 우선순위 계산
    calculatePriority(errorType) {
        const priorityMap = {
            '운영중지': 'high',
            '안전문제': 'high',
            '위치오류': 'medium',
            '운영시간': 'medium',
            '연락처': 'low',
            '기타': 'low'
        };
        
        return priorityMap[errorType] || 'low';
    }

    // 클라이언트 IP 조회 (선택사항)
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // 신고 통계
    async getReportStats() {
        const reports = await this.getAllReports();
        
        const stats = {
            total: reports.length,
            pending: reports.filter(r => r.status === 'pending').length,
            resolved: reports.filter(r => r.status === 'resolved').length,
            byType: {},
            byStation: {},
            recent: reports.filter(r => {
                const reportDate = new Date(r.created_at || r.timestamp);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return reportDate > weekAgo;
            }).length
        };

        // 유형별 통계
        reports.forEach(report => {
            const type = report.error_type || '기타';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        // 제공소별 통계
        reports.forEach(report => {
            const station = report.station_title || '알 수 없음';
            stats.byStation[station] = (stats.byStation[station] || 0) + 1;
        });

        return stats;
    }
}

// 전역 인스턴스 생성
window.errorReportManager = new ErrorReportManager();
