-- Supabase 오류 신고 게시판 테이블 생성 스크립트

-- 1. 오류 신고 테이블 생성
CREATE TABLE error_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    station_id INTEGER NOT NULL,
    station_title TEXT NOT NULL,
    error_type TEXT NOT NULL CHECK (error_type IN ('운영중지', '운영시간', '위치오류', '연락처', '안전문제', '기타')),
    description TEXT NOT NULL,
    contact_info TEXT DEFAULT '',
    reporter_ip INET,
    user_agent TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
    priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
    admin_note TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS (Row Level Security) 정책 설정
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 신고를 조회할 수 있도록 (읽기 허용)
CREATE POLICY "Anyone can view error reports" ON error_reports
    FOR SELECT USING (true);

-- 모든 사용자가 신고를 제출할 수 있도록 (쓰기 허용)
CREATE POLICY "Anyone can insert error reports" ON error_reports
    FOR INSERT WITH CHECK (true);

-- 관리자만 신고를 수정할 수 있도록 (업데이트는 제한적)
-- 실제 운영에서는 관리자 역할 기반으로 설정
CREATE POLICY "Only admins can update error reports" ON error_reports
    FOR UPDATE USING (auth.role() = 'admin');

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_error_reports_station_id ON error_reports(station_id);
CREATE INDEX idx_error_reports_status ON error_reports(status);
CREATE INDEX idx_error_reports_created_at ON error_reports(created_at DESC);
CREATE INDEX idx_error_reports_priority ON error_reports(priority);
CREATE INDEX idx_error_reports_error_type ON error_reports(error_type);

-- 4. 자동 업데이트 타임스탬프 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_error_reports_updated_at 
    BEFORE UPDATE ON error_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. 신고 통계 뷰 생성
CREATE VIEW error_report_stats AS
SELECT 
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_reports,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_reports,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_reports,
    COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority_reports,
    COUNT(*) FILTER (WHERE priority = 'low') as low_priority_reports
FROM error_reports;

-- 6. 제공소별 신고 통계 뷰
CREATE VIEW station_report_stats AS
SELECT 
    station_id,
    station_title,
    COUNT(*) as report_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
    MAX(created_at) as last_report_date,
    string_agg(DISTINCT error_type, ', ') as error_types
FROM error_reports
GROUP BY station_id, station_title
ORDER BY report_count DESC;

-- 7. 유형별 신고 통계 뷰
CREATE VIEW error_type_stats AS
SELECT 
    error_type,
    COUNT(*) as report_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
    ROUND(AVG(CASE 
        WHEN status = 'resolved' THEN 
            EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600 
        ELSE NULL 
    END), 2) as avg_resolution_hours
FROM error_reports
GROUP BY error_type
ORDER BY report_count DESC;

-- 8. 샘플 데이터 삽입 (테스트용)
INSERT INTO error_reports (station_id, station_title, error_type, description, contact_info, priority) VALUES
(1, '오!빙고! 공동작업장', '운영시간', '실제로는 오후 5시에 운영이 종료됩니다.', 'test@example.com', 'medium'),
(2, '오!빙고! 청구역 쉼터', '운영중지', '현재 공사로 인해 운영이 중단된 상태입니다.', '', 'high'),
(3, '오!빙고! 다산어린이공원', '위치오류', '실제 위치가 지도상 표시된 곳과 다릅니다.', 'user@test.com', 'medium');

-- 9. 유용한 쿼리 예시들 (주석)

-- 최근 24시간 신고 조회
-- SELECT * FROM error_reports WHERE created_at >= NOW() - INTERVAL '1 day' ORDER BY created_at DESC;

-- 높은 우선순위 대기 중인 신고
-- SELECT * FROM error_reports WHERE status = 'pending' AND priority = 'high' ORDER BY created_at;

-- 특정 제공소의 모든 신고
-- SELECT * FROM error_reports WHERE station_id = 1 ORDER BY created_at DESC;

-- 월별 신고 통계
-- SELECT 
--     DATE_TRUNC('month', created_at) as month,
--     COUNT(*) as report_count,
--     COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count
-- FROM error_reports 
-- GROUP BY month 
-- ORDER BY month DESC;
