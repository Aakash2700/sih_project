from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional, Literal
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from uuid import uuid4
import sqlite3 
from fastapi import WebSocket, WebSocketDisconnect
import os
import random
import joblib

# -------------------- CONFIG --------------------
SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey") # change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# -------------------- FASTAPI APP --------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- WEBSOCKET MANAGER --------------------
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict):
        stale = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except Exception:
                stale.append(ws)
        for s in stale:
            self.disconnect(s)

manager = ConnectionManager()

import libsql
# -------------------- DATABASE --------------------
# The following variables are placeholders. Please replace them with your Turso database URL and auth token.
# You can get these values by running the following commands in your terminal:
# turso db show --url <database-name>
# turso db tokens create <database-name>
TURSO_DATABASE_URL = os.environ.get("TURSO_DATABASE_URL", "YOUR_TURSO_DATABASE_URL")
TURSO_AUTH_TOKEN = os.environ.get("TURSO_AUTH_TOKEN", "YOUR_TURSO_AUTH_TOKEN")

def get_db_connection():
    """Get a new database connection for each request"""
    conn = libsql.connect(
        database=TURSO_DATABASE_URL,
        auth_token=TURSO_AUTH_TOKEN
    )
    return conn

# Initialize database tables
def init_database():
    """Initialize database tables"""
    conn = get_db_connection()
    
    # Drop users table for re-seeding
    conn.execute("DROP TABLE IF EXISTS users")

    # Users table (for authentication + village)
    conn.execute("""
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT,
        role TEXT CHECK(role IN ('admin','user')),
        village TEXT
    )
    """)

    # Sensors
    conn.execute("""
    CREATE TABLE IF NOT EXISTS sensor_data (
        id TEXT PRIMARY KEY,
        village TEXT,
        lat REAL,
        lng REAL,
        temperature REAL,
        ph REAL,
        turbidity REAL,
        tds REAL,
        status TEXT,
        last_updated TEXT,
        name TEXT,
        type TEXT,
        manufacturer TEXT
    )
    """)

    # Ensure metadata columns exist for older DBs
    try:
        conn.execute("ALTER TABLE sensor_data ADD COLUMN name TEXT")
    except Exception:
        pass
    try:
        conn.execute("ALTER TABLE sensor_data ADD COLUMN type TEXT")
    except Exception:
        pass
    try:
        conn.execute("ALTER TABLE sensor_data ADD COLUMN manufacturer TEXT")
    except Exception: 
        pass

    conn.execute("""
    CREATE TABLE IF NOT EXISTS sensor_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_id TEXT,
        village TEXT,
        temperature REAL,
        ph REAL,
        turbidity REAL,
        tds REAL,
        created_at TEXT
    )
    """)

    conn.execute("""
    CREATE TABLE IF NOT EXISTS health_reports (
        id TEXT PRIMARY KEY,
        village TEXT,
        symptoms TEXT,     
        created_at TEXT,
        phone TEXT
    )
    """)

    # Ensure phone column exists for older DBs
    try:
        conn.execute("ALTER TABLE health_reports ADD COLUMN phone TEXT")
    except Exception:
        pass

    conn.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        sensor_id TEXT,
        message TEXT,
        level TEXT,
        timestamp TEXT,
        acknowledged INTEGER DEFAULT 0
    )
    """)

    conn.commit()
    conn.close()

# Initialize database
init_database()

# -------------------- SEED SAMPLE DATA (if empty) --------------------
def seed_if_empty():
    try:
        conn = get_db_connection()
        sensor_count = conn.execute("SELECT COUNT(*) FROM sensor_data").fetchone()[0]
        if sensor_count == 0:
            now = datetime.utcnow().isoformat()
            sample_sensors = [
                {"id": "SEN-001", "village": "Guwahati", "lat": 26.1445, "lng": 91.7362, "temperature": 24.5, "ph": 7.2, "turbidity": 3.1, "tds": 250},
                {"id": "SEN-002", "village": "Shillong", "lat": 25.5788, "lng": 91.8933, "temperature": 18.3, "ph": 6.9, "turbidity": 5.0, "tds": 320},
                {"id": "SEN-003", "village": "Silchar", "lat": 24.8333, "lng": 92.7789, "temperature": 27.1, "ph": 8.7, "turbidity": 12.0, "tds": 520},
                {"id": "SEN-004", "village": "Aizawl", "lat": 23.7271, "lng": 92.7176, "temperature": 21.0, "ph": 7.5, "turbidity": 2.0, "tds": 180},
                {"id": "SEN-005", "village": "Imphal", "lat": 24.8170, "lng": 93.9368, "temperature": 22.4, "ph": 7.0, "turbidity": 4.0, "tds": 260},
                {"id": "SEN-006", "village": "Kohima", "lat": 25.6751, "lng": 94.1086, "temperature": 19.8, "ph": 6.8, "turbidity": 3.5, "tds": 240},
                {"id": "SEN-007", "village": "Agartala", "lat": 23.8315, "lng": 91.2868, "temperature": 28.2, "ph": 7.4, "turbidity": 6.0, "tds": 300},
                {"id": "SEN-008", "village": "Itanagar", "lat": 27.0844, "lng": 93.6053, "temperature": 17.6, "ph": 7.1, "turbidity": 2.8, "tds": 200},
                {"id": "SEN-009", "village": "Gangtok", "lat": 27.3389, "lng": 88.6065, "temperature": 15.2, "ph": 7.6, "turbidity": 1.8, "tds": 160},
                {"id": "SEN-010", "village": "VIT-AP Vijayawada", "lat": 16.4937, "lng": 80.5, "temperature": 29.0, "ph": 7.3, "turbidity": 4.5, "tds": 310},
                {"id": "SEN-011", "village": "Dispur", "lat": 26.14, "lng": 91.77, "temperature": 25.0, "ph": 6.5, "turbidity": 8.0, "tds": 400},
                {"id": "SEN-012", "village": "Jorhat", "lat": 26.75, "lng": 94.22, "temperature": 26.5, "ph": 7.8, "turbidity": 9.5, "tds": 450},
                {"id": "SEN-013", "village": "Dibrugarh", "lat": 27.47, "lng": 94.9, "temperature": 27.0, "ph": 8.2, "turbidity": 11.0, "tds": 550},
                {"id": "SEN-014", "village": "Tinsukia", "lat": 27.5, "lng": 95.37, "temperature": 28.0, "ph": 6.0, "turbidity": 15.0, "tds": 600},
                {"id": "SEN-015", "village": "Tezpur", "lat": 26.65, "lng": 92.79, "temperature": 29.5, "ph": 9.0, "turbidity": 7.0, "tds": 350},
            ]
            for i, s in enumerate(sample_sensors):
                day_offset = i // 2 # Two sensors per day
                now = (datetime.utcnow() - timedelta(days=day_offset)).isoformat()
                conn.execute(
                    """
                    INSERT OR REPLACE INTO sensor_data
                    (id, village, lat, lng, temperature, ph, turbidity, tds, status, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (s["id"], s["village"], s["lat"], s["lng"], s["temperature"], s["ph"], s["turbidity"], s["tds"], "online", now),
                )
                # add recent history points
                for j in range(10):
                    hist_time = (datetime.utcnow() - timedelta(days=day_offset, minutes=10 - j)).isoformat()
                    jitter = (j % 3) * 0.1
                    conn.execute(
                        """
                        INSERT INTO sensor_history (sensor_id, village, temperature, ph, turbidity, tds, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            s["id"], s["village"],
                            round(s["temperature"] + jitter, 2),
                            round(s["ph"] + (0.05 - jitter/10), 2),
                            round(s["turbidity"] + jitter, 2),
                            round(s["tds"] + jitter * 10, 1),
                            hist_time,
                        ),
                    )
                # seed alert for abnormal values
                try:
                    unsafe = s["ph"] < 6.5 or s["ph"] > 8.5 or s["turbidity"] > 10 or s["tds"] > 500
                    warn = (5 < s["turbidity"] <= 10) or (300 < s["tds"] <= 500)
                    level = "danger" if unsafe else ("warning" if warn else None)
                    if level:
                        conn.execute(
                            "INSERT OR REPLACE INTO alerts (id, sensor_id, message, level, timestamp, acknowledged) VALUES (?, ?, ?, ?, ?, 0)",
                            (
                                str(uuid4()),
                                s["id"],
                                f"Water issue detected in {s['village']} (pH={s['ph']}, Turbidity={s['turbidity']}, TDS={s['tds']})",
                                level,
                                now,
                            ),
                        )
                except Exception:
                    pass
            if conn.execute("SELECT COUNT(*) FROM users WHERE username=?", ("aakash",)).fetchone()[0] == 0:
                conn.execute(
                    "INSERT INTO users (username, password, role, village) VALUES (?, ?, ?, ?)",
                    ("aakash", get_password_hash("aakash@1234"), "admin", None),
                )
            if conn.execute("SELECT COUNT(*) FROM health_reports").fetchone()[0] == 0:
                hr = [
                    {"id": "HR-1", "village": "Guwahati", "symptoms": ["diarrhea", "nausea"]},
                    {"id": "HR-2", "village": "Silchar", "symptoms": ["fever"]},
                    {"id": "HR-3", "village": "Aizawl", "symptoms": ["stomach pain"]},
                ]
                for r in hr:
                    conn.execute(
                        "INSERT OR REPLACE INTO health_reports (id, village, symptoms, created_at) VALUES (?, ?, ?, ?)",
                        (r["id"], r["village"], ",".join(r["symptoms"]), now),
                    )
            conn.commit()
        conn.close()
    except Exception:
        # Non-fatal if seeding fails
        pass

seed_if_empty()

# -------------------- MODELS --------------------
# Load water safety and disease prediction models
try:
    from water_safety_model import predict_water_safety, predict_disease
    ML_MODELS_AVAILABLE = True
except Exception as e:
    print(f"Error loading ML models: {e}")
    ML_MODELS_AVAILABLE = False

# -------------------- SCHEMAS --------------------
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    village: Optional[str] = None

class User(BaseModel):
    username: str
    role: str
    village: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    password: str
    village: Optional[str] = None

class SensorReading(BaseModel):
    id: str
    village: str
    lat: float
    lng: float
    temperature: float
    ph: float
    turbidity: float
    tds: float
    name: Optional[str] = None
    type: Optional[str] = None
    manufacturer: Optional[str] = None

class HealthReport(BaseModel):
    id: str
    village: str
    symptoms: List[str]
    phone: Optional[str] = None

class PublicHealthReport(BaseModel):
    id: Optional[str] = None
    village: str
    symptoms: List[str]
    phone: str

class PredictRequest(BaseModel):
    sensor_id: str
    village: str
    temperature: float
    ph: float
    turbidity: float
    tds: float

# -------------------- AUTH HELPERS --------------------
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(username: str):
    conn = get_db_connection()
    row = conn.execute("SELECT username, password, role, village FROM users WHERE username=?", (username,)).fetchone()
    conn.close()
    if row:
        return {"username": row[0], "password": row[1], "role": row[2], "village": row[3]}
    return None

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user or not verify_password(password, user["password"]):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        
        # Check if username is None immediately after extraction
        if username is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # At this point, username is guaranteed to be a string
    user = get_user(username)
    
    if user is None:
        raise credentials_exception
        
    return user

def require_admin(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return user

# -------------------- AUTH ROUTES --------------------
@app.post("/signup")
def signup(user: UserCreate):
    if get_user(user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    try:
        hashed_pw = get_password_hash(user.password)
    except Exception as exc:
        # Typically occurs if bcrypt backend isn't installed
        raise HTTPException(status_code=500, detail=f"Password hashing failed: {type(exc).__name__}")
    try:
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO users (username, password, role, village) VALUES (?, ?, ?, ?)",
            (user.username, hashed_pw, "admin", user.village)
        )
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError as exc:
        # Convert DB integrity errors (e.g., role CHECK) into 400s
        raise HTTPException(status_code=400, detail="Invalid user data: " + str(exc))
    return {"msg": "User created successfully"}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"], "village": user.get("village")}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# -------------------- HELPERS --------------------
def check_alerts(sensor: SensorReading):
    alerts = []
    level = None
    if sensor.ph < 6.5 or sensor.ph > 8.5 or sensor.turbidity > 10 or sensor.tds > 500:
        level = "danger"
    elif 5 < sensor.turbidity <= 10 or 300 < sensor.tds <= 500:
        level = "warning"
    if level:
        alert_id = str(uuid4())
        message = f"Water issue detected in {sensor.village} (pH={sensor.ph}, Turbidity={sensor.turbidity}, TDS={sensor.tds})"
        conn = get_db_connection()
        conn.execute("""
            INSERT OR REPLACE INTO alerts (id, sensor_id, message, level, timestamp, acknowledged)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (alert_id, sensor.id, message, level, datetime.utcnow().isoformat(), 0))
        conn.commit()
        conn.close()
        alerts.append({
            "id": alert_id, "sensorId": sensor.id, "message": message,
            "level": level, "timestamp": datetime.utcnow().isoformat(), "acknowledged": False
        })
    return alerts

