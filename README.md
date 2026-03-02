# Dev Tools Hub (Spring Boot + React)

Developer tools platform with one deploy artifact:
- Spring Boot backend API
- React frontend served as static assets by Spring Boot
- Docker-ready deployment

## Stack
- Backend: Java 17+, Spring Boot 3
- Frontend: React + Vite

## Current live tool sections
- `UUID`:
  - `/uuid-generator`
  - `/version1`, `/version4`, `/version7`, `/nil`, `/guid`
  - `/dev-corner`
- `Developer Tools`:
  - `/developer-tools`
  - `/tools/json-formatter`
  - `/tools/base64`
  - `/tools/regex-tester`
  - `/tools/cron-generator`
  - `/tools/sql-formatter`
  - `/tools/jwt-decoder`
  - `/tools/hash-generator`
  - `/tools/diff-checker`
- `Converters`:
  - `/converters`
  - `/tools/xml-to-json`
  - `/tools/csv-to-json`
  - `/tools/markdown-to-html`
  - `/tools/yaml-to-json`
- `Generators`:
  - `/generators`
  - `/tools/password-generator`
  - `/tools/lorem-ipsum`
  - `/tools/qr-generator`
  - `/tools/random-data`
- API docs:
  - `/api-docs`

## Backend API
- `GET /api/uuid`
- `GET /api/uuids?count=10`
- `GET /api/generate?version=v4|v1|v7|nil&count=20&guidFormat=false`
- `GET /api/guid?count=5`

## Run locally (single deploy mode)
```bash
cd backend
mvn spring-boot:run
```

Open:
- `http://localhost:8080`

## Run frontend only (dev mode)
```bash
cd frontend
npm install
npm run dev
```

If backend runs separately:
```bash
VITE_API_BASE=http://localhost:8080/api
```

## Tests
Frontend utility tests:
```bash
cd frontend
npm run test:run
```

Backend API tests:
```bash
cd backend
mvn test "-Dskip.frontend=true"
```

This includes:
- API tests for UUID endpoints
- Route smoke tests for key SPA pages

## Docker
```bash
docker compose up --build
```

Open:
- `http://localhost:8081` (mapped in compose)

## UX notes
- Two ad placeholders are used (top and bottom) for cleaner layout.
- Copy UX uses toast feedback (`Copied to clipboard`) without changing button text.
- Quick Links in sidebar are contextual and match the active top menu section.

## SEO / indexing
- `robots.txt`, `sitemap.xml`
- canonical + OG/Twitter meta
- privacy + terms pages
- `ads.txt` for AdSense

## Before production
1. Replace placeholder contact details in legal pages.
2. Keep real AdSense client/slot IDs only after approval.
3. Use custom domain + HTTPS.
4. Submit sitemap in Google Search Console.

## Important
Search ranking cannot be guaranteed. This project provides technical SEO baseline and good UX structure; ranking still depends on competition, domain trust, content quality, and backlinks.
