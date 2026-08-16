# Embeddable Widget & Lead-Capture Platform

This capstone implements an embeddable widget platform where customers can create a widget, copy a single line of `<script>` tag, and embed it in any website. Submissions are validated, rate-limited, enriched with geo-location data, and stored safely in a multi-tenant backend.

## Features Built
- **Widget Management**: Authenticated CRUD API (JWT) for tenant-isolated widget management.
- **Widget Delivery**: Serves versioned/cached Javascript (`/widget.js`) and config endpoints.
- **Submission Protection**: CORS allowed, express-rate-limit used (10 req/min), honeypot spam protection.
- **Geo Enrichment Fallback**: Fetches IP data from ip-api.com and falls back to ipapi.co.
- **Safe Side Effects**: Simulates sending an email that does not break the main API path on failure.
- **Dashboard API**: Provides submissions and basic stats.

## Running the Project

1. Run the server:
   ```bash
   npm run start
   # or for development
   npm run dev
   ```
2. The server runs on `http://localhost:3000`.
3. To test the widget embedding on a second origin, run an HTTP server in the `test-site` directory:
   ```bash
   npx serve test-site -p 5000
   ```
   Or open `test-site/index.html` in your browser.

## Limitations
- This uses SQLite for simplicity in local testing, rather than PostgreSQL.
- The `widget.js` is rendered dynamically rather than using a static built bundle, to keep the repository lightweight.
