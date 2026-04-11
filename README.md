<div align="center">

# 🥊 Rocky
### Philadelphia Resource Assistant

*Find food, shelter, clinics, transit, and crisis support — instantly.*

[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_54-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://expo.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Platform](https://img.shields.io/badge/Platform-iOS_%7C_Android-2C7A3A?style=flat-square)](https://expo.dev)

</div>

---

## What is Rocky?

Rocky is a mobile app built for CodeFest 2026 that helps Philadelphia residents — especially students and unhoused individuals — connect with free resources in real time. Ask Rocky in plain English, see it on a map, save events to your calendar.

<br>

## App Tabs

<table>
<tr>
<td width="25%" align="center">

**💬 Rocky**

Conversational AI assistant. Ask anything in plain English — food, shelter, clinics, transit. Detects crisis language and surfaces hotlines immediately. Routes to the map with filters pre-applied.

</td>
<td width="25%" align="center">

**🗺 Map**

Interactive Philly resource map with category filters, crime heatmap overlay, and live SEPTA arrivals. Chat-to-map bridge lets Rocky pan and filter the map automatically.

</td>
<td width="25%" align="center">

**📋 Feed**

Live event and resource feed aggregated from campus and city sources. Filtered by your university when you're a student. Bookmark any event with one tap.

</td>
<td width="25%" align="center">

**📅 Calendar**

Saved events with push notification reminders 30 minutes before each one. Events sync to your phone's native calendar. Remove anytime — notification and calendar entry both cancel.

</td>
</tr>
</table>

<br>

## Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| `React Native` + `Expo SDK 54` | Cross-platform mobile app framework |
| `expo-router` | File-based navigation |
| `react-native-maps` | MapView, markers, heatmap |
| `@react-native-voice/voice` | Device speech recognition for Rocky voice input |
| `expo-notifications` | Scheduled local push notification reminders |
| `expo-calendar` | Native iOS/Android calendar sync |
| `react-native-mmkv` | Synchronous on-device storage (NitroModules) |
| `Zustand` | Lightweight global state (`mapStore`, `calendarStore`, `userStore`) |

### Backend
| Library | Purpose |
|---|---|
| `FastAPI` | REST API server |
| `PostgreSQL` | Resource and event storage |
| `APScheduler` | Background data ingestion jobs |
| `Pydantic` | Request/response schema validation |

<br>

## Project Structure

```
CodeFest2026/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Rocky chat screen
│   │   ├── map.tsx             # Interactive resource map
│   │   ├── feed.tsx            # Event/resource feed
│   │   ├── calendar.tsx        # Saved events
│   │   └── settings.tsx        # User preferences
│   ├── onboarding/             # First-run onboarding flow (5 steps)
│   └── _layout.tsx             # Root layout & onboarding gate
│
├── components/
│   ├── chat/
│   │   ├── MessageBubble.tsx
│   │   ├── QuickActionChips.tsx
│   │   └── CrisisPanel.tsx
│   └── map/
│       ├── LayerFilterPanel.tsx
│       └── ResourceDetailPanel.tsx
│
├── services/
│   ├── api.ts                  # Typed API client — all devs import from here
│   ├── apiTypes.ts             # API response types (mirrors backend/schemas.py)
│   ├── rockyIntent.ts          # Rocky intent detection (keyword NLP)
│   ├── notifications.ts        # expo-notifications helpers
│   └── nativeCalendar.ts       # expo-calendar helpers
│
├── store/
│   ├── mapStore.ts             # Map state + chat-to-map bridge dispatch
│   ├── calendarStore.ts        # MMKV-persisted saved events
│   └── userStore.ts            # MMKV-persisted user preferences
│
├── constants/
│   ├── types.ts                # Shared TypeScript types
│   └── mapColors.ts            # Category → pin color map
│
└── backend/
    ├── main.py                 # FastAPI entry point
    ├── models.py               # SQLAlchemy models
    ├── schemas.py              # Pydantic schemas
    ├── schema.sql              # Database schema
    ├── routers/                # resources, events, feed, transit, crime
    └── services/
        ├── scheduler.py        # Background sync jobs
        └── stub_data.py        # Dev fallback data
```

<br>

## Team

| | Person | Owns | Key Files |
|---|---|---|---|
| 1️⃣ | **Person 1** | Backend + data pipeline | `backend/`, `services/api.ts`, `services/apiTypes.ts` |
| 2️⃣ | **Person 2** | Map tab | `map.tsx`, `components/map/`, `store/mapStore.ts` |
| 3️⃣ | **Person 3** | Chat + Feed + Calendar + onboarding | `index.tsx`, `feed.tsx`, `calendar.tsx`, `settings.tsx`, `app/onboarding/`, `services/rockyIntent.ts`, `services/notifications.ts`, `services/nativeCalendar.ts` |

<br>

## Running Locally

### Frontend

> **Note:** `react-native-mmkv` and `@react-native-voice/voice` require a native dev build. Expo Go will load the UI but persistence and voice input will not work.

```bash
npm install

# Recommended — full native dev build
npx expo run:ios

# Expo Go — UI only, no native modules
npx expo start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The frontend API client (`services/api.ts`) points to `http://localhost:8000` in dev. Update `BASE_URL` before deploying.

<br>

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/resources` | All resources — optional `?category=` filter |
| `GET` | `/resources/nearby` | Resources within radius of `?lat=&lon=` |
| `GET` | `/resources/{id}` | Single resource by ID |
| `GET` | `/events` | Events — optional `?university=&category=` |
| `GET` | `/feed` | Combined feed — optional `?university=` |
| `GET` | `/transit/stops/nearby` | SEPTA stops near `?lat=&lon=` |
| `GET` | `/transit/arrivals/{stopId}` | Live arrivals for a stop |
| `GET` | `/crime/heatmap` | Crime density data points |

<br>

## Resource Categories

| Key | Label | Map Color |
|---|---|---|
| `food_bank` | Food Bank | 🟢 Green |
| `shelter` | Shelter | 🔵 Blue |
| `clinic` | Health Clinic | 🔴 Red |
| `mental_health` | Mental Health | 🟣 Purple |
| `septa` | SEPTA Stop | 🟠 Orange |
| `support_group` | Support Group | 🩵 Teal |
| `campus_resource` | Campus Resource | 🔷 Indigo |

<br>

## Architecture Notes

### Chat-to-Map Bridge
Rocky and the Map tab communicate without sharing a parent component. Rocky calls `mapDispatch(action)` in `index.tsx` — a Zustand action stored in `mapStore.ts`. The map tab watches `centerLatitude`/`centerLongitude`/`activeCategory` via a `useEffect` and reacts automatically when Rocky changes them.

### Offline-First Storage
User preferences and saved events use MMKV (not AsyncStorage) for synchronous reads on startup. Both stores hydrate from disk at module load time — no async splash delay, no flicker.

### Crisis Detection
Crisis keyword matching runs in `rockyIntent.ts` before any other logic or network call. `CrisisPanel` renders hardcoded hotline numbers so crisis resources are always available with zero connectivity.

### Notification + Calendar Sync
When a user bookmarks a Feed event, two operations run in parallel via `Promise.all`: a local push notification is scheduled 30 minutes before the event, and the event is written to a "RockyAI" calendar on the device via `expo-calendar`. Both IDs are stored on the `CalendarEvent` so they can be cleaned up together when the event is removed.

<br>

## Known Limitations

- **Expo Go**: `react-native-mmkv` and `@react-native-voice/voice` require `npx expo run:ios`. Expo Go loads the UI but native modules will not function.
- **Backend URL**: `BASE_URL` in `services/api.ts` must be updated to a live host before the app works outside of local development.
- **Calendar on Android**: `expo-calendar` calendar creation (`createCalendarAsync`) is iOS-only. On Android, events are skipped gracefully and only the push notification is scheduled.

---

<div align="center">

Built at CodeFest 2026 · Philadelphia, PA

</div>
