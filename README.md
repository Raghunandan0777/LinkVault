# LinkVault

A bookmark manager that doesn't suck. Save links, auto-enrich them with metadata, organize into collections, and get AI-powered search — all in one place.

I built this because I was tired of browser bookmarks being a graveyard. LinkVault actually makes your saved links useful again.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)

---

## What it does

- **Paste a URL → get a rich bookmark.** Title, description, favicon, thumbnail — all auto-scraped.
- **AI tags every link for you.** Uses Gemini to classify links ("Development", "Design", "Tutorial", etc). No API key? Falls back to smart domain-based tagging.
- **Semantic search.** Ask "that article about React performance" instead of remembering exact titles.
- **Collections with drag-and-drop.** Organize links into groups. Reorder them however you want.
- **Teams.** Invite people, assign roles, share collections. Built for small teams who share resources.
- **Analytics.** See who's clicking your shared links, where they're from, and what's trending.
- **Import your bookmarks.** Export from Chrome/Firefox → upload the HTML file → done. Handles duplicates.
- **Export everything.** JSON or CSV. Your data is yours.
- **Health checker.** A background job pings all your URLs every 6 hours and flags broken ones. There's also a manual "Check Health" button.
- **Duplicate warning.** If you try to save a URL you already have, it tells you and lets you decide.
- **Chrome extension.** One-click save from any page. Shows AI-generated tags after saving.
- **Public profile.** Share your curated links at `/u/yourname`.

---

## Tech

**Frontend:** React 19, Vite, Tailwind, Framer Motion, Clerk (auth), Recharts

**Backend:** Node.js, Express 5, Supabase (Postgres + RLS), Gemini Flash (AI), Cheerio (scraping), Razorpay (payments)

**Extension:** Chrome Manifest V3

---

## Setup

You'll need Node 18+, a [Supabase](https://supabase.com) project, and a [Clerk](https://clerk.com) app. Razorpay and Gemini API keys are optional — everything works without them, just with reduced functionality.

### Clone and install

```bash
git clone https://github.com/Raghunandan0777/LinkVault.git
cd LinkVault

cd backend && npm install
cd ../frontend && npm install
```

### Database

Go to your Supabase SQL Editor and run these files in order:

1. `backend/schema.sql` — core tables
2. `backend/migration_teams.sql` — teams feature
3. `backend/migration_health_check.sql` — health checker columns

### Environment variables

**backend/.env**
```
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
GEMINI_API_KEY=...
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Run it

```bash
# Terminal 1
cd backend && npx nodemon

# Terminal 2
cd frontend && npm run dev
```

Open http://localhost:5173

### Chrome extension (optional)

1. Go to `chrome://extensions`
2. Turn on Developer Mode
3. Load unpacked → pick the `browser-extension` folder

---

## Project structure

```
linkvault/
├── frontend/src/
│   ├── components/layout/     # Sidebar, navbar
│   ├── components/links/      # LinkCard, AddLinkModal, SearchModal
│   ├── pages/                 # AllLinks, Collections, Analytics, Teams, Settings
│   ├── context/               # App-wide state
│   └── lib/api.js             # API client
│
├── backend/
│   ├── routes/                # links, collections, analytics, teams, profile, payment, public
│   ├── utils/aiTagger.js      # Gemini integration
│   ├── utils/healthChecker.js # Broken link detection cron
│   ├── utils/enrichUrl.js     # URL metadata scraping
│   └── server.js
│
└── browser-extension/         # Chrome MV3 extension
```

---

## API endpoints

Everything's under `/api`. Auth is via Clerk JWT in the `Authorization` header.

**Links** — `GET /links` · `POST /links` · `PATCH /links/:id` · `DELETE /links/:id` · `GET /links/health-check` · `POST /links/import` · `GET /links/export?format=json` · `POST /links/search/ai`

**Collections** — `GET /collections` · `POST /collections` · `PATCH /collections/:id` · `DELETE /collections/:id` · `PATCH /collections/:id/reorder`

**Teams** — `GET /teams` · `POST /teams` · `DELETE /teams/:id` · `POST /teams/:id/invite` · `GET /teams/:id/members` · `POST /teams/:id/collections/:colId`

**Other** — `GET /profile` · `PATCH /profile` · `GET /analytics/overview` · `POST /payment/order` · `POST /payment/verify` · `GET /public/:username`

---

## Database

11 tables in Supabase with Row Level Security:

`users` · `links` · `collections` · `tags` · `link_tags` · `link_clicks` · `profile_views` · `payments` · `teams` · `team_members` · `team_collections`

The `links` table has `is_broken`, `health_status`, and `last_checked_at` columns for the health checker.

---

## How auth works

User signs up via Clerk (email/Google/GitHub) → gets a JWT → backend verifies it with `@clerk/express` → auto-creates a Supabase user record on first login. Every API call sends the token in the header.

---

## Contributing

Fork it, branch it, PR it. Standard flow. Issues and feature ideas welcome.

---

## License

MIT

---

Built by [Raghunandan](https://github.com/Raghunandan0777)
