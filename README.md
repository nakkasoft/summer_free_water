# 서울시 여름철 무료 생수 제공 위치 지도

서울시 각 구에서 운영하는 여름철 무료 생수 제공 위치를 카카오맵으로 확인할 수 있는 웹 애플리케이션입니다.

## 🎯 주요 기능

- **지도 기반 위치 표시**: 카카오맵을 활용한 생수 제공소 위치 표시
- **필터링**: 구별, 제공 방식별 필터링 기능
- **검색**: 장소명 및 주소로 검색 가능
- **내 주변 검색**: 사용자 위치 기반 근처 생수 제공소 찾기
- **상세 정보**: 운영시간, 연락처, 운영 기간 등 상세 정보 제공
- **반응형 디자인**: 모바일/데스크톱 대응

## 🏗️ 프로젝트 구조

```
summer_free_water/
├── index.html                    # 메인 HTML 파일
├── config.js                     # 설정 파일
├── .env                         # 환경 변수 (로컬용)
├── data/
│   └── water_stations.json     # 생수 제공소 데이터
├── css/
│   └── styles.css              # 스타일시트
├── js/
│   ├── utils/
│   │   └── config-loader.js    # 설정 로더
│   ├── database/
│   │   ├── database-interface.js     # 데이터베이스 추상 인터페이스
│   │   ├── local-database.js         # 로컬 JSON 데이터베이스
│   │   ├── supabase-database.js      # Supabase 데이터베이스 (예정)
│   │   ├── firebase-database.js      # Firebase 데이터베이스 (예정)
│   │   └── database-factory.js       # 데이터베이스 팩토리
│   ├── services/
│   │   └── water-station-service.js  # 생수 제공소 서비스
│   └── components/
│       ├── map-manager.js            # 지도 관리자
│       └── ui-controller.js          # UI 컨트롤러
└── README.md
```

## 🚀 시작하기

### 사전 요구사항

