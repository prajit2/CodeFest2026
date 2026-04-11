# Rocky — Philadelphia Resource Assistant

Rocky is a mobile app (React Native / Expo) that helps Philadelphia residents — especially students and unhoused individuals — find food, shelter, health clinics, transit, and crisis support in real time. It includes a conversational AI assistant ("Rocky"), an interactive resource map, a campus event feed, and a personal calendar.

---

## What It Does

| Tab | Description |
|-----|-------------|
| **Rocky (Chat)** | Conversational assistant. Understands natural language queries for food, shelter, clinics, transit, and mental health. Detects crisis language and surfaces hotlines immediately. Routes to the map with filters applied. |
| **Map** | Interactive Philly map with layer filters (food banks, shelters, clinics, mental health, SEPTA, support groups, campus resources). Crime heatmap overlay. Resource detail panel with phone, hours, and nearest SEPTA stops. Chat-to-map bridge lets Rocky pan and filter the map automatically. |
| **Feed** | Event/resource feed aggregated from campus and city sources. Filtered by university if the user is a student. Bookmark any event to save it. |
| **Calendar** | Persisted list of saved events. Each saved event schedules a 30-minute push notification reminder. Events can be removed (notification cancelled automatically). |

---

## Tech Stack

### Frontend
- **React Native + Expo** (SDK 52, new architecture enabled)
- **expo-router** — file-based navigation
- **react-native-maps** — MapView with Markers and Heatmap
- **expo-notifications** — scheduled push notification reminders
- **react-native-mmkv** — fast on-device persistence (NitroModules; requires dev build)
- **Zustand** — lightweight state management (`mapStore`, `calendarStore`, `userStore`)
- **@expo/vector-icons (FontAwesome)** — icons throughout

### Backend
- **FastAPI** (Python) — REST API server
- **PostgreSQL** — resource and event storage
- **APScheduler** — background job scheduler for data ingestion
- Routers: `/resources`, `/events`, `/feed`, `/transit`, `/crime`

---

## Project Structure

```
CodeFest2026/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx         # Rocky chat screen
│   │   ├── map.tsx           # Interactive resource map
│   │   ├── feed.tsx          # Event/resource feed
│   │   └── calendar.tsx      # Saved events calendar
│   └── _layout.tsx           # Root layout & onboarding gate
├── components/
│   ├── chat/
│   │   ├── MessageBubble.tsx
│   │   ├── QuickActionChips.tsx
│   │   └── CrisisPanel.tsx
│   └── map/
│       ├── LayerFilterPanel.tsx
│       └── ResourceDetailPanel.tsx
├── services/
│   ├── api.ts                # Typed API client (all three devs import from here)
│   ├── apiTypes.ts           # API response types
│   ├── notifications.ts      # expo-notifications wrappers
│   └── rockyIntent.ts        # Rocky intent detection (NLP keyword matching)
├── store/
│   ├── mapStore.ts           # Map state + chat-to-map bridge
│   ├── calendarStore.ts      # MMKV-persisted saved events
│   └── userStore.ts          # MMKV-persisted user preferences
├── constants/
│   ├── types.ts              # Shared TypeScript types
│   └── mapColors.ts          # Category → pin color mapping
└── backend/
    ├── main.py               # FastAPI app entry point
    ├── models.py             # SQLAlchemy models
    ├── schemas.py            # Pydantic schemas
    ├── schema.sql            # Database schema
    ├── routers/
    │   ├── resources.py
    │   ├── events.py
    │   ├── feed.py
    │   ├── transit.py
    │   └── crime.py
    └── services/
        ├── scheduler.py      # Background data sync jobs
        └── stub_data.py      # Fallback data during development
```

---

## Team & Ownership

| Person | Domain | Key files |
|--------|--------|-----------|
| **Person 1** | Rocky chat + backend API | `index.tsx`, `rockyIntent.ts`, `backend/` |
| **Person 2** | Map tab | `map.tsx`, `components/map/`, `mapStore.ts` |
| **Person 3** | Feed + Calendar + notifications | `feed.tsx`, `calendar.tsx`, `calendarStore.ts`, `notifications.ts` |

---

## Running Locally

### Frontend (Expo)

> **Important:** `react-native-mmkv` uses NitroModules and is not supported in Expo Go. Run a dev build for full functionality.

```bash
npm install
npx expo run:ios       # dev build with native modules (recommended)
# or
npx expo start         # Expo Go — UI works, MMKV persistence won't function
```

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The frontend API client points to `http://localhost:8000` in development. Update `BASE_URL` in `services/api.ts` when the backend is deployed.

---

## Key Architectural Decisions

### Chat-to-Map Bridge
Rocky can filter the map and pan the camera without the two tabs sharing a parent component. The bridge works via a Zustand `dispatch` action in `mapStore.ts`. Rocky calls `mapDispatch(action)` in `index.tsx`, and `map.tsx` listens with a `useEffect` on `centerLatitude`/`centerLongitude`.

### Offline-First Storage
User preferences and saved events are stored with MMKV (not AsyncStorage) for synchronous reads and better performance. Both stores initialize by loading from MMKV on startup so data survives app restarts.

### Crisis Detection
Crisis keyword matching in `rockyIntent.ts` is evaluated before any network call. The `CrisisPanel` component renders hardcoded hotline numbers so crisis resources are always available even with no connectivity.

### Push Notifications
`scheduleEventReminder` in `notifications.ts` schedules a local notification 30 minutes before an event's start time. It requests permission lazily on first save. Notification IDs are stored alongside each `CalendarEvent` so they can be cancelled when the event is removed.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/resources` | List all resources (optional `?category=`) |
| GET | `/resources/nearby` | Resources within radius of lat/lon |
| GET | `/resources/{id}` | Single resource |
| GET | `/events` | Events (optional `?university=&category=`) |
| GET | `/feed` | Combined feed (optional `?university=`) |
| GET | `/transit/stops/nearby` | SEPTA stops near lat/lon |
| GET | `/transit/arrivals/{stopId}` | Live SEPTA arrivals for a stop |
| GET | `/crime/heatmap` | Crime heatmap data points |

---

## Resource Categories

| Category key | Label | Map pin color |
|---|---|---|
| `food_bank` | Food Bank | Green |
| `shelter` | Shelter | Blue |
| `clinic` | Health Clinic | Red |
| `mental_health` | Mental Health | Purple |
| `septa` | SEPTA Stop | Orange |
| `support_group` | Support Group | Teal |
| `campus_resource` | Campus Resource | Indigo (students only) |

---

## Known Limitations

- **MMKV / Expo Go**: `react-native-mmkv` requires a development build (`npx expo run:ios`). Expo Go will load the UI but saved events and onboarding preferences will not persist.
- **Map stubs**: The map currently renders hardcoded resources and crime points. Switching to live API data is the next step for Person 2.
- **Backend not deployed**: `BASE_URL` in `services/api.ts` must be updated to a live URL before the app can connect to the backend outside of local development.
- **Voice input**: The microphone button in Rocky is wired up visually but not functional yet (marked `TODO Week 2`).
