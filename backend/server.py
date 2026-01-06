from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== Models ====================

class UserCreate(BaseModel):
    login: str
    password: str
    password_hint: str

class UserLogin(BaseModel):
    login: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    login: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PasswordHintRequest(BaseModel):
    login: str

class PasswordHintResponse(BaseModel):
    hint: str

class PasswordResetRequest(BaseModel):
    login: str
    new_password: str

class AssessmentCreate(BaseModel):
    harmonious_states: List[str] = []
    disharmonious_states: List[str] = []
    reflection: str = ""
    decision_type: str = ""
    decision_text: str = ""

class AssessmentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    harmonious_states: List[str]
    disharmonious_states: List[str]
    reflection: str
    decision_type: str
    decision_text: str
    created_at: str

class HappinessScoreResponse(BaseModel):
    score: Optional[float]
    total_harmonious: int
    total_disharmonious: int
    period_start: str
    period_end: str
    has_data: bool

class HappinessScoreRequest(BaseModel):
    period_type: str = "quarter"  # week, month, quarter, half_year, year, custom
    start_date: Optional[str] = None
    end_date: Optional[str] = None

# ==================== Auth Helpers ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(token: str) -> dict:
    try:
        # Remove "Bearer " prefix if present
        if token.startswith("Bearer "):
            token = token[7:]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== Auth Endpoints ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"login": data.login})
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь с таким логином уже существует")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "login": data.login,
        "password_hash": hash_password(data.password),
        "password_hint": data.password_hint,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Generate token
    token = create_token(user_id)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            login=data.login,
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"login": data.login}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    
    token = create_token(user["id"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            login=user["login"],
            created_at=user["created_at"]
        )
    )

@api_router.post("/auth/password-hint", response_model=PasswordHintResponse)
async def get_password_hint(data: PasswordHintRequest):
    user = await db.users.find_one({"login": data.login}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return PasswordHintResponse(hint=user.get("password_hint", ""))

@api_router.post("/auth/reset-password")
async def reset_password(data: PasswordResetRequest):
    user = await db.users.find_one({"login": data.login})
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    new_hash = hash_password(data.new_password)
    await db.users.update_one(
        {"login": data.login},
        {"$set": {"password_hash": new_hash}}
    )
    return {"message": "Пароль успешно изменён"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    return UserResponse(
        id=user["id"],
        login=user["login"],
        created_at=user["created_at"]
    )

# ==================== Assessment Endpoints ====================

@api_router.post("/assessments", response_model=AssessmentResponse)
async def create_assessment(data: AssessmentCreate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    assessment_id = str(uuid.uuid4())
    assessment_doc = {
        "id": assessment_id,
        "user_id": user["id"],
        "harmonious_states": data.harmonious_states,
        "disharmonious_states": data.disharmonious_states,
        "reflection": data.reflection,
        "decision_type": data.decision_type,
        "decision_text": data.decision_text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.assessments.insert_one(assessment_doc)
    
    return AssessmentResponse(**assessment_doc)

@api_router.get("/assessments", response_model=List[AssessmentResponse])
async def get_assessments(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    assessments = await db.assessments.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return assessments

# ==================== Happiness Score Endpoints ====================

def get_period_dates(period_type: str, start_date: str = None, end_date: str = None):
    """Calculate start and end dates based on period type"""
    now = datetime.now(timezone.utc)
    
    if period_type == "custom" and start_date and end_date:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        return start, end
    
    if period_type == "week":
        start = now - timedelta(days=7)
    elif period_type == "month":
        start = now - timedelta(days=30)
    elif period_type == "quarter":
        start = now - timedelta(days=90)
    elif period_type == "half_year":
        start = now - timedelta(days=182)
    elif period_type == "year":
        start = now - timedelta(days=365)
    else:
        # Default to quarter
        start = now - timedelta(days=90)
    
    return start, now

@api_router.post("/happiness-score", response_model=HappinessScoreResponse)
async def calculate_happiness_score(data: HappinessScoreRequest, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    start_date, end_date = get_period_dates(
        data.period_type,
        data.start_date,
        data.end_date
    )
    
    # Get all assessments for the user in the period
    assessments = await db.assessments.find({
        "user_id": user["id"],
        "created_at": {
            "$gte": start_date.isoformat(),
            "$lte": end_date.isoformat()
        }
    }, {"_id": 0}).to_list(10000)
    
    # Calculate totals
    total_harmonious = sum(len(a.get("harmonious_states", [])) for a in assessments)
    total_disharmonious = sum(len(a.get("disharmonious_states", [])) for a in assessments)
    
    # Calculate happiness score using the formula
    total = total_harmonious + total_disharmonious
    if total == 0:
        score = None
        has_data = False
    else:
        score = round(10 * total_harmonious / total, 1)
        has_data = True
    
    return HappinessScoreResponse(
        score=score,
        total_harmonious=total_harmonious,
        total_disharmonious=total_disharmonious,
        period_start=start_date.isoformat(),
        period_end=end_date.isoformat(),
        has_data=has_data
    )

# ==================== Health Check ====================

@api_router.get("/")
async def root():
    return {"message": "JoyTracker API is running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
