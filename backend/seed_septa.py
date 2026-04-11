"""
Seed additional SEPTA stops — full BSL, full MFL, key Regional Rail.

Run from backend/ directory:
  source venv/bin/activate && python seed_septa.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
from models import Resource, ResourceCategory

EXTRA_SEPTA = [
    # ── Broad Street Line (BSL) — missing stations ──────────────────────
    {"id": "sep_bsl_waynejct",    "name": "Wayne Junction (BSL)",         "address": "Wayne Ave & Chelten Ave, Philadelphia, PA",    "latitude": 40.0266, "longitude": -75.1612},
    {"id": "sep_bsl_huntingpark", "name": "Hunting Park (BSL)",           "address": "Broad & Hunting Park Ave, Philadelphia, PA",   "latitude": 40.0170, "longitude": -75.1543},
    {"id": "sep_bsl_logan",       "name": "Logan (BSL)",                  "address": "Broad &당 Somerville Ave, Philadelphia, PA",  "latitude": 40.0101, "longitude": -75.1541},
    {"id": "sep_bsl_wyoming",     "name": "Wyoming (BSL)",                "address": "Broad & Wyoming Ave, Philadelphia, PA",        "latitude": 40.0028, "longitude": -75.1537},
    {"id": "sep_bsl_allegheny",   "name": "Allegheny (BSL)",              "address": "Broad & Allegheny Ave, Philadelphia, PA",      "latitude": 39.9966, "longitude": -75.1533},
    {"id": "sep_bsl_northphilly", "name": "North Philadelphia (BSL/Rail)","address": "Broad & Glenwood Ave, Philadelphia, PA",       "latitude": 39.9904, "longitude": -75.1530},
    {"id": "sep_bsl_susdau",      "name": "Susquehanna–Dauphin (BSL)",    "address": "Broad & Dauphin St, Philadelphia, PA",         "latitude": 39.9845, "longitude": -75.1526},
    {"id": "sep_bsl_lombsouth",   "name": "Lombard–South (BSL)",          "address": "Broad & South St, Philadelphia, PA",           "latitude": 39.9433, "longitude": -75.1638},
    {"id": "sep_bsl_pattison",    "name": "AT&T / Pattison Station (BSL)","address": "Broad & Pattison Ave, Philadelphia, PA",       "latitude": 39.9020, "longitude": -75.1651},

    # ── Market-Frankford Line (MFL) — missing stations ───────────────────
    {"id": "sep_mfl_63rd",        "name": "63rd St (MFL)",                "address": "63rd & Market St, Philadelphia, PA",           "latitude": 39.9617, "longitude": -75.2461},
    {"id": "sep_mfl_60th",        "name": "60th St (MFL)",                "address": "60th & Market St, Philadelphia, PA",           "latitude": 39.9617, "longitude": -75.2380},
    {"id": "sep_mfl_56th",        "name": "56th St (MFL)",                "address": "56th & Market St, Philadelphia, PA",           "latitude": 39.9617, "longitude": -75.2297},
    {"id": "sep_mfl_52nd",        "name": "52nd St (MFL)",                "address": "52nd & Market St, Philadelphia, PA",           "latitude": 39.9617, "longitude": -75.2212},
    {"id": "sep_mfl_46th",        "name": "46th St (MFL)",                "address": "46th & Market St, Philadelphia, PA",           "latitude": 39.9619, "longitude": -75.2101},
    {"id": "sep_mfl_40th",        "name": "40th St (MFL)",                "address": "40th & Market St, Philadelphia, PA",           "latitude": 39.9621, "longitude": -75.1989},
    {"id": "sep_mfl_34th",        "name": "34th St (MFL)",                "address": "34th & Market St, Philadelphia, PA",           "latitude": 39.9571, "longitude": -75.1879},
    {"id": "sep_mfl_13th",        "name": "13th St (MFL)",                "address": "13th & Market St, Philadelphia, PA",           "latitude": 39.9517, "longitude": -75.1609},
    {"id": "sep_mfl_11th",        "name": "11th St (MFL)",                "address": "11th & Market St, Philadelphia, PA",           "latitude": 39.9517, "longitude": -75.1581},
    {"id": "sep_mfl_8th",         "name": "8th St (MFL)",                 "address": "8th & Market St, Philadelphia, PA",            "latitude": 39.9517, "longitude": -75.1540},
    {"id": "sep_mfl_5th",         "name": "5th St (MFL)",                 "address": "5th & Market St, Philadelphia, PA",            "latitude": 39.9517, "longitude": -75.1496},
    {"id": "sep_mfl_2nd",         "name": "2nd St (MFL)",                 "address": "2nd & Market St, Philadelphia, PA",            "latitude": 39.9517, "longitude": -75.1448},
    {"id": "sep_mfl_sprinarden",  "name": "Spring Garden (MFL)",          "address": "Front & Spring Garden, Philadelphia, PA",      "latitude": 39.9620, "longitude": -75.1388},
    {"id": "sep_mfl_girard",      "name": "Girard (MFL)",                 "address": "Front & Girard Ave, Philadelphia, PA",         "latitude": 39.9721, "longitude": -75.1376},
    {"id": "sep_mfl_yorkdauphin", "name": "York–Dauphin (MFL)",           "address": "Front & Dauphin St, Philadelphia, PA",         "latitude": 39.9801, "longitude": -75.1370},
    {"id": "sep_mfl_huntingdon",  "name": "Huntingdon (MFL)",             "address": "Front & Huntingdon St, Philadelphia, PA",      "latitude": 39.9875, "longitude": -75.1366},
    {"id": "sep_mfl_somerset",    "name": "Somerset (MFL)",               "address": "Front & Somerset St, Philadelphia, PA",        "latitude": 39.9946, "longitude": -75.1364},
    {"id": "sep_mfl_allegheny",   "name": "Allegheny (MFL)",              "address": "Front & Allegheny Ave, Philadelphia, PA",      "latitude": 40.0019, "longitude": -75.1357},
    {"id": "sep_mfl_kensington",  "name": "Kensington (MFL)",             "address": "Kensington & Allegheny, Philadelphia, PA",     "latitude": 40.0088, "longitude": -75.1311},
    {"id": "sep_mfl_tioga",       "name": "Tioga (MFL)",                  "address": "Tioga & Kensington Ave, Philadelphia, PA",     "latitude": 40.0140, "longitude": -75.1267},
    {"id": "sep_mfl_erie",        "name": "Erie–Torresdale (MFL)",        "address": "Erie Ave & Torresdale Ave, Philadelphia, PA",  "latitude": 40.0190, "longitude": -75.1213},
    {"id": "sep_mfl_church",      "name": "Church (MFL)",                 "address": "Kensington & Church St, Philadelphia, PA",     "latitude": 40.0398, "longitude": -75.0806},
    {"id": "sep_mfl_margaretorth","name": "Margaret–Orthodox (MFL)",      "address": "Frankford & Orthodox St, Philadelphia, PA",    "latitude": 40.0337, "longitude": -75.0658},

    # ── Regional Rail — key Philly-area stations ─────────────────────────
    {"id": "sep_rr_northphilly",  "name": "North Philadelphia (Regional Rail)", "address": "2900 N Broad St, Philadelphia, PA",      "latitude": 39.9904, "longitude": -75.1530},
    {"id": "sep_rr_northbroad",   "name": "North Broad (Regional Rail)",  "address": "N Broad & Glenwood, Philadelphia, PA",         "latitude": 39.9944, "longitude": -75.1556},
    {"id": "sep_rr_germantown",   "name": "Germantown (Regional Rail)",   "address": "Germantown Ave & Chelten, Philadelphia, PA",   "latitude": 40.0381, "longitude": -75.1717},
    {"id": "sep_rr_chesthill_e",  "name": "Chestnut Hill East (Regional Rail)", "address": "Chestnut Hill Ave, Philadelphia, PA",   "latitude": 40.0757, "longitude": -75.1906},
    {"id": "sep_rr_chesthill_w",  "name": "Chestnut Hill West (Regional Rail)", "address": "Bethlehem Pike, Philadelphia, PA",      "latitude": 40.0742, "longitude": -75.2109},
    {"id": "sep_rr_jenkintown",   "name": "Jenkintown–Wyncote (Regional Rail)", "address": "Greenwood Ave, Jenkintown, PA 19046",   "latitude": 40.0957, "longitude": -75.1264},
    {"id": "sep_rr_elkins",       "name": "Elkins Park (Regional Rail)",  "address": "Church Rd, Elkins Park, PA 19027",             "latitude": 40.0766, "longitude": -75.1292},
    {"id": "sep_rr_feasterville", "name": "Somerton (Regional Rail)",     "address": "Somerton Ave, Philadelphia, PA 19116",         "latitude": 40.1131, "longitude": -75.0181},
    {"id": "sep_rr_ardmore",      "name": "Ardmore (Regional Rail/NHSL)", "address": "Ardmore Ave, Ardmore, PA 19003",               "latitude": 40.0045, "longitude": -75.2906},
    {"id": "sep_rr_norristown",   "name": "Norristown TC (Regional Rail)","address": "1 W Lafayette St, Norristown, PA 19401",       "latitude": 40.1218, "longitude": -75.3402},
    {"id": "sep_rr_doylestown",   "name": "Doylestown (Regional Rail)",   "address": "W State St, Doylestown, PA 18901",             "latitude": 40.3101, "longitude": -75.1298},
    {"id": "sep_rr_paoli",        "name": "Paoli (Regional Rail)",        "address": "E Lancaster Ave, Paoli, PA 19301",             "latitude": 40.0420, "longitude": -75.4836},
    {"id": "sep_rr_trenton",      "name": "Trenton (Regional Rail)",      "address": "72 S Clinton Ave, Trenton, NJ 08609",          "latitude": 40.2179, "longitude": -74.7560},
    {"id": "sep_rr_airport",      "name": "Philadelphia Intl Airport (Regional Rail)", "address": "Terminal E/F, Philadelphia, PA", "latitude": 39.8764, "longitude": -75.2427},
]


def seed():
    db = SessionLocal()
    inserted = 0
    skipped = 0
    try:
        for data in EXTRA_SEPTA:
            if db.query(Resource).filter(Resource.id == data["id"]).first():
                skipped += 1
                continue
            db.add(Resource(
                id=data["id"],
                name=data["name"],
                category=ResourceCategory.septa,
                address=data.get("address", ""),
                latitude=data["latitude"],
                longitude=data["longitude"],
                phone=None,
                hours="5am–1am daily",
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
