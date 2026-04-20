# 🔗 LinkVault

**Your personal link management hub — save, organize, and share your bookmarks beautifully.**

LinkVault is a full-stack web application that lets you save links from anywhere on the internet, organize them into collections, track click analytics, and share a public profile page with the world. Think of it as your own customizable bookmark manager with superpowers.

---

## ✨ What Can You Do With LinkVault?

- **Save Links Instantly** — Paste any URL and LinkVault auto-fetches the title, description, favicon, and thumbnail for you.
- **Organize With Collections** — Group your links into named collections (e.g., "Design Inspiration", "Dev Tools", "Reading List").
- **Tag Everything** — Add color-coded tags to links for quick filtering and search.
- **Track Analytics** — See how many people clicked your shared links, where they came from, and when.
- **Public Profile Page** — Get your own `linkvault.app/u/yourname` page that showcases your curated links and collections.
- **Import & Export** — Bring in bookmarks from your browser or export your data anytime.
- **Upgrade With Razorpay** — Free tier to get started, with a Pro plan for power users (payment handled via Razorpay).

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| **React 19** | UI library |
| **Vite 8** | Lightning-fast dev server & bundler |
| **Tailwind CSS 3** | Utility-first styling |
| **React Router 6** | Client-side routing |
| **Clerk** | Authentication (sign up, sign in, session management) |
| **Framer Motion** | Smooth animations & transitions |
| **Recharts** | Analytics charts & graphs |
| **Lucide React** | Beautiful icon set |
| **Lenis** | Smooth scrolling |
| **React Hot Toast** | Toast notifications |

### Backend
| Tool | Purpose |
|------|---------|
| **Node.js** | Runtime |
| **Express 5** | REST API framework |
| **Supabase** | PostgreSQL database + storage |
| **Clerk (Express SDK)** | Auth middleware (verifies JWT tokens) |
| **Helmet** | Security headers |
| **Morgan** | HTTP request logging |
| **Rate Limiter** | API abuse protection (200 req / 15 min) |
| **Cheerio** | Server-side HTML parsing for link metadata scraping |
| **Razorpay** | Payment processing |
| **node-cron** | Scheduled background tasks |

---

## 📁 Project Structure

```
linkvault/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, Navbar, AppLayout
│   │   │   └── links/         # LinkCard, LinkForm, etc.
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AllLinks.jsx
│   │   │   ├── Collections.jsx
│   │   │   ├── CollectionDetail.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── PublicProfile.jsx
│   │   │   ├── PublicCollection.jsx
│   │   │   └── PublicPageView.jsx
│   │   ├── context/           # React context providers
│   │   ├── lib/               # API client & utilities
│   │   ├── App.jsx            # Route definitions
│   │   └── main.jsx           # Entry point
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/                   # Express API server
│   ├── routes/
│   │   ├── links.js           # CRUD for links + metadata scraping
│   │   ├── collections.js     # CRUD for collections
│   │   ├── analytics.js       # Click tracking & dashboard stats
│   │   ├── profile.js         # User profile management
│   │   ├── payment.js         # Razorpay order creation & verification
│   │   └── public.js          # Public profile & collection endpoints
│   ├── middleware/             # Auth & validation middleware
│   ├── config/                # Supabase client setup
│   ├── utils/                 # Helper functions
│   ├── schema.sql             # Full database schema (run in Supabase)
│   ├── server.js              # App entry point
│   └── package.json
│
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

Before you start, make sure you have:

- **Node.js** (v18 or higher) — [Download here](https://nodejs.org)
- **A Supabase account** — [Sign up free](https://supabase.com)
- **A Clerk account** — [Sign up free](https://clerk.com)
- **A Razorpay account** (optional, for payments) — [Sign up](https://razorpay.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Raghunandan0777/LinkVault.git
cd LinkVault
```

### 2. Set Up the Database