1. **카카오맵 API 키**: [카카오 개발자센터](https://developers.kakao.com/)에서 발급
2. **웹서버**: CORS 문제 해결을 위한 로컬 웹서버 필요

### 설치 및 실행

1. **프로젝트 복사**
   ```bash
   git clone <repository-url>
   cd summer_free_water
   ```

2. **API 키 설정**
   - `js/utils/config-loader.js` 파일에서 `KAKAO_API_KEY` 값을 본인의 API 키로 변경
   ```javascript
   this.config = {
       KAKAO_API_KEY: 'YOUR_ACTUAL_API_KEY_HERE',
       // ...
   };
   ```

3. **로컬 웹서버 실행**
   ```bash
   # Python 사용
   python -m http.server 8000
   
   # Node.js 사용 (http-server 설치 후)
   npx http-server
   
   # PHP 사용
   php -S localhost:8000
   ```

4. **브라우저에서 접속**
   ```
   http://localhost:8000
   ```

## 💾 데이터베이스 구조

### 현재 구조 (로컬 JSON)

```json
{
  "id": 1,
  "position": {"lat": 37.554768, "lng": 126.974568},
  "title": "오!빙고! 공동작업장",
  "address": "서울특별시 중구 후암로60길16-9",
  "status": "운영중",
  "operator": "중구청",
  "operatingHours": "10:00-생수소진시까지",
  "operatingPeriod": "2025년 7~8월",
  "type": "생수제공",
  "phone": "02-3396-4000",
  "district": "중구",
  "created_at": "2025-08-13T00:00:00Z",
  "updated_at": "2025-08-13T00:00:00Z"
}
```

### 향후 클라우드 DB 마이그레이션

프로젝트는 향후 Supabase 또는 Firebase로 마이그레이션할 수 있도록 모듈화되어 있습니다.

**Supabase 마이그레이션 시:**
```javascript
// config-loader.js에서 설정 변경
DATABASE_TYPE: 'supabase',
SUPABASE_URL: 'your-project-url',
SUPABASE_ANON_KEY: 'your-anon-key'
```

**Firebase 마이그레이션 시:**
```javascript
// config-loader.js에서 설정 변경
DATABASE_TYPE: 'firebase',
FIREBASE_CONFIG: {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  // ...
}
```

## 🔧 주요 컴포넌트

### ConfigLoader
- 환경 변수 및 설정 관리
- 로컬/개발/운영 환경별 설정 분리

### DatabaseInterface
- 모든 데이터베이스 구현체의 공통 인터페이스
- 확장 가능한 구조 제공

### LocalDatabase
- JSON 파일 기반 로컬 데이터베이스
- 개발 및 프로토타이핑용

### WaterStationService
- 비즈니스 로직 처리
- 데이터 필터링, 검색, 근처 찾기 등

### MapManager
- 카카오맵 API 관리
- 마커 표시, 오버레이 관리

### UIController
- 사용자 인터페이스 제어
- 이벤트 처리, 필터링, 검색 등

## 📱 지원하는 제공 방식

- **생수제공**: 직접 생수 배급
- **냉장고**: 24시간 자율 이용 냉장고
- **냉장고(전화인증)**: 전화 인증 후 이용 가능한 냉장고

## 🗺️ 지원 지역

현재 다음 서울시 구역의 데이터가 포함되어 있습니다:
- 중구
- 중랑구
- 성북구
- 도봉구
- 노원구
- 마포구

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요.

---

## 🔮 향후 계획

- [ ] Supabase 연동 완료
- [ ] Firebase 연동 완료
- [ ] 사용자 인증 시스템
- [ ] 관리자 페이지 (데이터 추가/수정/삭제)
- [ ] PWA 지원
- [ ] 푸시 알림 기능
- [ ] 다국어 지원
- [ ] 접근성 개선
- [ ] 자동화된 테스트 추가

## 🔧 문제 해결

### 카카오맵 SDK 로드 실패

**증상**: "카카오 맵 SDK 로드에 실패했습니다" 에러 발생

**원인 및 해결방법**:

1. **API 키 문제**
   ```
   ❌ 에러: 유효하지 않은 카카오맵 API 키입니다
   ```
   - **해결**: [카카오 개발자센터](https://developers.kakao.com/)에서 API 키 발급
   - `js/utils/config-loader.js`에서 `KAKAO_API_KEY` 값 변경
   ```javascript
   KAKAO_API_KEY: 'your-actual-api-key-here'
   ```

2. **CORS 정책 문제**
   ```
   ❌ 에러: CORS policy blocked
   ```
   - **해결**: 로컬 웹서버 사용 필수
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # VS Code Live Server 확장 프로그램
   ```

3. **네트워크 연결 문제**
   ```
   ❌ 에러: 카카오맵 SDK 로드 시간이 초과되었습니다
   ```
   - **해결**: 
     - 인터넷 연결 상태 확인
     - 방화벽/프록시 설정 확인
     - VPN 사용 시 비활성화 후 테스트

4. **데이터 로드 실패**
   ```
   ❌ 에러: Failed to fetch data/water_stations.json
   ```
   - **해결**: 
     - `data/water_stations.json` 파일 존재 확인
     - 로컬 웹서버 사용 (file:// 프로토콜 사용 금지)

### 디버그 정보 확인

개발자 도구 콘솔에서 다음 로그들을 확인하세요:

```
✅ 설정 로드 성공
✅ 데이터베이스 초기화 완료  
✅ 카카오맵 SDK 로드 완료
✅ 컴포넌트 초기화 완료
✅ 앱 초기화 완료
```

문제가 발생한 단계에서 상세한 에러 정보가 표시됩니다.

### 일반적인 해결 순서

1. **개발자 도구 콘솔 확인** (F12)
2. **API 키 유효성 확인**
3. **로컬 웹서버 실행 확인**
4. **네트워크 연결 상태 확인**
5. **브라우저 캐시 삭제 후 재시도**