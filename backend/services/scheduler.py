"""
APScheduler jobs — Person 1 fills these in with real scrapers.
Stubs are defined so the schedule runs without errors on startup.
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def ingest_open_data_philly():
    """Pull food banks, shelters, clinics from OpenDataPhilly. No API key needed."""
    logger.info("[scheduler] ingest_open_data_philly — TODO: implement")


async def ingest_crime_data():
    """Nightly download of crime incidents from OpenDataPhilly, aggregated into grid cells."""
    logger.info("[scheduler] ingest_crime_data — TODO: implement")


async def ingest_septa_stops():
    """Weekly download of SEPTA stop locations."""
    logger.info("[scheduler] ingest_septa_stops — TODO: implement")


async def scrape_university_events():
    """
    Scrape free food events from: Drexel, Temple, UPenn, CCP, Saint Joseph's, La Salle.
    Run every 6 hours. Start with Drexel — easiest.
    """
    logger.info("[scheduler] scrape_university_events — TODO: implement scrapers")


def start_scheduler():
    scheduler.add_job(ingest_open_data_philly, "cron", hour=2, minute=0, id="open_data_philly")
    scheduler.add_job(ingest_crime_data, "cron", hour=3, minute=0, id="crime_data")
    scheduler.add_job(ingest_septa_stops, "cron", day_of_week="sun", hour=4, id="septa_stops")
    scheduler.add_job(scrape_university_events, "interval", hours=6, id="university_events")
    scheduler.start()
    logger.info("[scheduler] started — 4 jobs scheduled")
