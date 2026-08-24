# FUL-EVAS — Examination Venue Allocation System

A working prototype for Federal University Lokoja's CSC 406 project: automated
venue allocation, clash-free timetabling, and invigilator assignment.

**Stack:** React (Vite) · Node.js/Express · MongoDB (Mongoose)

```
ful-evas-app/
  client/   React frontend — all 4 role dashboards
  server/   Express API — auth, scheduling & allocation engine, MongoDB models
```

## What you'll see

Visiting the frontend URL now opens the **public landing page** first — hero,
an auto-rotating carousel of real campus photos, a public venue search (no
login needed), the full venue showcase, and a campus map. "Sign in" (or
"Staff / Admin sign in") takes you to the role-based login; "← Back to site"
returns to the landing page. Signing in successfully — or reloading with a
still-valid session — skips straight to that role's dashboard.

## Admin Analytics

A dedicated **Analytics** screen (admin-only, in the sidebar) aggregates the
live venue, course, and invigilator data already loaded elsewhere in the
app — no separate backend endpoint needed. It shows overall seat
utilisation, how many venues are at full capacity or still unassigned, a
per-venue utilisation breakdown sorted highest-first, and student
registration counts by department.

## School branding

The Federal University Lokoja crest (`client/public/ful-logo.png`) replaces
the placeholder icon everywhere a school mark appears — the landing page
nav, the sidebar, the login screen, and the browser tab favicon. To swap in
a different or higher-resolution crest later, just replace that file; every
place it's used pulls from the same single image.

## Quick start

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and set `MONGO_URI`. The fastest free option is
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) — create a free
M0 cluster, add a database user, allow your IP (or `0.0.0.0/0` for local dev),
and copy the connection string in. A local `mongod` instance works too.

```bash
npm run seed   # loads sample venues, courses, students, invigilators, demo logins
npm run dev    # starts the API on http://localhost:4000
```

Demo login accounts (password `password` for all, printed again at the end of `npm run seed`):

| Role | Username |
|---|---|
| Administrator | `FUL/STAFF/ADMIN` |
| Exam Officer | `FUL/STAFF/OFFICER` |
| Invigilator | `FUL/STAFF/0231` |
| Student | `FUL/CSC/22/0001` |

### 2. Frontend

```bash
cd client
npm install
npm run dev    # starts on http://localhost:5173
```

That's it — open the printed URL. **The client works even without the backend
running:** it detects whether the API is reachable and falls back to bundled
sample data with a visible "Demo data (backend offline)" indicator, so you can
always demo the UI even if MongoDB isn't set up yet.

## What's real vs. what's demo-scaffolded

- **The scheduling and allocation engine is real**, not mocked — see
  `server/src/engine/scheduler.js` and `allocator.js`, each with a full unit
  test suite (`npm test` in `server/`, 13 tests, all passing). It implements
  the graph-colouring / bin-packing approach from the project's SDD.
- **Auth is real** — JWT tokens, bcrypt-hashed passwords, role-based route
  guards (`server/src/middleware/auth.js`).
- **The database layer is real Mongoose/MongoDB**, matching the ER model
  from the Database Design document, adapted to MongoDB's document style
  (see `server/src/models/`).
- **Course/student CSV import** and a few admin actions are wired to show
  the right UI feedback but stop short of a full bulk-import parser — the
  `POST /courses/import` endpoint exists and is easy to extend with a CSV
  parser (`papaparse` is a good fit).

## Venue photos

All **23** real Federal University Lokoja venues are seeded with actual
campus photos, stored in `client/public/venues/<venue-slug>/` and
referenced by each venue's `images` array in
`server/src/seed/seedData.js`. These are served directly by Vite — no
external API, no quota, no network dependency.

Click any venue card (landing page, Overview, or the admin Venues screen)
to open its detail view: a full photo gallery (every photo on file, not
just the cover image) and a **seating arrangement** tab showing exactly
which seats are filled, built from the same live capacity/usage data as
everywhere else in the app.

**To add photos for a new venue:**
1. Drop the image file(s) into a new folder under `client/public/venues/your-venue-slug/`
2. Add an `images: [...]` array (paths starting with `/venues/...`) to that
   venue's entry in `seedData.js`, along with a `mapX`/`mapY` position for
   the campus map (see the existing entries for the coordinate space)
3. Re-run `npm run seed`

Any venue with an empty `images` array falls back to Google Custom Search
(if configured — see below) or, failing that, hand-illustrated artwork in
the app's navy/gold/parchment style. Nothing breaks if a venue has no photo.

### Optional: Google Custom Search fallback

For venues without a real photo on file, the app can optionally pull one
image from Google Custom Search instead of falling straight to the
illustration:

1. Create a Google Cloud project and enable the **Custom Search API**.
2. Get an API key: <https://console.cloud.google.com/apis/credentials>
3. Create a **Programmable Search Engine** with image search turned on and
   set to search the whole web: <https://programmablesearchengine.google.com/>
4. Copy its Search engine ID (`cx`) into your `.env`.
5. Set both in `server/.env`:
   ```
   GOOGLE_API_KEY=your-key-here
   GOOGLE_CX=your-cx-here
   ```
6. Restart the server.

Free tier is 100 queries/day, which is plenty for a class demo — the backend
caches results for 12 hours per venue to stay well under that. If the key is
missing, invalid, or the quota is hit, the app falls back to the illustrated
artwork — nothing breaks either way.

## Security model

This section documents how access control actually works, since it's easy
to get this wrong in a way that *looks* fine in the UI but isn't.

