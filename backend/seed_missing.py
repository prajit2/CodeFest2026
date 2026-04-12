"""
Seed script for missing map categories:
  food_bank, mental_health, septa, support_group

Run from backend/ directory:
  source venv/bin/activate && python seed_missing.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
from models import Resource, ResourceCategory

FOOD_BANKS = [
    {"id": "fb1",  "name": "Broad Street Ministry Pantry",        "address": "315 S Broad St, Philadelphia, PA 19107",       "latitude": 39.9442, "longitude": -75.1657, "phone": "215-735-4847",  "hours": "Tue & Thu 10am–1pm"},
    {"id": "fb2",  "name": "Sunday Breakfast Rescue Mission",      "address": "302 N 13th St, Philadelphia, PA 19107",        "latitude": 39.9567, "longitude": -75.1601, "phone": "215-922-6400",  "hours": "Daily 7am–8pm"},
    {"id": "fb3",  "name": "Share Food Program",                   "address": "2901 W Hunting Park Ave, Philadelphia, PA 19129","latitude": 40.0012, "longitude": -75.1798, "phone": "215-223-2220",  "hours": "Mon–Fri 8am–4pm"},
    {"id": "fb4",  "name": "Philabundance Community Kitchen",      "address": "3616 South Galloway St, Philadelphia, PA 19148","latitude": 39.9165, "longitude": -75.1548, "phone": "215-339-0900",  "hours": "Mon–Fri 9am–3pm"},
    {"id": "fb5",  "name": "Northeast Food Cupboard",              "address": "7246 Frankford Ave, Philadelphia, PA 19135",   "latitude": 40.0378, "longitude": -75.0623, "phone": "215-624-5668",  "hours": "Wed & Sat 9am–12pm"},
    {"id": "fb6",  "name": "West Philadelphia YMCA Food Pantry",   "address": "5120 Chestnut St, Philadelphia, PA 19139",     "latitude": 39.9606, "longitude": -75.2257, "phone": "215-476-2700",  "hours": "Fri 10am–1pm"},
    {"id": "fb7",  "name": "Kensington Community Food Co-op",      "address": "2154 E Cumberland St, Philadelphia, PA 19125", "latitude": 39.9901, "longitude": -75.1228, "phone": None,            "hours": "Sat 10am–2pm"},
    {"id": "fb8",  "name": "St. Francis Inn Ministries",           "address": "2441 Kensington Ave, Philadelphia, PA 19125",  "latitude": 39.9927, "longitude": -75.1291, "phone": "215-423-5845",  "hours": "Daily 8am–9am (breakfast)"},
    {"id": "fb9",  "name": "Germantown Settlement Community Food", "address": "5575 Germantown Ave, Philadelphia, PA 19144",  "latitude": 40.0362, "longitude": -75.1661, "phone": "215-844-3260",  "hours": "Mon & Wed 10am–12pm"},
    {"id": "fb10", "name": "Bethel Temple Food Bank",              "address": "2nd & Snyder Ave, Philadelphia, PA 19148",     "latitude": 39.9212, "longitude": -75.1497, "phone": "215-468-1911",  "hours": "Sat 9am–11am"},
    {"id": "fb11", "name": "Saint Mark's Food Cupboard",           "address": "1625 Locust St, Philadelphia, PA 19103",       "latitude": 39.9500, "longitude": -75.1630, "phone": "215-735-1416",  "hours": "Tue–Fri 9:30am–11am"},
    {"id": "fb12", "name": "Bebashi Food First Pantry",            "address": "1237 Spring Garden St, Philadelphia, PA 19123","latitude": 39.9650, "longitude": -75.1550, "phone": "215-769-3561",  "hours": "Mon–Fri 9am–4pm"},
    {"id": "fb13", "name": "Grace Evangelical Lutheran Food Pantry","address": "3529 Haverford Ave, Philadelphia, PA 19104",   "latitude": 39.9560, "longitude": -75.2160, "phone": "215-222-3570",  "hours": "Wed & Thu 9am–1pm"},
    {"id": "fb14", "name": "Mount Zion United Holy Church Pantry", "address": "4110 Haverford Ave, Philadelphia, PA 19104",   "latitude": 39.9560, "longitude": -75.2150, "phone": "215-476-6522",  "hours": "2nd Sun & 3rd Wed 11am–1pm"},
    {"id": "fb15", "name": "People's Emergency Center Food Pantry","address": "325 N 39th St, Philadelphia, PA 19104",        "latitude": 39.9620, "longitude": -75.2040, "phone": "267-777-5880",  "hours": "Call for hours"},
    {"id": "fb16", "name": "Casa del Carmen Food Pantry",          "address": "4400 N Reese St, Philadelphia, PA 19140",      "latitude": 39.9980, "longitude": -75.1350, "phone": "267-331-2500",  "hours": "Mon–Wed 9am–12pm"},
    {"id": "fb17", "name": "Mission of Saint Joan of Arc Pantry",  "address": "2025 E Atlantic St, Philadelphia, PA 19134",   "latitude": 39.9850, "longitude": -75.0850, "phone": "215-535-4641",  "hours": "Tue & Thu 10am–12pm"},
    {"id": "fb18", "name": "Caring for Friends Food Pantry",       "address": "12271 Townsend Rd, Philadelphia, PA 19154",    "latitude": 40.0695, "longitude": -75.0920, "phone": "215-464-2224",  "hours": "Mon–Fri 9am–5pm; Sat 9am–12pm"},
    {"id": "fb19", "name": "Salvation Army Kroc Center Pantry",    "address": "4200 Wissahickon Ave, Philadelphia, PA 19129", "latitude": 40.0200, "longitude": -75.2100, "phone": "215-558-1500",  "hours": "Mon–Fri 8am–5pm"},
    {"id": "fb20", "name": "Helen Brown Community Center Pantry",  "address": "1845 N 23rd St, Philadelphia, PA 19121",       "latitude": 39.9750, "longitude": -75.1650, "phone": None,            "hours": "Mon/Wed/Thu 10:30am–12:30pm"},
]

MENTAL_HEALTH = [
    {"id": "mh1",  "name": "Penn Medicine Behavioral Health",      "address": "3535 Market St, Philadelphia, PA 19104",       "latitude": 39.9558, "longitude": -75.1943, "phone": "215-746-7100",  "hours": "Mon–Fri 9am–5pm"},
    {"id": "mh2",  "name": "Jefferson Behavioral Health",          "address": "833 Chestnut St, Philadelphia, PA 19107",      "latitude": 39.9476, "longitude": -75.1564, "phone": "215-955-6000",  "hours": "Mon–Fri 8am–6pm"},
    {"id": "mh3",  "name": "Philadelphia FIGHT — Wellness Program", "address": "1233 Locust St, Philadelphia, PA 19107",      "latitude": 39.9472, "longitude": -75.1617, "phone": "215-985-4448",  "hours": "Mon–Fri 9am–5pm"},
    {"id": "mh4",  "name": "Wedge Recovery Centers",               "address": "5565 Wissahickon Ave, Philadelphia, PA 19144", "latitude": 40.0354, "longitude": -75.1769, "phone": "215-849-4606",  "hours": "Mon–Fri 8am–5pm"},
    {"id": "mh5",  "name": "Behavioral Health Crisis Line — DBHIDS","address": "1101 Market St, Philadelphia, PA 19107",      "latitude": 39.9508, "longitude": -75.1584, "phone": "215-685-6440",  "hours": "24/7"},
    {"id": "mh6",  "name": "Northeast Treatment Centers (NET)",    "address": "499 N 5th St, Philadelphia, PA 19123",         "latitude": 39.9631, "longitude": -75.1476, "phone": "215-769-3000",  "hours": "Mon–Fri 8:30am–5pm"},
    {"id": "mh7",  "name": "Resources for Human Development",      "address": "4700 Wissahickon Ave, Philadelphia, PA 19144", "latitude": 40.0289, "longitude": -75.1773, "phone": "215-951-0300",  "hours": "Mon–Fri 9am–5pm"},
    {"id": "mh8",  "name": "NHS Human Services — Mental Health",   "address": "9350 Ashton Rd, Philadelphia, PA 19114",       "latitude": 40.0701, "longitude": -74.9991, "phone": "215-335-3444",  "hours": "Mon–Fri 8am–5pm"},
]

SEPTA_STOPS = [
    {"id": "sep1",  "name": "15th St Station (BSL/MFL)",   "address": "15th & Market St, Philadelphia, PA",        "latitude": 39.9524, "longitude": -75.1655, "hours": "5am–1am daily"},
    {"id": "sep2",  "name": "City Hall Station (BSL/MFL)", "address": "Broad & Market St, Philadelphia, PA",       "latitude": 39.9522, "longitude": -75.1637, "hours": "5am–1am daily"},
    {"id": "sep3",  "name": "30th St Station (Regional Rail)", "address": "2955 Market St, Philadelphia, PA 19104","latitude": 39.9566, "longitude": -75.1825, "hours": "5am–1am daily"},
    {"id": "sep4",  "name": "Suburban Station (Regional Rail)", "address": "16th & JFK Blvd, Philadelphia, PA",    "latitude": 39.9534, "longitude": -75.1667, "hours": "5am–1am daily"},
    {"id": "sep5",  "name": "Jefferson Station (Regional Rail)", "address": "10th & Filbert St, Philadelphia, PA", "latitude": 39.9527, "longitude": -75.1558, "hours": "5am–1am daily"},
    {"id": "sep6",  "name": "Temple University Station (BSL)", "address": "Broad & Cecil B Moore, Philadelphia, PA", "latitude": 39.9804, "longitude": -75.1550, "hours": "5am–1am daily"},
    {"id": "sep7",  "name": "Olney TC (BSL)",               "address": "Broad & Olney Ave, Philadelphia, PA",      "latitude": 40.0354, "longitude": -75.1516, "hours": "5am–1am daily"},
    {"id": "sep8",  "name": "Fern Rock TC (BSL/Regional)",  "address": "Broad & Nedro Ave, Philadelphia, PA",      "latitude": 40.0554, "longitude": -75.1386, "hours": "5am–1am daily"},
    {"id": "sep9",  "name": "Frankford TC (MFL)",           "address": "Frankford & Paul St, Philadelphia, PA",    "latitude": 40.0199, "longitude": -75.0541, "hours": "5am–1am daily"},
    {"id": "sep10", "name": "69th St TC (MFL)",             "address": "69th St, Upper Darby, PA 19082",           "latitude": 39.9638, "longitude": -75.2603, "hours": "5am–1am daily"},
    {"id": "sep11", "name": "University City Station (Regional Rail)", "address": "4000 Powelton Ave, Philadelphia, PA", "latitude": 39.9553, "longitude": -75.1935, "hours": "5am–1am daily"},
    {"id": "sep12", "name": "Cecil B Moore Station (BSL)",  "address": "Broad & Cecil B Moore, Philadelphia, PA",  "latitude": 39.9804, "longitude": -75.1551, "hours": "5am–1am daily"},
    {"id": "sep13", "name": "Girard Station (BSL)",         "address": "Broad & Girard Ave, Philadelphia, PA",     "latitude": 39.9727, "longitude": -75.1553, "hours": "5am–1am daily"},
    {"id": "sep14", "name": "Spring Garden Station (BSL)",  "address": "Broad & Spring Garden, Philadelphia, PA",  "latitude": 39.9618, "longitude": -75.1551, "hours": "5am–1am daily"},
    {"id": "sep15", "name": "Race-Vine Station (BSL)",      "address": "Broad & Race St, Philadelphia, PA",        "latitude": 39.9567, "longitude": -75.1550, "hours": "5am–1am daily"},
    {"id": "sep16", "name": "Walnut-Locust Station (BSL)",  "address": "Broad & Walnut St, Philadelphia, PA",      "latitude": 39.9481, "longitude": -75.1641, "hours": "5am–1am daily"},
    {"id": "sep17", "name": "Ellsworth-Federal Station (BSL)", "address": "Broad & Ellsworth, Philadelphia, PA",   "latitude": 39.9392, "longitude": -75.1637, "hours": "5am–1am daily"},
    {"id": "sep18", "name": "Tasker-Morris Station (BSL)",  "address": "Broad & Morris St, Philadelphia, PA",      "latitude": 39.9317, "longitude": -75.1636, "hours": "5am–1am daily"},
    {"id": "sep19", "name": "Snyder Station (BSL)",         "address": "Broad & Snyder Ave, Philadelphia, PA",     "latitude": 39.9223, "longitude": -75.1636, "hours": "5am–1am daily"},
    {"id": "sep20", "name": "Oregon Station (BSL)",         "address": "Broad & Oregon Ave, Philadelphia, PA",     "latitude": 39.9155, "longitude": -75.1628, "hours": "5am–1am daily"},
]

SUPPORT_GROUPS = [
    {"id": "sg1",  "name": "Council for Recovery",                    "address": "1628 JFK Blvd, Philadelphia, PA 19103",        "latitude": 39.9534, "longitude": -75.1674, "phone": "215-227-3200", "hours": "See schedule"},
    {"id": "sg2",  "name": "Narcotics Anonymous — Center City",       "address": "1601 Walnut St, Philadelphia, PA 19103",       "latitude": 39.9512, "longitude": -75.1679, "phone": None,           "hours": "Mon/Wed/Fri 7pm"},
    {"id": "sg3",  "name": "Alcoholics Anonymous — Philadelphia Area", "address": "8 Penn Center, Philadelphia, PA 19103",        "latitude": 39.9530, "longitude": -75.1660, "phone": "215-923-7900", "hours": "Multiple daily meetings"},
    {"id": "sg4",  "name": "NAMI Philadelphia",                       "address": "4400 E–W Highway, Philadelphia, PA 19103",     "latitude": 39.9519, "longitude": -75.1648, "phone": "215-386-8600", "hours": "Mon–Fri 9am–5pm"},
    {"id": "sg5",  "name": "William Way LGBT Community Center",       "address": "1315 Spruce St, Philadelphia, PA 19107",       "latitude": 39.9475, "longitude": -75.1633, "phone": "215-732-2220", "hours": "Mon–Sat 9am–9pm"},
    {"id": "sg6",  "name": "Mazzoni Center Support Groups",           "address": "1348 Bainbridge St, Philadelphia, PA 19147",   "latitude": 39.9404, "longitude": -75.1622, "phone": "215-563-0652", "hours": "See schedule"},
    {"id": "sg7",  "name": "Survivors of Violent Trauma — WOAR",     "address": "100 N 20th St, Philadelphia, PA 19103",        "latitude": 39.9552, "longitude": -75.1766, "phone": "215-985-3315", "hours": "Mon–Fri 9am–5pm"},
    {"id": "sg8",  "name": "Al-Anon Family Groups — Philly",          "address": "2601 Pennsylvania Ave, Philadelphia, PA 19130","latitude": 39.9607, "longitude": -75.1796, "phone": "215-222-5244", "hours": "See local meeting schedule"},
    {"id": "sg9",  "name": "DBHIDS Peer Support Warmline",            "address": "1101 Market St, Philadelphia, PA 19107",       "latitude": 39.9508, "longitude": -75.1584, "phone": "855-634-5272", "hours": "Daily 4pm–10pm"},
    {"id": "sg10", "name": "GRASP — Grief Recovery After Substance",  "address": "3740 Spruce St, Philadelphia, PA 19104",       "latitude": 39.9515, "longitude": -75.1978, "phone": None,           "hours": "See schedule"},
]


def seed():
    db = SessionLocal()
    inserted = 0
    skipped = 0

    all_items = (
        [(r, ResourceCategory.food_bank)   for r in FOOD_BANKS] +
        [(r, ResourceCategory.mental_health) for r in MENTAL_HEALTH] +
        [(r, ResourceCategory.septa)       for r in SEPTA_STOPS] +
        [(r, ResourceCategory.support_group) for r in SUPPORT_GROUPS]
    )

    try:
        for data, cat in all_items:
            existing = db.query(Resource).filter(Resource.id == data["id"]).first()
            if existing:
                skipped += 1
                continue
            db.add(Resource(
                id=data["id"],
                name=data["name"],
                category=cat,
                address=data.get("address", ""),
                latitude=data["latitude"],
                longitude=data["longitude"],
                phone=data.get("phone"),
                hours=data.get("hours"),
                is_active=True,
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
