const fs = require('fs');
const path = require('path');

console.log('🔧 Vercel 배포를 위한 환경변수 주입 시작...');

// 환경변수 읽기
const envVars = {
    KAKAO_API_KEY: process.env.KAKAO_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    DATABASE_TYPE: process.env.DATABASE_TYPE || 'supabase'
};

console.log('📋 환경변수 확인:');
Object.keys(envVars).forEach(key => {
    console.log(`- ${key}: ${envVars[key] ? '✅ 설정됨' : '❌ 없음'}`);
});

// index.html 파일 읽기
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// 환경변수 교체
const envScript = `
    <!-- Vercel 배포시 환경변수 주입 -->
    <script>
        window.ENV = {
            KAKAO_API_KEY: '${envVars.KAKAO_API_KEY || ''}',
            SUPABASE_URL: '${envVars.SUPABASE_URL || ''}',
            SUPABASE_ANON_KEY: '${envVars.SUPABASE_ANON_KEY || ''}',
            DATABASE_TYPE: '${envVars.DATABASE_TYPE || 'local'}'
        };
        console.log('🚀 Vercel 배포모드: 환경변수 주입됨');
    </script>`;

// 기존 로컬 개발용 스크립트를 Vercel용으로 교체
const localEnvRegex = /<!-- 로컬 개발용 임시 환경변수 설정[\s\S]*?<\/script>/;
if (localEnvRegex.test(indexContent)) {
    indexContent = indexContent.replace(localEnvRegex, envScript);
} else {
    // 만약 기존 스크립트가 없다면 head 태그 끝에 추가
    indexContent = indexContent.replace('</head>', `${envScript}\n</head>`);
}

// 수정된 내용을 파일에 쓰기
fs.writeFileSync(indexPath, indexContent);

console.log('✅ 환경변수 주입 완료!');
console.log('📁 수정된 파일: index.html');
