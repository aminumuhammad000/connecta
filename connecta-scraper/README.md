# Connecta Job Scraper Service

An external job-scraping service that collects job/gig listings from multiple online job platforms and synchronizes them with the Connecta backend.

## Features

- ✅ **Playwright-based scraping** - Reliable headless browser automation
- ✅ **24-hour automated scheduling** - Runs automatically via cron
- ✅ **Manual trigger support** - Run on-demand via CLI
- ✅ **Deduplication** - Tracks jobs by `(source + external_id)`
- ✅ **Change detection** - Automatically detects new, updated, and removed jobs
- ✅ **Error handling** - Retry logic with exponential backoff
- ✅ **Rate limiting** - Prevents overwhelming target sites
- ✅ **Secure API integration** - API key authentication with Connecta

## Setup

### 1. Install Dependencies

```bash
cd connecta-scraper
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3. Configure Environment

Copy `env.example` to `.env`:

```bash
cp env.example .env
```

Edit `.env` and set your configuration:

```env
CONNECTA_API_URL=http://localhost:5000/api
CONNECTA_API_KEY=your-secret-api-key-here
SCRAPE_INTERVAL_HOURS=24
```

### 4. Update Connecta Server

Add the API key to your Connecta server `.env`:

```env
SCRAPER_API_KEY=your-secret-api-key-here
```

## Usage

### Development Mode

Run in development with auto-restart:

```bash
npm run dev
```

### Manual Trigger

Run scrapers once and exit:

```bash
npm run scrape:manual
```

### Production

Build and run:

```bash
npm run build
npm start
```

## Adding New Scrapers

1. Copy `src/scrapers/example.scraper.ts`
2. Rename it to `yourplatform.scraper.ts`
3. Update the class name and configuration
4. Customize the selectors for the target platform
5. Export it in `src/scrapers/index.ts`
6. Add it to the scrapers array in `src/index.ts`

Example:

```typescript
import { YourPlatformScraper } from "./scrapers/yourplatform.scraper";

const scrapers = [
  new JobbermanScraper(),
  new YourPlatformScraper(), // Add here
];
```

## How It Works

1. **Scraping**: Each scraper navigates to a job platform and extracts listings
2. **Normalization**: Data is normalized to a standard schema
3. **Diff Detection**: Compares current scrape with existing database
4. **Synchronization**: 
   - Creates/updates new jobs via `POST /api/external-gigs`
   - Deletes removed jobs via `DELETE /api/external-gigs/:source/:externalId`

## Architecture

```
connecta-scraper/
├── src/
│   ├── scrapers/          # Platform-specific scrapers
│   ├── services/          # Business logic
│   ├── scheduler/         # Cron scheduling
│   ├── utils/             # Utilities (logger, rate limiter)
│   ├── config/            # Configuration
│   └── types/             # TypeScript definitions
```

## Logging

All operations are logged with timestamps:

```
[INFO] 2026-01-08T12:00:00.000Z - Starting scraping job...
[INFO] 2026-01-08T12:00:05.000Z - Running scraper: jobberman
[INFO] 2026-01-08T12:00:10.000Z - Scraped 50 gigs from jobberman
[INFO] 2026-01-08T12:00:15.000Z - ✅ Created/Updated gig: Frontend Developer from jobberman
```

## Error Handling

- **Network failures**: Automatic retry with exponential backoff
- **Scraping timeouts**: Configurable timeout with fallback
- **DOM changes**: Graceful degradation, logs errors
- **API failures**: Retries with delay, doesn't delete gigs on source failure

## Security

- API key authentication required for all Connecta API calls
- Secrets stored in `.env` file (never committed)
- HTTPS recommended for production API calls

## Troubleshooting

### "API key required" error

Make sure:
1. `.env` file exists with `CONNECTA_API_KEY` set
2. Connecta server has `SCRAPER_API_KEY` in its `.env`
3. Both values match exactly

### No jobs scraped

- Check if the target website structure changed
- Update selectors in the scraper file
- Enable debug logging: `LOG_LEVEL=debug`

### Playwright errors

Install browsers again:

```bash
npx playwright install
```

## License

MIT
