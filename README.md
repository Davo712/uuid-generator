# UUID Generator (Spring Boot + React)

Simple UUID v4 generator with:
- one deploy artifact (Spring Boot serves React build),
- Docker support,
- SEO and AdSense-ready structure.

## Stack
- Backend: Java 17+, Spring Boot 3
- Frontend: React + Vite

## Project structure
- `backend` - Spring Boot API + static hosting
- `frontend` - React source code

## API
- `GET /api/uuid` - generate one UUID v4
- `GET /api/uuids?count=5` - generate multiple UUID v4 (`1..100`)

## Run (single deploy mode)
From `backend`, build and run one application:

```bash
cd backend
mvn spring-boot:run
```

Open: `http://localhost:8080`

What happens:
- Maven builds frontend (`../frontend`) with Node/NPM managed by Maven plugin.
- Frontend `dist` is copied into Spring Boot static resources.
- One Spring Boot app serves both API and website.

## Run (separate dev mode)
For fast UI iteration:

```bash
cd frontend
npm install
npm run dev
```

In this mode set:

```bash
VITE_API_BASE=http://localhost:8080/api
```

To skip frontend build from Maven in backend tasks:

```bash
mvn test -Dskip.frontend=true
```

## Docker
Build and run with Docker Compose:

```bash
docker compose up --build
```

Open: `http://localhost:8080`

Files:
- `Dockerfile` - multi-stage build (`maven -> jre`)
- `docker-compose.yml` - one service exposing port `8080`

## SEO features included
- Optimized title and meta description
- Canonical URL
- Open Graph and Twitter metadata
- JSON-LD:
  - `WebApplication`
  - `WebSite`
  - `FAQPage`
- Semantic page sections with useful text content
- `robots.txt` and `sitemap.xml`
- Privacy and Terms pages for trust/compliance baseline

## AdSense readiness baseline
- Dedicated ad placeholders clearly marked as `Advertisement`
- Policy pages: `privacy.html`, `terms.html`
- No forced-click behavior
- No misleading ad labels

## Before production
1. Replace every `https://your-domain.com` in frontend metadata files.
2. Insert real AdSense client and slot IDs after AdSense approval.
3. Add real contact details in `privacy.html`.
4. Deploy with HTTPS.
5. Submit sitemap in Google Search Console.

## Ranking note
No implementation can guarantee first place in Google Search. This project includes technical SEO best practices, but ranking depends on competition, backlinks, domain trust, page speed, and ongoing content quality.
