// 오류 신고 UI 관리 클래스
class ErrorReportUI {
    constructor() {
        this.reportManager = window.errorReportManager;
        this.currentStation = null;
    }

    // 오류 신고 버튼을 정보창에 추가
    createReportButton(stationId, stationTitle) {
        return `
            <div class="error-report-section" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                <button onclick="window.errorReportUI.openReportModal('${stationId}', '${stationTitle}')" 
                        class="report-btn"
                        style="
                            width: 100%;
                            padding: 6px 12px;
                            background: linear-gradient(135deg, #ff6b6b, #ff5252);
                            color: white;
                            border: none;
                            border-radius: 4px;
                            font-size: 12px;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 4px;
                        "
                        onmouseover="this.style.background='linear-gradient(135deg, #ff5252, #ff1744)'; this.style.transform='translateY(-1px)'"
                        onmouseout="this.style.background='linear-gradient(135deg, #ff6b6b, #ff5252)'; this.style.transform='translateY(0)'">
                    <span style="font-size: 14px;">⚠️</span>
                    정보 오류 신고
                </button>
            </div>
        `;
    }

    // 신고 모달 열기
    openReportModal(stationId, stationTitle) {
        this.currentStation = { id: stationId, title: stationTitle };
        this.showReportModal();
    }

    // 신고 모달 HTML 생성
    showReportModal() {
        const modalHTML = `
            <div id="errorReportModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: 'Malgun Gothic', sans-serif;
            ">
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 480px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #333; font-size: 18px;">
                            🚨 정보 오류 신고
                        </h3>
                        <button onclick="window.errorReportUI.closeReportModal()" style="
                            background: none;
                            border: none;
                            font-size: 24px;
                            cursor: pointer;
                            color: #666;
                        ">×</button>
                    </div>

                    <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                        <strong style="color: #495057;">신고 대상:</strong>
                        <div style="color: #6c757d; font-size: 14px; margin-top: 4px;">
                            ${this.currentStation.title}
                        </div>
                    </div>

                    <form id="errorReportForm">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #333;">
                                오류 유형 *
                            </label>
                            <select name="errorType" required style="
                                width: 100%;
                                padding: 10px;
                                border: 2px solid #dee2e6;
                                border-radius: 6px;
                                font-size: 14px;
                                background: white;
                            ">
                                <option value="">선택해주세요</option>
                                <option value="운영중지">🔴 운영 중지됨</option>
                                <option value="운영시간">⏰ 운영시간 오류</option>
                                <option value="위치오류">📍 위치 정보 오류</option>
                                <option value="연락처">📞 연락처 오류</option>
                                <option value="안전문제">⚠️ 안전 문제</option>
                                <option value="기타">❓ 기타</option>
                            </select>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #333;">
                                상세 설명 *
                            </label>
                            <textarea name="description" required placeholder="구체적인 오류 내용을 설명해주세요.&#10;예: 실제로는 오후 6시에 운영이 종료됩니다." style="
                                width: 100%;
                                height: 100px;
                                padding: 10px;
                                border: 2px solid #dee2e6;
                                border-radius: 6px;
                                font-size: 14px;
                                resize: vertical;
                                font-family: inherit;
                            "></textarea>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #333;">
                                연락처 (선택사항)
                            </label>
                            <input type="text" name="contactInfo" placeholder="답변을 받고 싶으시면 이메일이나 전화번호를 입력해주세요." style="
                                width: 100%;
                                padding: 10px;
                                border: 2px solid #dee2e6;
                                border-radius: 6px;
                                font-size: 14px;
                            ">
                            <div style="font-size: 12px; color: #6c757d; margin-top: 4px;">
                                개인정보는 오류 처리 목적으로만 사용되며, 처리 완료 후 삭제됩니다.
                            </div>
                        </div>

                        <div style="display: flex; gap: 12px;">
                            <button type="button" onclick="window.errorReportUI.closeReportModal()" style="
                                flex: 1;
                                padding: 12px;
                                border: 2px solid #dee2e6;
                                background: white;
                                color: #6c757d;
                                border-radius: 6px;
                                font-size: 14px;
                                cursor: pointer;
                            ">취소</button>
                            <button type="submit" style="
                                flex: 2;
                                padding: 12px;
                                border: none;
                                background: linear-gradient(135deg, #007bff, #0056b3);
                                color: white;
                                border-radius: 6px;
                                font-size: 14px;
                                cursor: pointer;
                                font-weight: bold;
                            ">신고 제출</button>
                        </div>
                    </form>

                    <div style="margin-top: 16px; padding: 12px; background: #e3f2fd; border-radius: 6px; font-size: 12px; color: #1565c0;">
                        💡 <strong>알림:</strong> 신고해주신 정보는 관리자가 검토 후 빠르게 수정하겠습니다. 
                        허위 신고는 서비스 이용에 제한이 있을 수 있습니다.
                    </div>
                </div>
            </div>
        `;

        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // 폼 제출 이벤트 리스너 추가
        document.getElementById('errorReportForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReport(e.target);
        });

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', this.handleEscKey.bind(this));
    }

    // 모달 닫기
    closeReportModal() {
        const modal = document.getElementById('errorReportModal');
        if (modal) {
            modal.remove();
        }
        document.removeEventListener('keydown', this.handleEscKey.bind(this));
    }

    // ESC 키 처리
    handleEscKey(e) {
        if (e.key === 'Escape') {
            this.closeReportModal();
        }
    }

    // 신고 제출
    async submitReport(form) {
        const formData = new FormData(form);
        const reportData = {
            stationId: this.currentStation.id,
            stationTitle: this.currentStation.title,
            errorType: formData.get('errorType'),
            description: formData.get('description'),
            contactInfo: formData.get('contactInfo') || ''
        };

        // 유효성 검사
        if (!reportData.errorType || !reportData.description.trim()) {
            alert('오류 유형과 상세 설명을 모두 입력해주세요.');
            return;
        }

        // 제출 버튼 비활성화
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '제출 중...';

        try {
            const result = await this.reportManager.submitErrorReport(reportData);
            
            if (result.success) {
                this.showSuccessMessage(result);
                this.closeReportModal();
            } else {
                throw new Error(result.message || '신고 제출에 실패했습니다.');
            }
        } catch (error) {
            console.error('신고 제출 오류:', error);
            alert('신고 제출 중 오류가 발생했습니다: ' + error.message);
            
            // 버튼 복구
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // 성공 메시지 표시
    showSuccessMessage(result) {
        const successHTML = `
            <div id="successMessage" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: 0 6px 20px rgba(40, 167, 69, 0.3);
                z-index: 10001;
                max-width: 300px;
                font-family: 'Malgun Gothic', sans-serif;
                animation: slideInRight 0.3s ease-out;
            ">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 18px;">✅</span>
                    <strong>신고 완료</strong>
                </div>
                <div style="font-size: 14px; line-height: 1.4;">
                    ${result.message}
                </div>
                <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">
                    신고 ID: ${result.reportId.substring(0, 8)}...
                </div>
            </div>
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', successHTML);

        // 3초 후 자동으로 제거
        setTimeout(() => {
            const message = document.getElementById('successMessage');
            if (message) {
                message.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => message.remove(), 300);
            }
        }, 3000);
    }

    // 관리자용 신고 목록 표시 (개발자 도구용)
    async showReportList() {
        const reports = await this.reportManager.getAllReports();
        console.group('📋 오류 신고 목록');
        console.table(reports);
        console.groupEnd();
        
        if (reports.length === 0) {
            console.log('아직 신고된 오류가 없습니다.');
        }
        
        return reports;
    }

    // 통계 표시 (개발자 도구용)
    async showStats() {
        const stats = await this.reportManager.getReportStats();
        console.group('📊 오류 신고 통계');
        console.log('전체 신고:', stats.total);
        console.log('대기 중:', stats.pending);
        console.log('해결됨:', stats.resolved);
        console.log('최근 7일:', stats.recent);
        console.log('유형별:', stats.byType);
        console.log('제공소별:', stats.byStation);
        console.groupEnd();
        
        return stats;
    }
}

// 전역 인스턴스 생성
window.errorReportUI = new ErrorReportUI();
