// 오류 신고 select 핸들러 (window에 등록)
window.handleErrorReportSelect = function(selectElem) {
    if (!selectElem.value) return;
    const stationId = selectElem.dataset.stationId;
    const stationTitle = selectElem.dataset.stationTitle;
    const selectedErrorType = selectElem.value;
    
    // Supabase 테이블 제약조건에 맞게 error_type 값 매핑
    const errorTypeMapping = {
        "운영시간 오류": "운영시간",
        "운영상태 오류": "운영상태", 
        "위치 오류": "위치오류",
        "시설 문제": "시설문제",
        "기타": "기타"
    };
    
    const mappedErrorType = errorTypeMapping[selectedErrorType] || selectedErrorType;
    
    if (window.errorReportManager && typeof window.errorReportManager.submitErrorReport === 'function') {
        // Supabase 테이블 구조에 맞게 필요한 모든 필드 포함
        const reportData = {
            stationId: stationId,
            stationTitle: stationTitle,
            errorType: mappedErrorType, // 매핑된 값 사용
            description: `${selectedErrorType} 신고`, // 원래 값으로 설명
            contactInfo: '' // 연락처 정보 없음
        };
        
        console.log('신고 데이터 전송:', reportData);
        
        window.errorReportManager.submitErrorReport(reportData)
            .then(result => {
                if(result.success) {
                    alert('신고 완료: ' + result.message);
                } else {
                    alert('신고 실패 또는 로컬 저장됨');
                }
                selectElem.value = '';
            })
            .catch(error => {
                console.error('신고 처리 중 오류:', error);
                alert('신고 처리 중 오류가 발생했습니다.');
                selectElem.value = '';
            });
    } else {
        alert('오류 신고 시스템이 준비되지 않았습니다.');
        selectElem.value = '';
    }
}