1. Go to your **Supabase project dashboard**
2. Open the **SQL Editor**
3. Copy the contents of `backend/schema.sql` and run it
4. This creates all tables, indexes, and functions automatically

### 3. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-key
CLERK_SECRET_KEY=sk_test_your-clerk-secret

# Razorpay (optional — needed only for payments)
RAZORPAY_KEY_ID=rzp_test_your-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

Start the backend:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 4. Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-key
```

Start the frontend:

```bash
npm run dev
```

Open your browser at `http://localhost:5173` — you should see the landing page! 🎉

---

## 🗄️ Database Schema

LinkVault uses **Supabase (PostgreSQL)** with the following tables:

| Table | What It Stores |
|-------|---------------|
| `users` | User profiles synced from Clerk (username, bio, social links, plan info) |
| `links` | Saved bookmarks with auto-scraped metadata (title, thumbnail, favicon) |
| `collections` | Named groups of links (can be public or private) |
| `tags` | Color-coded labels for organizing links |
| `link_tags` | Many-to-many relationship between links and tags |
| `link_clicks` | Individual click events with timestamp and referrer |
| `profile_views` | Tracks visits to public profile pages |
| `payments` | Razorpay payment records for plan upgrades |
| `link_saves` | Tracks when users save/bookmark links |

Row Level Security (RLS) is enabled on all core tables for data isolation.

---

## 🔌 API Endpoints

All API routes are prefixed with `/api`.

### Links
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/links` | Fetch all links for the logged-in user |
| `POST` | `/api/links` | Save a new link (auto-scrapes metadata) |
| `PUT` | `/api/links/:id` | Update a link |
| `DELETE` | `/api/links/:id` | Delete a link |

### Collections
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/collections` | List all collections |
| `POST` | `/api/collections` | Create a new collection |
| `PUT` | `/api/collections/:id` | Update a collection |
| `DELETE` | `/api/collections/:id` | Delete a collection |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics` | Dashboard stats (clicks, views, top links) |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profile` | Get current user's profile |
| `PUT` | `/api/profile` | Update profile settings |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payment/create-order` | Create a Razorpay order |
| `POST` | `/api/payment/verify` | Verify payment & upgrade plan |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/public/:username` | Get a user's public profile |
| `GET` | `/api/public/:username/collections/:slug` | Get a public collection |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server status check |

---

## 🔒 Authentication Flow

1. User clicks **"Get Started Free"** on the landing page
2. Clerk handles the sign-up/sign-in flow (email, Google, GitHub, etc.)
3. On first login, the backend auto-creates a user record in Supabase
4. Every API request includes a Clerk JWT token in the `Authorization` header
5. The backend verifies the token using `@clerk/express` middleware

---

## 📊 Pages Overview

| Page | Route | What It Does |
|------|-------|-------------|
| Landing Page | `/` | Marketing page with features, pricing, and CTA |
| All Links | `/links` | Main dashboard — view, search, filter, and manage all saved links |
| Collections | `/collections` | Browse and manage link collections |
| Collection Detail | `/collections/:id` | View links inside a specific collection |
| Analytics | `/analytics` | Charts and stats — clicks over time, top links, referrers |
| Settings | `/settings` | Edit profile, social links, username, and manage account |
| Public Profile | `/u/:username` | Shareable public page showing user's curated links |
| Public Collection | `/u/:username/:slug` | Public view of a specific collection |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** this repository
2. **Create a branch** for your feature: `git checkout -b feature/awesome-thing`
3. **Commit your changes**: `git commit -m "Add awesome thing"`
4. **Push to your fork**: `git push origin feature/awesome-thing`
5. **Open a Pull Request** and describe what you've built

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 💬 Questions?

If you run into any issues or have ideas for new features, feel free to [open an issue](https://github.com/Raghunandan0777/LinkVault/issues) on GitHub.

---

**Built with ❤️ by [Raghunandan](https://github.com/Raghunandan0777)**