**Authentication.** Login is `POST /api/v1/auth/login` with `{ role, id,
password }`. The server looks up the account by `username` + `role`,
compares the password against a bcrypt hash (`bcryptjs`, 10 rounds — plain
text or reversibly-encrypted passwords are never stored), and on success
signs a JWT (`jsonwebtoken`) containing the user's Mongo `_id`, their role,
and their `linkedId` (the Student/Invigilator record they own, if any).
That token is the only thing the frontend has to prove who it is on every
later request.

**Authorization (RBAC).** Every route that mutates data, and every route
that returns data that isn't meant to be public, is wrapped in two pieces
of middleware (`server/src/middleware/auth.js`):
- `requireAuth` — rejects the request (`401`) unless a valid, unexpired JWT
  is present.
- `requireRole("ADMIN", "EXAM_OFFICER", ...)` — rejects the request (`403`)
  unless the token's role is in the allowed list.

Routes scoped to *you specifically* (`/me/timetable`, `/me/assignments`,
`/me/profile`) never take an id from the client at all — they read
`req.user.linkedId`/`req.user.sub` off the verified token and query from
there. There is no `?studentId=` parameter anywhere a client could edit to
pull someone else's data.

**What's intentionally public.** The venue directory, course catalog, and
aggregate seat-occupancy numbers (`GET /venues`, `/courses`, `/allocation`)
have no auth on them — they power the public marketing site's venue
showcase and the "find my exam venue" lookup, which are meant to work for
a visitor who isn't signed in at all. Nothing in those responses includes
student names, staff contact details, or full schedules. The invigilator
roster and the full exam timetable (`/invigilators`, `/timetable` GET) *do*
require a staff role — those are reconnaissance-worthy if leaked (staff
names/contacts, the whole exam schedule) and have no public-facing purpose.

**The part that actually matters for "admin can't see student pages."**
The previous single-file prototype had a "Preview as" switcher: once
logged in, *any* role could instantly flip to any other role in the UI
with no re-authentication. That's gone. Role now comes from exactly one
place — the JWT — and:
- The frontend's nav (`AppContext.jsx` → `NAV[role]`) only ever renders
  the signed-in role's own screens.
- `setScreen()` is guarded so it silently refuses to switch to a screen
  outside the current role's own nav, even if something tried to call it
  directly.
- None of this is what actually protects the data, though — a determined
  user could still edit React state in devtools and force a screen to
  render. What protects the data is that every API call that screen makes
  is independently checked server-side against the real JWT role. Client-
  side guarding is a UX nicety; server-side `requireRole` is the security
  boundary. Both are implemented, but only one of them is load-bearing.

**Session restore.** Refreshing the page doesn't lose your session, but it
also doesn't trust `localStorage` for anything except *which token to
send*. On boot, the app calls `GET /me/profile` with the saved token; the
server re-derives role, name, and department from that token server-side
and returns them. If the token is missing, expired, or belongs to a
deactivated account, the app drops back to the login screen instead of
guessing.

**Other hardening in `server/src/app.js`:**
- `helmet()` — sensible default security headers.
- Rate limiting on `/auth/login` specifically (20 attempts / 15 min / IP)
  to slow down password-guessing.
- `CORS_ORIGIN` env var to allowlist exactly which frontend origin(s) may
  call the API in production (wide open by default only in local dev).

**What I'd add before a real production deploy** (out of scope for a class
project, but worth knowing): shorter-lived access tokens with a refresh-
token rotation flow instead of one 12-hour JWT; account lockout (not just
rate limiting) after repeated failed logins; audit logging on admin
mutations; and moving `JWT_SECRET`/`MONGO_URI` into a proper secrets
manager instead of a `.env` file once this leaves a single developer's
laptop.

## Automatic department detection

Students are never asked to select their department — it's derived from
their own matriculation number the moment they log in. `FUL/CSC/20/1234`
splits into `FUL` / `CSC` / `20` / `1234`; the `CSC` segment is looked up
in a department code table (`server/src/utils/department.js`) to get
`"Computer Science"`. That function is the single source of truth for this
mapping — it's used at login (`/auth/login`), on session restore
(`/me/profile`), and by the seed script when generating sample students —
so there's no separate place where a department could quietly drift out of
sync with the matric number that's supposed to determine it. The frontend
never computes this itself when a real backend is available; it just
displays whatever the server says (client-side detection in
`client/src/lib/department.js` only kicks in for the offline demo-mode
fallback, when there's no server to ask).

## Updated backend workflow

- Timetable generation accepts dated slots with
  `{ examSlots: [{ timeSlotId, examDate }] }`. The same morning or afternoon
  slot can be reused on different days.
- Venue generation now runs inside a MongoDB transaction and creates one
  `StudentSeatAssignment` for every seated student. A split course therefore
  gives each student one exact venue and seat number.
- `GET /api/v1/me/venue` is student-only and searches only the signed-in
  student's registered courses. `GET /api/v1/me/timetable` returns those same
  saved venue and seat details.
- Admin management endpoints are available under `/students`,
  `/registrations`, `/courses`, `/venues`, and `/invigilators`. Creating a
  student or invigilator also creates their login account in the same
  transaction.



```
server/src/
  models/       Mongoose schemas (Venue, Course, Student, ExamTimetable, ...)
  routes/       auth, venues, courses, invigilators, timetable, allocation, me, images
  engine/       scheduler.js (clash avoidance) + allocator.js (venue/invigilator fitting)
  middleware/   JWT auth + role guards
  seed/         sample data + seed script

client/src/
  screens/      Login + all 12 role screens
  components/   VenueCard, CampusMap, SeatGrid, Stamp, Sidebar, Topbar, BuildingImage
  lib/          API client (with offline fallback), venue illustrations, icons
  context/      role/navigation/auth state
```

## Running the engine tests

```bash
cd server
npm test
```

These are the tests that actually prove the system's core promises: zero
student clashes, no venue over capacity, no invigilator double-booked.
