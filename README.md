# JipClick - 청소 서비스 플랫폼

청소 서비스 예약 및 관리를 위한 웹 애플리케이션

## 프로젝트 구조

```
repo/
├── frontend/          # Next.js 프론트엔드
│   ├── src/
│   ├── public/
│   └── package.json
│
└── backend/           # Express.js 백엔드
    ├── src/
    ├── prisma/
    └── package.json
```

## 기술 스택

### Frontend
- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JWT
- **File Upload**: Multer

## 시작하기

### Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

Frontend는 http://localhost:3000 에서 실행됩니다.

### Backend 실행

```bash
cd backend
npm install
npm run dev
```

Backend는 http://localhost:5000 에서 실행됩니다.

## 주요 기능

- 청소 서비스 소개 및 갤러리
- 실시간 견적 계산기
- 예약 관리 시스템
- 사용자 인증 (회원가입/로그인)
- 리뷰 작성 및 관리
- 관리자 대시보드

## 환경 변수 설정

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
PORT=5000
```

## 라이선스

Private
