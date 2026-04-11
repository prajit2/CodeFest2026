"""
Realistic stub data for Philly.
Swap these out as real DB data comes in — endpoints already handle both.
"""
from datetime import datetime, timedelta

STUB_RESOURCES = [
    {"id": "r1", "name": "Broad Street Ministry Pantry", "category": "food_bank", "address": "315 S Broad St, Philadelphia, PA 19107", "latitude": 39.9442, "longitude": -75.1657, "phone": "215-735-4847", "hours": "Tue & Thu 10am–1pm"},
    {"id": "r2", "name": "Sunday Breakfast Rescue Mission", "category": "food_bank", "address": "302 N 13th St, Philadelphia, PA 19107", "latitude": 39.9567, "longitude": -75.1601, "phone": "215-922-6400", "hours": "Daily 7am–8pm"},
    {"id": "r3", "name": "Project HOME — Stephen Klein Wellness", "category": "shelter", "address": "2144 Cecil B Moore Ave, Philadelphia, PA 19121", "latitude": 39.9794, "longitude": -75.1634, "phone": "215-232-7272", "hours": "24/7"},
    {"id": "r4", "name": "Bethesda Project Care for Friends", "category": "shelter", "address": "1630 Washington Ave, Philadelphia, PA 19146", "latitude": 39.9367, "longitude": -75.1742, "phone": "215-985-1600", "hours": "24/7"},
    {"id": "r5", "name": "Health Center 4 — PHMC", "category": "clinic", "address": "4400 Haverford Ave, Philadelphia, PA 19104", "latitude": 39.9716, "longitude": -75.1904, "phone": "215-386-1220", "hours": "Mon–Fri 8am–5pm"},
    {"id": "r6", "name": "Penn Medicine Behavioral Health", "category": "mental_health", "address": "3535 Market St, Philadelphia, PA 19104", "latitude": 39.9558, "longitude": -75.1943, "phone": "215-746-7100", "hours": "Mon–Fri 9am–5pm"},
    {"id": "r7", "name": "Council for Recovery", "category": "support_group", "address": "8 Penn Center, 1628 JFK Blvd, Philadelphia, PA 19103", "latitude": 39.9534, "longitude": -75.1674, "phone": "215-favorecovery", "hours": "See schedule"},
    {"id": "r8", "name": "Narcotics Anonymous — Center City", "category": "support_group", "address": "1601 Walnut St, Philadelphia, PA 19103", "latitude": 39.9512, "longitude": -75.1679, "phone": None, "hours": "Mon/Wed/Fri 7pm"},
    {"id": "r9", "name": "Drexel Student Health Center", "category": "campus_resource", "address": "3201 Arch St, Philadelphia, PA 19104", "latitude": 39.9563, "longitude": -75.1874, "phone": "215-895-2390", "hours": "Mon–Fri 8:30am–5pm"},
    {"id": "r10", "name": "Temple University Tuttleman Center", "category": "campus_resource", "address": "1700 N Broad St, Philadelphia, PA 19121", "latitude": 39.9806, "longitude": -75.1551, "phone": "215-204-7276", "hours": "Mon–Fri 9am–5pm"},
    {"id": "s1", "name": "15th St & Market St (BSL)", "category": "septa", "address": "15th St Station, Philadelphia, PA", "latitude": 39.9524, "longitude": -75.1655, "phone": None, "hours": "5am–1am"},
    {"id": "s2", "name": "30th St Station", "category": "septa", "address": "2955 Market St, Philadelphia, PA 19104", "latitude": 39.9566, "longitude": -75.1825, "phone": None, "hours": "5am–1am"},
]

def _iso(dt: datetime) -> str:
    return dt.isoformat() + "Z"

now = datetime.utcnow()

STUB_EVENTS = [
    {"id": "e1", "title": "Drexel Free Lunch — Student Center", "description": "Free hot lunch for all Drexel students. No ID required.", "university": "drexel", "location": "Creese Student Center, 3210 Chestnut St", "latitude": 39.9559, "longitude": -75.1887, "start_time": _iso(now + timedelta(hours=2)), "end_time": _iso(now + timedelta(hours=4)), "category": "free_food"},
    {"id": "e2", "title": "Temple Food Pantry Open Hours", "description": "Temple's on-campus food pantry, open to all students.", "university": "temple", "location": "Student Center, 1755 N 13th St", "latitude": 39.9812, "longitude": -75.1558, "start_time": _iso(now + timedelta(hours=5)), "end_time": _iso(now + timedelta(hours=7)), "category": "free_food"},
    {"id": "e3", "title": "UPenn Free Community Breakfast", "description": "Houston Hall community breakfast, open to the public.", "university": "upenn", "location": "Houston Hall, 3417 Spruce St", "latitude": 39.9523, "longitude": -75.1954, "start_time": _iso(now + timedelta(days=1)), "end_time": _iso(now + timedelta(days=1, hours=2)), "category": "free_food"},
    {"id": "e4", "title": "CCP Student Food Pantry", "description": "Free groceries for CCP students. Bring your student ID.", "university": "ccp", "location": "Bonnell Building, 1700 Spring Garden St", "latitude": 39.9609, "longitude": -75.1671, "start_time": _iso(now + timedelta(days=1, hours=3)), "end_time": _iso(now + timedelta(days=1, hours=5)), "category": "free_food"},
    {"id": "e5", "title": "Mobile Health Clinic — Kensington", "description": "Free health screenings, vaccinations, and referrals.", "university": None, "location": "Kensington Ave & Lehigh Ave", "latitude": 39.9993, "longitude": -75.1335, "start_time": _iso(now + timedelta(days=2)), "end_time": _iso(now + timedelta(days=2, hours=4)), "category": "clinic_popup"},
    {"id": "e6", "title": "NA Meeting — Center City", "description": "Open NA meeting. All are welcome.", "university": None, "location": "1601 Walnut St, Philadelphia", "latitude": 39.9512, "longitude": -75.1679, "start_time": _iso(now + timedelta(hours=8)), "end_time": _iso(now + timedelta(hours=9, minutes=30)), "category": "event"},
]

STUB_CRIME_POINTS = [
    {"latitude": 39.9993, "longitude": -75.1335, "weight": 1.0},
    {"latitude": 39.9850, "longitude": -75.1450, "weight": 0.85},
    {"latitude": 39.9750, "longitude": -75.1380, "weight": 0.75},
    {"latitude": 39.9620, "longitude": -75.1480, "weight": 0.55},
    {"latitude": 39.9440, "longitude": -75.1590, "weight": 0.45},
    {"latitude": 39.9380, "longitude": -75.1720, "weight": 0.60},
    {"latitude": 39.9530, "longitude": -75.1560, "weight": 0.40},
]

STUB_SEPTA_ARRIVALS = {
    "s1": [
        {"route": "BSL", "destination": "Fern Rock TC", "minutes_away": 3},
        {"route": "BSL", "destination": "AT&T Station", "minutes_away": 11},
        {"route": "17", "destination": "Olney TC", "minutes_away": 6},
    ],
    "s2": [
        {"route": "MFL", "destination": "Upper Darby", "minutes_away": 4},
        {"route": "MFL", "destination": "Frankford TC", "minutes_away": 9},
        {"route": "31", "destination": "Grays Ferry", "minutes_away": 8},
    ],
}