# -------------------- ROUTES --------------------
@app.get("/")
def root():
    return {"message": "Water Safety API with Auth, Sensors, Alerts, Health Reports 🚀"}

# ---- Auth utils ----
@app.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"username": user.get("username"), "role": user.get("role"), "village": user.get("village")}

# ---- Sensors ----
@app.post("/sensor_data")
def add_sensor_data(sensor: SensorReading, user: dict = Depends(get_current_user)):
    now = datetime.utcnow().isoformat()
    conn = get_db_connection()
    conn.execute("""
        INSERT OR REPLACE INTO sensor_data
        (id, village, lat, lng, temperature, ph, turbidity, tds, status, last_updated, name, type, manufacturer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (sensor.id, sensor.village, sensor.lat, sensor.lng, sensor.temperature, sensor.ph, sensor.turbidity, sensor.tds, "online", now, sensor.name, sensor.type, sensor.manufacturer))
    conn.execute("""
        INSERT INTO sensor_history (sensor_id, village, temperature, ph, turbidity, tds, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (sensor.id, sensor.village, sensor.temperature, sensor.ph, sensor.turbidity, sensor.tds, now))
    conn.commit()
    conn.close()
    alerts = check_alerts(sensor)
    # broadcast live update
    try:
        import asyncio as _asyncio
        _asyncio.create_task(manager.broadcast({"type": "sensor_update", "sensor": sensor.dict()}))
        for a in alerts:
            _asyncio.create_task(manager.broadcast({"type": "alert", "alert": a}))
    except Exception:
        pass
    return {"status": "ok", "alerts_generated": alerts}

@app.post("/public/sensor_data")
def add_sensor_data_public(sensor: SensorReading):
    now = datetime.utcnow().isoformat()
    conn = get_db_connection()
    conn.execute(
        """
        INSERT OR REPLACE INTO sensor_data
        (id, village, lat, lng, temperature, ph, turbidity, tds, status, last_updated, name, type, manufacturer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (sensor.id, sensor.village, sensor.lat, sensor.lng, sensor.temperature, sensor.ph, sensor.turbidity, sensor.tds, "online", now, getattr(sensor, 'name', None), getattr(sensor, 'type', None), getattr(sensor, 'manufacturer', None))
    )
    conn.execute(
        """
        INSERT INTO sensor_history (sensor_id, village, temperature, ph, turbidity, tds, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (sensor.id, sensor.village, sensor.temperature, sensor.ph, sensor.turbidity, sensor.tds, now)
    )
    conn.commit()
    conn.close()
    
    # Only generate alerts every minute for ESP32 sensors to avoid spam
    alerts = []
    if sensor.id == "SEN-ESP32-001":  # Only for VIT-AP ESP32 sensor
        # Check if we should generate alert (every minute)
        conn = get_db_connection()
        recent_alert = conn.execute("""
            SELECT timestamp FROM alerts 
            WHERE sensor_id = ? AND timestamp > datetime('now', '-1 minute')
            ORDER BY timestamp DESC LIMIT 1
        """, (sensor.id,)).fetchone()
        conn.close()
        
        # Only generate alert if no alert was generated in the last minute
        if not recent_alert:
            alerts = check_alerts(sensor)
    
    # broadcast
    try:
        import asyncio as _asyncio
        _asyncio.create_task(manager.broadcast({"type": "sensor_update", "sensor": sensor.dict()}))
        for a in alerts:
            _asyncio.create_task(manager.broadcast({"type": "alert", "alert": a}))
    except Exception:
        pass
    return {"status": "ok", "alerts_generated": alerts}

# Add a simple endpoint for ESP32 to use /data (for backward compatibility)
@app.post("/data")
def add_esp32_data(sensor: SensorReading):
    """Backward compatibility endpoint for ESP32"""
    return add_sensor_data_public(sensor)

@app.get("/sensors")
def get_sensors(user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    user_village = user.get("village")
    if user["role"] == "admin" or user_village in (None, "", "null"):
        rows = conn.execute("SELECT * FROM sensor_data").fetchall()
    else:
        rows = conn.execute("SELECT * FROM sensor_data WHERE village=?", (user_village,)).fetchall()
    conn.close()
    sensors = []
    for r in rows:
        sensors.append({
            "id": r[0], "village": r[1],
            "location": {"lat": r[2], "lng": r[3]},
            "status": r[8], "last_updated": r[9],
            "readings": {"temperature": r[4], "ph": r[5], "turbidity": r[6], "tds": r[7]},
            "metadata": {"name": r[10], "type": r[11], "manufacturer": r[12]}
        })
    return {"sensors": sensors}

@app.get("/sensors/{sensor_id}/history")
def get_sensor_history(sensor_id: str, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    # Check if user is allowed to see this sensor
    row = conn.execute("SELECT village FROM sensor_data WHERE id=?", (sensor_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Sensor not found")
    sensor_village = row[0]
    if user["role"] != "admin" and sensor_village != user.get("village"):
        conn.close()
        raise HTTPException(status_code=403, detail="Forbidden")
    
    rows = conn.execute("""
        SELECT temperature, ph, turbidity, tds, created_at 
        FROM sensor_history 
        WHERE sensor_id=? 
        ORDER BY created_at DESC 
        LIMIT 20
    """, (sensor_id,)).fetchall()
    conn.close()
    history = [{"temperature": r[0], "ph": r[1], "turbidity": r[2], "tds": r[3], "timestamp": r[4]} for r in rows]
    return {"sensor_id": sensor_id, "history": history}

# ---- Health Reports ----
@app.post("/health_reports")
def add_health_report(report: HealthReport, user: dict = Depends(get_current_user)):
    now = datetime.utcnow().isoformat()
    conn = get_db_connection()
    conn.execute("INSERT OR REPLACE INTO health_reports (id, village, symptoms, created_at, phone) VALUES (?, ?, ?, ?, ?)",
                (report.id, report.village, ",".join(report.symptoms), now, report.phone))
    conn.commit()
    conn.close()
    # broadcast live
    try:
        import asyncio as _asyncio
        _asyncio.create_task(manager.broadcast({"type": "health_report", "report": report.dict()}))
    except Exception:
        pass
    return {"status": "ok", "report": report}

@app.post("/public/health_report")
def add_public_health_report(report: PublicHealthReport):
    now = datetime.utcnow().isoformat()
    rid = report.id or str(uuid4())
    conn = get_db_connection()
    conn.execute(
        "INSERT OR REPLACE INTO health_reports (id, village, symptoms, created_at, phone) VALUES (?, ?, ?, ?, ?)",
        (rid, report.village, ",".join(report.symptoms), now, report.phone),
    )
    conn.commit()
    conn.close()
    # broadcast live (best-effort)
    try:
        import asyncio as _asyncio
        _asyncio.create_task(
            manager.broadcast({"type": "health_report", "report": {"id": rid, "village": report.village, "symptoms": report.symptoms, "created_at": now, "phone": report.phone}})
        )
    except Exception:
        pass
    return {"status": "ok", "report": {"id": rid, "village": report.village, "symptoms": report.symptoms, "created_at": now}}

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            # keep alive / optional messages from client
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)

@app.get("/health_reports")
def get_health_reports(start: Optional[str] = None, end: Optional[str] = None, user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    conditions = []
    params = []
    if user["role"] != "admin" and user.get("village"):
        conditions.append("village=?")
        params.append(user.get("village"))
    if start:
        try:
            if len(start) == 10:
                from_dt = datetime.fromisoformat(start + "T00:00:00")
            else:
                from_dt = datetime.fromisoformat(start)
            conditions.append("created_at >= ?")
            params.append(from_dt.isoformat())
        except Exception:
            pass
    if end:
        try:
            if len(end) == 10:
                to_dt = datetime.fromisoformat(end + "T23:59:59.999999")
            else:
                to_dt = datetime.fromisoformat(end)
            conditions.append("created_at <= ?")
            params.append(to_dt.isoformat())
        except Exception:
            pass
    where_clause = (" WHERE " + " AND ".join(conditions)) if conditions else ""
    query = f"SELECT id, village, symptoms, created_at, phone FROM health_reports{where_clause} ORDER BY created_at DESC"
    rows = conn.execute(query, tuple(params)).fetchall()
    conn.close()
    reports = [{"id": r[0], "village": r[1], "symptoms": r[2].split(","), "created_at": r[3], "phone": r[4]} for r in rows]
    return {"health_reports": reports}

# ---- Alerts ----
@app.get("/alerts")
def get_alerts(user: dict = Depends(require_admin)):  # only admins
    conn = get_db_connection()
    rows = conn.execute("SELECT id, sensor_id, message, level, timestamp, acknowledged FROM alerts ORDER BY timestamp DESC").fetchall()
    conn.close()
    alerts = [{"id": r[0], "sensorId": r[1], "message": r[2], "level": r[3], "timestamp": r[4], "acknowledged": bool(r[5])} for r in rows]
    return {"alerts": alerts}

# ---- Admin Dashboard ----
@app.get("/admin/dashboard")
def admin_dashboard(user: dict = Depends(require_admin)):
    conn = get_db_connection()
    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    total_sensors = conn.execute("SELECT COUNT(*) FROM sensor_data").fetchone()[0]
    total_alerts = conn.execute("SELECT COUNT(*) FROM alerts").fetchone()[0]
    total_health_reports = conn.execute("SELECT COUNT(*) FROM health_reports").fetchone()[0]
    villages = [r[0] for r in conn.execute("SELECT DISTINCT village FROM users WHERE village IS NOT NULL").fetchall() if r[0] is not None]
    conn.close()
    return {
        "stats": {
            "users": total_users,
            "sensors": total_sensors,
            "alerts": total_alerts,
            "health_reports": total_health_reports
        },
        "villages": villages
    }

# ---- Prediction ----
@app.post("/predict")
def predict(data: PredictRequest, user: dict = Depends(get_current_user)):
    if ML_MODELS_AVAILABLE:
        # Use advanced ML models
        safety_result = predict_water_safety(data.temperature, data.ph, data.turbidity, data.tds)
        disease_result = predict_disease(data.temperature, data.ph, data.turbidity, data.tds)
        
        return {
            "sensor_id": data.sensor_id,
            "village": data.village,
            "water_safety": {
                "is_safe": safety_result["is_safe"],
                "confidence": safety_result["confidence"],
                "risk_level": safety_result["risk_level"]
            },
            "disease_prediction": {
                "predicted_disease": disease_result["predicted_disease"],
                "confidence": disease_result["confidence"],
                "top_predictions": disease_result["top_predictions"]
            }
        }
    else:
        # Fallback to simple rule-based prediction
        unsafe = data.ph < 6.5 or data.ph > 8.5 or data.turbidity > 10 or data.tds > 500
        result = "Unsafe" if unsafe else "Safe"
        confidence = round(random.uniform(0.7, 0.95), 2)
        return {"sensor_id": data.sensor_id, "village": data.village, "result": result, "confidence": confidence}

@app.post("/predict/disease")
def predict_disease_endpoint(data: PredictRequest, user: dict = Depends(get_current_user)):
    """Predict potential diseases from water quality data"""
    if ML_MODELS_AVAILABLE:
        disease_result = predict_disease(data.temperature, data.ph, data.turbidity, data.tds)
        return {
            "sensor_id": data.sensor_id,
            "village": data.village,
            "disease_prediction": disease_result
        }
    else:
        # Fallback prediction
        if data.turbidity > 8 and data.ph < 6.5:
            disease = "Gastroenteritis"
        elif data.turbidity > 15 and data.temperature > 30:
            disease = "Cholera"
        elif data.tds > 800 and data.temperature > 28:
            disease = "Typhoid"
        elif data.ph < 6.0 and data.temperature > 32:
            disease = "Hepatitis A"
        elif data.turbidity > 10 and data.tds > 600:
            disease = "Dysentery"
        elif data.ph < 5.5 or data.ph > 9.0:
            disease = "Skin Infection"
        else:
            disease = "No Disease"
            
        return {
            "sensor_id": data.sensor_id,
            "village": data.village,
            "disease_prediction": {
                "predicted_disease": disease,
                "confidence": 0.75
            }
        }

@app.post("/public/predict")
def public_predict(data: PredictRequest):
    """Public prediction endpoint for testing without authentication"""
    if ML_MODELS_AVAILABLE:
        # Use advanced ML models
        safety_result = predict_water_safety(data.temperature, data.ph, data.turbidity, data.tds)
        disease_result = predict_disease(data.temperature, data.ph, data.turbidity, data.tds)
        
        return {
            "sensor_id": data.sensor_id,
            "village": data.village,
            "water_safety": {
                "is_safe": safety_result["is_safe"],
                "confidence": safety_result["confidence"],
                "risk_level": safety_result["risk_level"]
            },
            "disease_prediction": {
                "predicted_disease": disease_result["predicted_disease"],
                "confidence": disease_result["confidence"],
                "top_predictions": disease_result["top_predictions"]
            }
        }
    else:
        # Fallback to simple rule-based prediction
        unsafe = data.ph < 6.5 or data.ph > 8.5 or data.turbidity > 10 or data.tds > 500
        result = "Unsafe" if unsafe else "Safe"
        confidence = round(random.uniform(0.7, 0.95), 2)
        return {"sensor_id": data.sensor_id, "village": data.village, "result": result, "confidence": confidence}
