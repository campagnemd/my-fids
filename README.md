# MY-FIDS

인천국제공항 여객 출발 정보를 표시하는 개인용 실시간 전광판입니다.

## 프로젝트 구조

- `src/App.jsx`: 전광판 화면, 데이터 조회 및 관제 패널
- `src/settings.js`: 기본 설정과 `localStorage` 저장·검증
- `src/airlines.js`: 인천공항 운항 항공사 IATA/ICAO 코드 및 로컬 로고 매핑
- `src/AirlineLogo.jsx`: 16:9 로고 표시와 항공사 코드 폴백 배지
- `src/styles.css`: Tailwind CSS와 공통 스타일
- `public/airlines/v1`: FlightRadar24 인천공항 운항 현황에서 확인한 로컬 로고 자산
- `api/departures.js`: 공공데이터 API 키를 보호하는 Vercel 함수
- `vite.config.js`: React 빌드 및 레거시 브라우저 호환 설정

## 로컬 개발

Node.js 22와 pnpm을 사용합니다.

```bash
pnpm install
pnpm dev
```

브라우저에서 터미널에 표시된 로컬 주소를 열면 됩니다. Vercel API 함수까지 함께 테스트하려면 Vercel CLI의 `vercel dev`를 사용합니다.

## 검사 및 프로덕션 빌드

```bash
pnpm check
pnpm build
pnpm preview
```

빌드 결과는 `dist/`에 생성됩니다. JSX 변환, Tailwind CSS 생성, 자바스크립트·CSS 압축 및 구형 브라우저용 대체 번들이 빌드 단계에서 처리됩니다.

## 배포 환경변수

Vercel 프로젝트에 다음 환경변수가 필요합니다.

```text
DATA_GO_KR_SERVICE_KEY=공공데이터포털_인증키
```

환경변수는 저장소에 커밋하지 않습니다. `main` 브랜치에 푸시하면 Vercel이 Vite 프로젝트를 자동으로 빌드하고 배포합니다.

## 항공사 로고

로고는 인천공항 출발 API의 실제 운항사 코드와 FlightRadar24 인천공항 출발·도착 현황의 편별 로고를 대조해 로컬 PNG로 저장합니다. 전체 로고 용량은 작게 유지하고 `/airlines/v1/*`에는 1년 브라우저 캐시를 적용합니다. 로고 파일이 없거나 로드에 실패하면 항공사 코드 배지를 표시합니다.

로고와 항공사 명칭의 권리는 각 항공사에 있으며, 데이터 대조 출처는 [Flightradar24 airline database](https://www.flightradar24.com/data/airlines/)입니다. 로고를 교체할 때는 캐시 무효화를 위해 `v1` 디렉터리 버전도 함께 올립니다.
