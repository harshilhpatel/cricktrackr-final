import React from 'react';

export default function DocsPage() {
  return (
    <div>
      <section className="section">
        <div className="section-header">
          <div>
            <div className="section-title">CrickTrackr+ Documentation</div>
            <div className="section-subtitle">
              Overview of features, flows, and API endpoints used by the app.
            </div>
          </div>
        </div>
      </section>

      {/* Static cheat sheet of the app’s main pieces. */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Core Features</div>
          <div className="card-meta">
            - User auth with JWT (register/login, protected routes)<br />
            - Light/Dark/Stadium Night theme cycle (persisted)<br />
            - Matches: live feed + cached last 5 days in Mongo, win probability for live games<br />
            - Manual fixtures seed script for upcoming matches<br />
            - Players: list/edit/delete, add form, import from API by ID, sample seeds preloaded<br />
            - Player comparison radar + stat table
          </div>
        </div>

        <div className="card">
          <div className="card-title">Tech Stack</div>
          <div className="card-meta">
            - Frontend: React + Vite, Axios, React Router<br />
            - Backend: Node + Express, Mongoose, JWT auth<br />
            - Database: MongoDB Atlas<br />
            - External: CricAPI (`/v1/currentMatches`, `players_info` for imports)
          </div>
        </div>

        <div className="card">
          <div className="card-title">User Flows</div>
          <div className="card-meta">
            1) Register/Login → token stored in memory/localStorage, auth header set globally<br />
            2) Navigate navbar (Home, Matches, Players, Add Player, Stats, Docs)<br />
            3) Matches: live+cached fixtures, click card for details & win probability<br />
            4) Players: view/import/edit/delete; Add Player to insert manually<br />
            5) Compare: pick two players, view radar + stat table
          </div>
        </div>

        <div className="card">
          <div className="card-title">API Endpoints (Backend)</div>
          <div className="card-meta">
            - `POST /api/auth/register` — create user, returns token & user<br />
            - `POST /api/auth/login` — login, returns token & user<br />
            - `GET /api/matches` — live + cached recent matches (requires auth)<br />
            - `GET /api/players` — list players (requires auth)<br />
            - `POST /api/players` — add player (requires auth)<br />
            - `POST /api/players/import` — import players by CricAPI IDs (requires auth)
          </div>
        </div>

        <div className="card">
          <div className="card-title">Environment</div>
          <div className="card-meta">
            Backend `.env`<br />
            - `MONGO_URI` MongoDB connection string<br />
            - `JWT_SECRET` Secret for signing tokens<br />
            - `CRICKET_API_KEY` CricAPI key<br />
            - `PORT` Backend port (e.g., 5050)<br />
            Frontend `.env`<br />
            - `VITE_API_URL` Backend URL (e.g., `http://localhost:5050`)
          </div>
        </div>

        <div className="card">
          <div className="card-title">Notes & Limitations</div>
          <div className="card-meta">
            - Matches are cached in Mongo; seed upcoming fixtures via `scripts/seedUpcomingMatches.js` if API lacks them.<br />
            - Live feed depends on CricAPI quota/availability; cached recent games still show if API is down.<br />
            - Auth is JWT-based; token stored in localStorage for persistence.<br />
            - Player import uses CricAPI `players_info` IDs; ensure `CRICKET_API_KEY` is set.<br />
            - Update `VITE_API_URL` if backend port changes; restart frontend dev server after changes.
          </div>
        </div>
      </div>
    </div>
  );
}
