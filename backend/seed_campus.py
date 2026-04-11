"""
Seed campus resources for all 6 supported universities.
University slug is stored in the description field.

Run from backend/ directory:
  source venv/bin/activate && python seed_campus.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
from models import Resource, ResourceCategory

# Each entry has a "university" key that gets stored in description
CAMPUS_RESOURCES = [
    # ── Drexel ───────────────────────────────────────────────────────────
    {"id": "cr_drexel_health",    "university": "drexel", "name": "Drexel Student Health Center",         "address": "3201 Arch St, Philadelphia, PA 19104",         "latitude": 39.9563, "longitude": -75.1874, "phone": "215-895-2390", "hours": "Mon–Fri 8:30am–5pm"},
    {"id": "cr_drexel_counsel",   "university": "drexel", "name": "Drexel Counseling Center",             "address": "3220 Chestnut St, Philadelphia, PA 19104",     "latitude": 39.9557, "longitude": -75.1862, "phone": "215-895-1415", "hours": "Mon–Fri 9am–5pm"},
    {"id": "cr_drexel_food",      "university": "drexel", "name": "Drexel Food Pantry (Lindy Center)",    "address": "3025 JFK Blvd, Philadelphia, PA 19104",        "latitude": 39.9554, "longitude": -75.1823, "phone": "215-895-1882", "hours": "Mon–Fri 10am–4pm"},
    {"id": "cr_drexel_drc",       "university": "drexel", "name": "Drexel Disability Resources Center",   "address": "3201 Arch St Ste 210, Philadelphia, PA 19104", "latitude": 39.9563, "longitude": -75.1874, "phone": "215-895-1401", "hours": "Mon–Fri 8:30am–5pm"},
    {"id": "cr_drexel_rec",       "university": "drexel", "name": "Drexel Recreation Center",             "address": "3300 Race St, Philadelphia, PA 19104",         "latitude": 39.9579, "longitude": -75.1877, "phone": "215-895-1975", "hours": "Mon–Fri 6am–11pm, Sat–Sun 8am–10pm"},

    # ── Temple ───────────────────────────────────────────────────────────
    {"id": "cr_temple_tuttleman", "university": "temple", "name": "Temple Tuttleman Counseling Center",   "address": "1700 N Broad St, Philadelphia, PA 19121",      "latitude": 39.9806, "longitude": -75.1551, "phone": "215-204-7276", "hours": "Mon–Fri 9am–5pm"},
    {"id": "cr_temple_health",    "university": "temple", "name": "Temple Student Health Services",       "address": "1700 N Broad St Ste 100, Philadelphia, PA",    "latitude": 39.9806, "longitude": -75.1551, "phone": "215-204-7500", "hours": "Mon–Fri 8:30am–5pm"},
    {"id": "cr_temple_pantry",    "university": "temple", "name": "Temple Campus Food Pantry",            "address": "1755 N 13th St, Philadelphia, PA 19122",       "latitude": 39.9812, "longitude": -75.1558, "phone": "215-204-1356", "hours": "Mon & Wed 11am–1pm"},
    {"id": "cr_temple_drc",       "university": "temple", "name": "Temple Disability Resources & Services","address": "Howard Gittis Student Center, Philadelphia, PA","latitude": 39.9810, "longitude": -75.1550, "phone": "215-204-1280", "hours": "Mon–Fri 8:30am–5pm"},
    {"id": "cr_temple_rec",       "university": "temple", "name": "Temple IBC Student Recreation Center", "address": "1700 N Broad St, Philadelphia, PA 19121",      "latitude": 39.9798, "longitude": -75.1555, "phone": "215-204-8787", "hours": "Mon–Fri 6am–11pm"},

    # ── UPenn ────────────────────────────────────────────────────────────
    {"id": "cr_upenn_caps",       "university": "upenn",  "name": "UPenn CAPS (Counseling)",              "address": "3624 Market St Ste 1S, Philadelphia, PA 19104","latitude": 39.9542, "longitude": -75.1963, "phone": "215-898-7021", "hours": "Mon–Fri 9am–5pm"},
    {"id": "cr_upenn_health",     "university": "upenn",  "name": "UPenn Student Health Service",         "address": "3535 Market St, Philadelphia, PA 19104",       "latitude": 39.9558, "longitude": -75.1943, "phone": "215-746-3535", "hours": "Mon–Fri 8am–6pm"},
    {"id": "cr_upenn_pantry",     "university": "upenn",  "name": "UPenn Student Food Pantry (Houston Hall)","address": "3417 Spruce St, Philadelphia, PA 19104",    "latitude": 39.9523, "longitude": -75.1954, "phone": "215-898-5000", "hours": "Tue & Thu 12pm–4pm"},
    {"id": "cr_upenn_drc",        "university": "upenn",  "name": "UPenn Weingarten Center (Disabilities)","address": "3702 Spruce St, Philadelphia, PA 19104",      "latitude": 39.9512, "longitude": -75.1992, "phone": "215-573-9235", "hours": "Mon–Fri 9am–5pm"},
    {"id": "cr_upenn_wellness",   "university": "upenn",  "name": "UPenn Wellness at Penn",               "address": "3624 Market St, Philadelphia, PA 19104",       "latitude": 39.9542, "longitude": -75.1963, "phone": "215-898-9355", "hours": "Mon–Fri 9am–5pm"},

    # ── CCP ──────────────────────────────────────────────────────────────
    {"id": "cr_ccp_counsel",      "university": "ccp",    "name": "CCP Counseling & Psychological Services","address": "1700 Spring Garden St, Philadelphia, PA 19130","latitude": 39.9609, "longitude": -75.1671, "phone": "215-751-8169", "hours": "Mon–Fri 9am–5pm"},
    {"id": "cr_ccp_health",       "university": "ccp",    "name": "CCP Health Services",                  "address": "1700 Spring Garden St, Philadelphia, PA 19130","latitude": 39.9609, "longitude": -75.1671, "phone": "215-751-8178", "hours": "Mon–Fri 8:30am–5pm"},
    {"id": "cr_ccp_pantry",       "university": "ccp",    "name": "CCP Student Food Pantry",              "address": "Bonnell Building, 1700 Spring Garden St, PA", "latitude": 39.9612, "longitude": -75.1669, "phone": "215-751-8010", "hours": "Mon/Wed/Fri 10am–2pm"},
    {"id": "cr_ccp_basicneeds",   "university": "ccp",    "name": "CCP Basic Needs Resource Hub",         "address": "1700 Spring Garden St, Philadelphia, PA 19130","latitude": 39.9609, "longitude": -75.1671, "phone": "215-751-8010", "hours": "Mon–Fri 9am–5pm"},

    # ── Saint Joseph's ───────────────────────────────────────────────────
    {"id": "cr_sju_counsel",      "university": "saint_josephs", "name": "SJU University Counseling Center", "address": "5600 City Ave, Philadelphia, PA 19131",    "latitude": 40.0038, "longitude": -75.2279, "phone": "610-660-1090", "hours": "Mon–Fri 8:30am–5pm"},
    {"id": "cr_sju_health",       "university": "saint_josephs", "name": "SJU Student Health Center",       "address": "5600 City Ave, Philadelphia, PA 19131",    "latitude": 40.0038, "longitude": -75.2279, "phone": "610-660-1175", "hours": "Mon–Fri 8:30am–4:30pm"},
    {"id": "cr_sju_food",         "university": "saint_josephs", "name": "SJU Hawk Pantry",                 "address": "5600 City Ave, Philadelphia, PA 19131",    "latitude": 40.0041, "longitude": -75.2281, "phone": "610-660-1000", "hours": "Mon–Fri 10am–3pm"},
    {"id": "cr_sju_drc",          "university": "saint_josephs", "name": "SJU Office of Disability Services","address": "5600 City Ave, Philadelphia, PA 19131",   "latitude": 40.0038, "longitude": -75.2279, "phone": "610-660-1774", "hours": "Mon–Fri 8:30am–5pm"},

    # ── La Salle ─────────────────────────────────────────────────────────
    {"id": "cr_lasalle_counsel",  "university": "lasalle", "name": "La Salle Counseling Center",          "address": "1900 W Olney Ave, Philadelphia, PA 19141",    "latitude": 40.0348, "longitude": -75.1639, "phone": "215-951-1355", "hours": "Mon–Fri 9am–5pm"},
    {"id": "cr_lasalle_health",   "university": "lasalle", "name": "La Salle Student Health Center",      "address": "1900 W Olney Ave, Philadelphia, PA 19141",    "latitude": 40.0348, "longitude": -75.1639, "phone": "215-951-1565", "hours": "Mon–Fri 8:30am–5pm"},
    {"id": "cr_lasalle_food",     "university": "lasalle", "name": "La Salle Explorer Food Pantry",       "address": "1900 W Olney Ave, Philadelphia, PA 19141",    "latitude": 40.0351, "longitude": -75.1637, "phone": "215-951-1014", "hours": "Tue & Thu 11am–2pm"},
    {"id": "cr_lasalle_drc",      "university": "lasalle", "name": "La Salle Disability Support Services", "address": "1900 W Olney Ave, Philadelphia, PA 19141",   "latitude": 40.0348, "longitude": -75.1639, "phone": "215-951-1blind", "hours": "Mon–Fri 8:30am–5pm"},
]


def seed():
    db = SessionLocal()
    inserted = 0
    skipped = 0
    try:
        for data in CAMPUS_RESOURCES:
            if db.query(Resource).filter(Resource.id == data["id"]).first():
                skipped += 1
                continue
            db.add(Resource(
                id=data["id"],
                name=data["name"],
                category=ResourceCategory.campus_resource,
                address=data.get("address", ""),
                latitude=data["latitude"],
                longitude=data["longitude"],
                phone=data.get("phone"),
                hours=data.get("hours"),
                description=data["university"],  # university slug stored here
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
