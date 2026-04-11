"""
Seed campus events for all 6 universities — club events, fundraisers,
free food, cultural events, etc.

Run from backend/ directory:
  source venv/bin/activate && python seed_events.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
from models import Event
from datetime import datetime, timedelta, timezone

def dt(days_ahead, hour=12, minute=0):
    base = datetime.now(timezone.utc).replace(hour=hour, minute=minute, second=0, microsecond=0)
    return base + timedelta(days=days_ahead)

EVENTS = [
    # ── Drexel ───────────────────────────────────────────────────────────
    dict(id="ev_drexel_1",  university="drexel",      category="free_food",
         title="Drexel SGA Free Lunch",
         description="Free hot lunch for all Drexel students, no ID required. Burgers, veggie options, and drinks.",
         location="Creese Student Center, 3210 Chestnut St",
         latitude=39.9559, longitude=-75.1887,
         start_time=dt(1, 12), end_time=dt(1, 14)),

    dict(id="ev_drexel_2",  university="drexel",      category="event",
         title="Drexel Dragon's Club Fair",
         description="Meet 200+ student clubs and organizations. Free merch, food samples, and giveaways.",
         location="Daskalakis Athletic Center, 3210 Chestnut St",
         latitude=39.9551, longitude=-75.1888,
         start_time=dt(3, 11), end_time=dt(3, 15)),

    dict(id="ev_drexel_3",  university="drexel",      category="event",
         title="Drexel Hackathon — DragonsHacks",
         description="24-hour hackathon open to all students. Free food, prizes up to $1,000, and mentors from top tech companies.",
         location="Bossone Research Center, 3140 Market St",
         latitude=39.9563, longitude=-75.1856,
         start_time=dt(5, 9), end_time=dt(6, 9)),

    dict(id="ev_drexel_4",  university="drexel",      category="event",
         title="South Asian Student Association Fundraiser",
         description="Food sale and cultural showcase fundraiser. Samosas, chai, and live music. All proceeds go to local charities.",
         location="Creese Student Center Lobby",
         latitude=39.9559, longitude=-75.1887,
         start_time=dt(2, 13), end_time=dt(2, 17)),

    dict(id="ev_drexel_5",  university="drexel",      category="free_food",
         title="Drexel Engineers Without Borders Bake Sale",
         description="Free pastries and coffee while supplies last. Come learn about our upcoming trip to Guatemala.",
         location="Drexel Main Building Lobby",
         latitude=39.9557, longitude=-75.1894,
         start_time=dt(4, 10), end_time=dt(4, 13)),

    # ── Temple ───────────────────────────────────────────────────────────
    dict(id="ev_temple_1",  university="temple",      category="free_food",
         title="Temple Student Gov Free Breakfast",
         description="Free breakfast for all Temple students every Tuesday. Eggs, bagels, fruit, and coffee.",
         location="Howard Gittis Student Center, 1755 N 13th St",
         latitude=39.9810, longitude=-75.1550,
         start_time=dt(1, 8), end_time=dt(1, 10)),

    dict(id="ev_temple_2",  university="temple",      category="event",
         title="Temple Homecoming Block Party",
         description="Annual homecoming celebration with live DJs, food trucks, carnival games, and giveaways. Free admission for Temple students.",
         location="Liacouras Walk, Temple University",
         latitude=39.9805, longitude=-75.1548,
         start_time=dt(6, 14), end_time=dt(6, 20)),

    dict(id="ev_temple_3",  university="temple",      category="event",
         title="Black Student Union Cultural Showcase",
         description="Celebrating Black culture with performances, art, food, and community. Open to all Temple students.",
         location="Temple Performing Arts Center, 1837 N Broad St",
         latitude=39.9823, longitude=-75.1548,
         start_time=dt(4, 18), end_time=dt(4, 21)),

    dict(id="ev_temple_4",  university="temple",      category="event",
         title="Temple Entrepreneurship Pitch Competition",
         description="Student teams pitch their startups to a panel of judges. Cash prizes for top 3 teams. All majors welcome.",
         location="Fox School of Business, 1801 Liacouras Walk",
         latitude=39.9808, longitude=-75.1541,
         start_time=dt(7, 13), end_time=dt(7, 16)),

    dict(id="ev_temple_5",  university="temple",      category="event",
         title="Temple Diwali Night",
         description="Temple's biggest cultural celebration of the year. Performances, traditional food, and fireworks. Free for students.",
         location="Liacouras Center, 1776 N Broad St",
         latitude=39.9826, longitude=-75.1548,
         start_time=dt(9, 17), end_time=dt(9, 21)),

    # ── UPenn ────────────────────────────────────────────────────────────
    dict(id="ev_upenn_1",   university="upenn",       category="free_food",
         title="UPenn Houston Hall Community Breakfast",
         description="Free community breakfast open to all Penn students and staff. Pancakes, fruit, coffee, and juice.",
         location="Houston Hall, 3417 Spruce St",
         latitude=39.9523, longitude=-75.1954,
         start_time=dt(1, 9), end_time=dt(1, 11)),

    dict(id="ev_upenn_2",   university="upenn",       category="event",
         title="Penn Social Impact Hackathon",
         description="Build tech solutions for real Philadelphia nonprofits. Teams of 2–5, all skill levels welcome. $500 in prizes.",
         location="Huntsman Hall, 3730 Walnut St",
         latitude=39.9524, longitude=-75.1998,
         start_time=dt(5, 10), end_time=dt(6, 10)),

    dict(id="ev_upenn_3",   university="upenn",       category="event",
         title="Penn Spring Fling",
         description="Penn's annual spring festival with live performances, rides, food vendors, and outdoor activities. Free for Penn students.",
         location="College Green, Penn Campus",
         latitude=39.9522, longitude=-75.1932,
         start_time=dt(8, 12), end_time=dt(8, 22)),

    dict(id="ev_upenn_4",   university="upenn",       category="event",
         title="Penn First-Gen Networking Night",
         description="First-generation college student mixer with alumni mentors from top industries. Free dinner provided.",
         location="Irvine Auditorium, 3401 Spruce St",
         latitude=39.9521, longitude=-75.1945,
         start_time=dt(3, 18), end_time=dt(3, 21)),

    dict(id="ev_upenn_5",   university="upenn",       category="event",
         title="South Asia Society Holi Celebration",
         description="Celebrate the festival of colors on Penn's campus. Holi powder, traditional food, music, and dancing. All welcome.",
         location="Hill Field, Penn Campus",
         latitude=39.9534, longitude=-75.1930,
         start_time=dt(10, 14), end_time=dt(10, 18)),

    # ── CCP ──────────────────────────────────────────────────────────────
    dict(id="ev_ccp_1",     university="ccp",         category="free_food",
         title="CCP Student Gov Free Pizza Friday",
         description="Free pizza every Friday for CCP students in the student lounge. First come, first served.",
         location="Bonnell Building Lounge, 1700 Spring Garden St",
         latitude=39.9612, longitude=-75.1669,
         start_time=dt(2, 12), end_time=dt(2, 14)),

    dict(id="ev_ccp_2",     university="ccp",         category="event",
         title="CCP Career & Transfer Fair",
         description="Connect with 50+ employers and 4-year universities. Bring your resume. Professional headshots provided free.",
         location="CCP Main Campus, 1700 Spring Garden St",
         latitude=39.9609, longitude=-75.1671,
         start_time=dt(4, 10), end_time=dt(4, 15)),

    dict(id="ev_ccp_3",     university="ccp",         category="event",
         title="CCP Multicultural Festival",
         description="Annual celebration of CCP's diverse community. International food, live performances, and cultural booths.",
         location="CCP Bonnell Building Plaza",
         latitude=39.9612, longitude=-75.1670,
         start_time=dt(6, 11), end_time=dt(6, 16)),

    dict(id="ev_ccp_4",     university="ccp",         category="event",
         title="CCP Gaming & Esports Tournament",
         description="Open gaming tournament for CCP students. Games include FIFA, Valorant, and Smash Bros. Prizes for winners.",
         location="CCP Computer Lab, Winnet Building",
         latitude=39.9610, longitude=-75.1672,
         start_time=dt(5, 14), end_time=dt(5, 20)),

    # ── Saint Joseph's ───────────────────────────────────────────────────
    dict(id="ev_sju_1",     university="saint_josephs", category="free_food",
         title="SJU Hawk Hill BBQ",
         description="Free BBQ cookout for all SJU students. Burgers, hot dogs, sides, and drinks on the front lawn.",
         location="Front Lawn, 5600 City Ave",
         latitude=40.0042, longitude=-75.2282,
         start_time=dt(3, 12), end_time=dt(3, 15)),

    dict(id="ev_sju_2",     university="saint_josephs", category="event",
         title="SJU Hawk Madness Pep Rally",
         description="Kick off basketball season with the SJU Hawk mascot, cheerleaders, free gear giveaways, and a DJ.",
         location="Hagan Arena, 5600 City Ave",
         latitude=40.0038, longitude=-75.2279,
         start_time=dt(7, 18), end_time=dt(7, 21)),

    dict(id="ev_sju_3",     university="saint_josephs", category="event",
         title="SJU Charity 5K Run",
         description="Annual 5K fundraiser benefiting the Maguire Mission. Free for student runners, prizes for top finishers.",
         location="City Ave & Cardinal Ave, Philadelphia",
         latitude=40.0038, longitude=-75.2300,
         start_time=dt(8, 8), end_time=dt(8, 10)),

    dict(id="ev_sju_4",     university="saint_josephs", category="event",
         title="SJU International Student Expo",
         description="Meet students from 40+ countries. Cultural food, music, and conversation. All SJU students welcome.",
         location="Post Learning Commons, SJU",
         latitude=40.0040, longitude=-75.2280,
         start_time=dt(5, 13), end_time=dt(5, 17)),

    # ── La Salle ─────────────────────────────────────────────────────────
    dict(id="ev_lasalle_1", university="lasalle",     category="free_food",
         title="La Salle Explorer Pancake Breakfast",
         description="Free pancake breakfast hosted by La Salle student clubs. Coffee and juice included. Open to all students.",
         location="La Salle Student Union, 1900 W Olney Ave",
         latitude=40.0351, longitude=-75.1637,
         start_time=dt(2, 9), end_time=dt(2, 11)),

    dict(id="ev_lasalle_2", university="lasalle",     category="event",
         title="La Salle Midnight Madness",
         description="Celebrate the start of basketball season with free food, games, and a dunking contest at midnight.",
         location="Tom Gola Arena, 1900 W Olney Ave",
         latitude=40.0348, longitude=-75.1639,
         start_time=dt(9, 22), end_time=dt(10, 1)),

    dict(id="ev_lasalle_3", university="lasalle",     category="event",
         title="La Salle Earth Day Festival",
         description="Sustainability fair with local vendors, free plants, recycling drives, and live acoustic music.",
         location="La Salle Quad, 1900 W Olney Ave",
         latitude=40.0350, longitude=-75.1638,
         start_time=dt(6, 11), end_time=dt(6, 16)),

    dict(id="ev_lasalle_4", university="lasalle",     category="event",
         title="La Salle Talent Show",
         description="Annual student talent show. Sign up to perform or just come watch. Free admission, light refreshments provided.",
         location="La Salle Hayman Center",
         latitude=40.0349, longitude=-75.1640,
         start_time=dt(4, 19), end_time=dt(4, 21, 30)),
]


def seed():
    db = SessionLocal()
    inserted = 0
    skipped = 0
    try:
        for data in EVENTS:
            if db.query(Event).filter(Event.id == data["id"]).first():
                skipped += 1
                continue
            db.add(Event(
                id=data["id"],
                title=data["title"],
                description=data["description"],
                university=data["university"],
                location=data["location"],
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                start_time=data["start_time"],
                end_time=data.get("end_time"),
                category=data["category"],
            ))
            inserted += 1
        db.commit()
        print(f"Done: {inserted} inserted, {skipped} already existed.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
