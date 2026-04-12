from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import resources, events, feed, transit, crime, chat
from services.scheduler import start_scheduler
from seed import _ensure_tables, _seed_resources, _seed_events, _seed_septa_stops, _seed_crime_cells
from database import SessionLocal
from models import Resource


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    _ensure_tables()
    db = SessionLocal()
    try:
        # Only seed when the DB is empty to avoid duplicates on restart.
        if db.query(Resource).count() == 0:
            r = _seed_resources(db)
            e = _seed_events(db)
            s = _seed_septa_stops(db)
            c = _seed_crime_cells(db)
            print(f"[seed] Inserted: {r} resources, {e} events, {s} SEPTA stops, {c} crime cells")
        else:
            print("[seed] DB already populated — skipping seed")
    finally:
        db.close()
    yield


app = FastAPI(title="RockyAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resources.router)
app.include_router(events.router)
app.include_router(feed.router)
app.include_router(transit.router)
app.include_router(crime.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "RockyAI API running"}
