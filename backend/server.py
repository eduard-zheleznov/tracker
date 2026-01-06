from fastapi import FastAPI, APIRouter, HTTPException, Header, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7

# Create the main app
app = FastAPI()

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

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
    is_admin: bool = False
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

class DecisionUpdate(BaseModel):
    completed: bool

class HappinessScoreResponse(BaseModel):
    score: Optional[float]
    total_harmonious: int
    total_disharmonious: int
    period_start: str
    period_end: str
    has_data: bool

class HappinessScoreRequest(BaseModel):
    period_type: str = "quarter"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: str = ""
    age: int = 0
    field_of_activity: str = ""
    about_me: str = ""
    income_level: str = ""
    hobbies: str = ""
    country: str = ""
    phone: str = ""
    email: str = ""
    telegram: str = ""
    social_vk: str = ""
    social_instagram: str = ""

class ReminderSettings(BaseModel):
    assessment_enabled: bool = False
    assessment_time: str = "22:00"
    analysis_enabled: bool = False
    analysis_time: str = "10:00"
    strategy_enabled: bool = False
    strategy_time: str = "10:00"
    education_enabled: bool = False
    education_time: str = "10:00"

class QuestionCreate(BaseModel):
    question: str
    topic: str = "Общие"

class QuestionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    question: str
    answer: str
    topic: str
    is_published: bool
    created_at: str

class FeedbackCreate(BaseModel):
    rating: int = 5
    suggestion: str = ""

# Admin models
class VideoCreate(BaseModel):
    title: str
    description: str
    category_id: str
    tags: List[str] = []
    impact_scores: Dict[str, int] = {}
    order: int = 0

class CategoryCreate(BaseModel):
    name: str
    description: str = ""
    order: int = 0
    is_blocked: bool = False

class FAQUpdate(BaseModel):
    question: str
    answer: str
    topic: str
    is_published: bool = True

class ContentTextUpdate(BaseModel):
    key: str
    title: str
    content: str

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
        if not token:
            raise HTTPException(status_code=401, detail="Требуется авторизация")
        if token.startswith("Bearer "):
            token = token[7:]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Неверный токен")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Пользователь не найден")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Токен истёк")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Неверный токен")

async def get_admin_user(token: str) -> dict:
    user = await get_current_user(token)
    if not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    return user

# ==================== Auth Endpoints ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserCreate):
    existing = await db.users.find_one({"login": data.login})
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь с таким логином уже существует")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "login": data.login,
        "password_hash": hash_password(data.password),
        "password_hint": data.password_hint,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            login=data.login,
            is_admin=False,
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
            is_admin=user.get("is_admin", False),
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
        is_admin=user.get("is_admin", False),
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
        "decision_completed": False,
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

@api_router.patch("/assessments/{assessment_id}/decision")
async def update_decision_status(assessment_id: str, data: DecisionUpdate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    result = await db.assessments.update_one(
        {"id": assessment_id, "user_id": user["id"]},
        {"$set": {"decision_completed": data.completed}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    
    return {"message": "Статус обновлён"}

# ==================== Happiness Score Endpoints ====================

def get_period_dates(period_type: str, start_date: str = None, end_date: str = None):
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
    
    assessments = await db.assessments.find({
        "user_id": user["id"],
        "created_at": {
            "$gte": start_date.isoformat(),
            "$lte": end_date.isoformat()
        }
    }, {"_id": 0}).to_list(10000)
    
    total_harmonious = sum(len(a.get("harmonious_states", [])) for a in assessments)
    total_disharmonious = sum(len(a.get("disharmonious_states", [])) for a in assessments)
    
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

# ==================== Analysis Endpoints ====================

@api_router.post("/analysis/state-repetition")
async def get_state_repetition(data: HappinessScoreRequest, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    start_date, end_date = get_period_dates(data.period_type, data.start_date, data.end_date)
    
    assessments = await db.assessments.find({
        "user_id": user["id"],
        "created_at": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()}
    }, {"_id": 0}).to_list(10000)
    
    harmonious_counts = {}
    disharmonious_counts = {}
    
    for a in assessments:
        for state in a.get("harmonious_states", []):
            harmonious_counts[state] = harmonious_counts.get(state, 0) + 1
        for state in a.get("disharmonious_states", []):
            disharmonious_counts[state] = disharmonious_counts.get(state, 0) + 1
    
    # Sort: disharmonious descending, harmonious ascending
    harmonious_sorted = sorted(harmonious_counts.items(), key=lambda x: x[1])
    disharmonious_sorted = sorted(disharmonious_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "harmonious": [{"state": k, "count": v} for k, v in harmonious_sorted],
        "disharmonious": [{"state": k, "count": v} for k, v in disharmonious_sorted],
        "period_start": start_date.isoformat(),
        "period_end": end_date.isoformat()
    }

@api_router.post("/analysis/habit-trend")
async def get_habit_trend(data: HappinessScoreRequest, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    # Get all assessments for user
    all_assessments = await db.assessments.find(
        {"user_id": user["id"]},
        {"_id": 0, "created_at": 1}
    ).sort("created_at", 1).to_list(10000)
    
    if not all_assessments:
        return {
            "current_combo": 0,
            "best_combo": 0,
            "total_assessments": 0,
            "avg_per_week": 0,
            "avg_per_month": 0,
            "daily_data": []
        }
    
    # Calculate combos
    dates = set()
    for a in all_assessments:
        date_str = a["created_at"][:10]
        dates.add(date_str)
    
    sorted_dates = sorted(dates)
    
    # Current combo (consecutive days ending today or yesterday)
    today = datetime.now(timezone.utc).date()
    current_combo = 0
    check_date = today
    
    for i in range(len(sorted_dates)):
        check_str = check_date.isoformat()
        if check_str in dates:
            current_combo += 1
            check_date -= timedelta(days=1)
        elif i == 0 and (today - timedelta(days=1)).isoformat() in dates:
            check_date = today - timedelta(days=1)
            continue
        else:
            break
    
    # Best combo
    best_combo = 0
    current_streak = 0
    prev_date = None
    
    for date_str in sorted_dates:
        current_date = datetime.fromisoformat(date_str).date()
        if prev_date is None or (current_date - prev_date).days == 1:
            current_streak += 1
        else:
            current_streak = 1
        best_combo = max(best_combo, current_streak)
        prev_date = current_date
    
    # Stats
    total = len(all_assessments)
    first_date = datetime.fromisoformat(all_assessments[0]["created_at"])
    days_since_start = max(1, (datetime.now(timezone.utc) - first_date).days)
    weeks = max(1, days_since_start / 7)
    months = max(1, days_since_start / 30)
    
    # Daily data for chart (last 30 days)
    daily_data = []
    for i in range(30):
        date = (today - timedelta(days=29-i)).isoformat()
        count = sum(1 for a in all_assessments if a["created_at"][:10] == date)
        daily_data.append({"date": date, "count": count})
    
    return {
        "current_combo": current_combo,
        "best_combo": best_combo,
        "total_assessments": total,
        "avg_per_week": round(total / weeks, 1),
        "avg_per_month": round(total / months, 1),
        "daily_data": daily_data
    }

@api_router.post("/analysis/happiness-trend")
async def get_happiness_trend(data: HappinessScoreRequest, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    start_date, end_date = get_period_dates(data.period_type, data.start_date, data.end_date)
    
    assessments = await db.assessments.find({
        "user_id": user["id"],
        "created_at": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()}
    }, {"_id": 0}).sort("created_at", 1).to_list(10000)
    
    total_harmonious = sum(len(a.get("harmonious_states", [])) for a in assessments)
    total_disharmonious = sum(len(a.get("disharmonious_states", [])) for a in assessments)
    
    # Weekly scores
    weekly_scores = {}
    for a in assessments:
        date = datetime.fromisoformat(a["created_at"])
        week_start = (date - timedelta(days=date.weekday())).strftime("%Y-%m-%d")
        
        if week_start not in weekly_scores:
            weekly_scores[week_start] = {"harmonious": 0, "disharmonious": 0}
        
        weekly_scores[week_start]["harmonious"] += len(a.get("harmonious_states", []))
        weekly_scores[week_start]["disharmonious"] += len(a.get("disharmonious_states", []))
    
    # Calculate scores
    weekly_data = []
    best_week_score = 0
    best_month_score = 0
    
    for week, counts in sorted(weekly_scores.items()):
        total = counts["harmonious"] + counts["disharmonious"]
        if total > 0:
            score = round(10 * counts["harmonious"] / total, 1)
            weekly_data.append({"week": week, "score": score})
            best_week_score = max(best_week_score, score)
    
    # Best month score (approximate)
    if weekly_data:
        month_scores = {}
        for w in weekly_data:
            month = w["week"][:7]
            if month not in month_scores:
                month_scores[month] = []
            month_scores[month].append(w["score"])
        
        for scores in month_scores.values():
            avg = sum(scores) / len(scores)
            best_month_score = max(best_month_score, round(avg, 1))
    
    return {
        "total_harmonious": total_harmonious,
        "total_disharmonious": total_disharmonious,
        "best_week_score": best_week_score,
        "best_month_score": best_month_score,
        "weekly_data": weekly_data,
        "period_start": start_date.isoformat(),
        "period_end": end_date.isoformat()
    }

# ==================== Strategy Endpoints ====================

@api_router.post("/strategy/decisions")
async def get_decisions(data: HappinessScoreRequest, filter_type: str = None, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    start_date, end_date = get_period_dates(data.period_type, data.start_date, data.end_date)
    
    query = {
        "user_id": user["id"],
        "created_at": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()},
        "decision_text": {"$ne": ""}
    }
    
    if filter_type:
        query["decision_type"] = filter_type
    
    assessments = await db.assessments.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    decisions = []
    completed_count = 0
    
    for a in assessments:
        if a.get("decision_text"):
            is_completed = a.get("decision_completed", False)
            if is_completed:
                completed_count += 1
            decisions.append({
                "id": a["id"],
                "type": a.get("decision_type", ""),
                "text": a["decision_text"],
                "completed": is_completed,
                "created_at": a["created_at"]
            })
    
    completion_rate = round(completed_count / len(decisions) * 100) if decisions else 0
    
    return {
        "decisions": decisions,
        "completion_rate": completion_rate,
        "total": len(decisions),
        "completed": completed_count
    }

@api_router.post("/strategy/reflections")
async def get_reflections(data: HappinessScoreRequest, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    start_date, end_date = get_period_dates(data.period_type, data.start_date, data.end_date)
    
    assessments = await db.assessments.find({
        "user_id": user["id"],
        "created_at": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()},
        "reflection": {"$ne": ""}
    }, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    reflections = [
        {"id": a["id"], "text": a["reflection"], "created_at": a["created_at"]}
        for a in assessments if a.get("reflection")
    ]
    
    return {"reflections": reflections}

# ==================== Profile Endpoints ====================

@api_router.get("/profile")
async def get_profile(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    profile = await db.profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    
    if not profile:
        profile = {
            "user_id": user["id"],
            "name": "",
            "age": 0,
            "field_of_activity": "",
            "about_me": "",
            "income_level": "",
            "hobbies": "",
            "country": "",
            "phone": "",
            "email": "",
            "telegram": "",
            "social_vk": "",
            "social_instagram": ""
        }
    
    return profile

@api_router.put("/profile")
async def update_profile(data: UserProfileUpdate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    profile_data = data.model_dump()
    profile_data["user_id"] = user["id"]
    
    await db.profiles.update_one(
        {"user_id": user["id"]},
        {"$set": profile_data},
        upsert=True
    )
    
    return {"message": "Профиль обновлён"}

# ==================== Reminders Endpoints ====================

@api_router.get("/reminders")
async def get_reminders(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    reminders = await db.reminders.find_one({"user_id": user["id"]}, {"_id": 0})
    
    if not reminders:
        reminders = {
            "user_id": user["id"],
            "assessment_enabled": False,
            "assessment_time": "22:00",
            "analysis_enabled": False,
            "analysis_time": "10:00",
            "strategy_enabled": False,
            "strategy_time": "10:00",
            "education_enabled": False,
            "education_time": "10:00"
        }
    
    return reminders

@api_router.put("/reminders")
async def update_reminders(data: ReminderSettings, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    reminder_data = data.model_dump()
    reminder_data["user_id"] = user["id"]
    
    await db.reminders.update_one(
        {"user_id": user["id"]},
        {"$set": reminder_data},
        upsert=True
    )
    
    return {"message": "Напоминания обновлены"}

# ==================== FAQ & Questions Endpoints ====================

@api_router.get("/faq")
async def get_faq():
    questions = await db.faq.find({"is_published": True}, {"_id": 0}).to_list(100)
    return {"questions": questions}

@api_router.post("/questions")
async def submit_question(data: QuestionCreate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    question_id = str(uuid.uuid4())
    question_doc = {
        "id": question_id,
        "user_id": user["id"],
        "question": data.question,
        "answer": "",
        "topic": data.topic,
        "is_published": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.faq.insert_one(question_doc)
    
    return {"message": "Вопрос отправлен", "id": question_id}

# ==================== Feedback Endpoint ====================

@api_router.post("/feedback")
async def submit_feedback(data: FeedbackCreate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    feedback_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "rating": data.rating,
        "suggestion": data.suggestion,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.feedback.insert_one(feedback_doc)
    
    return {"message": "Спасибо за обратную связь!"}

# ==================== Education Endpoints ====================

@api_router.get("/education/categories")
async def get_education_categories(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    categories = await db.education_categories.find(
        {"is_blocked": False},
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    
    # Get user progress
    progress = await db.education_progress.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).to_list(1000)
    
    watched_videos = {p["video_id"] for p in progress if p.get("completed")}
    
    # Add progress to categories
    for cat in categories:
        videos = await db.education_videos.find(
            {"category_id": cat["id"], "is_blocked": False},
            {"_id": 0}
        ).to_list(100)
        
        total = len(videos)
        watched = sum(1 for v in videos if v["id"] in watched_videos)
        cat["total_videos"] = total
        cat["watched_videos"] = watched
    
    return {"categories": categories}

@api_router.get("/education/categories/{category_id}/videos")
async def get_category_videos(category_id: str, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    videos = await db.education_videos.find(
        {"category_id": category_id, "is_blocked": False},
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    
    # Get user progress
    progress = await db.education_progress.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).to_list(1000)
    
    watched_videos = {p["video_id"]: p.get("completed", False) for p in progress}
    
    for v in videos:
        v["completed"] = watched_videos.get(v["id"], False)
    
    return {"videos": videos}

@api_router.post("/education/videos/{video_id}/complete")
async def mark_video_completed(video_id: str, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    
    await db.education_progress.update_one(
        {"user_id": user["id"], "video_id": video_id},
        {"$set": {"completed": True, "completed_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    return {"message": "Отмечено как изученное"}

# ==================== Content Texts Endpoints ====================

@api_router.get("/content/{key}")
async def get_content_text(key: str):
    content = await db.content_texts.find_one({"key": key}, {"_id": 0})
    
    if not content:
        # Default content
        defaults = {
            "psychologist": {
                "key": "psychologist",
                "title": "Ваш психолог",
                "content": """## Персональные консультации с психологом

Иногда для серьёзных изменений в жизни нужна профессиональная поддержка. Наши верифицированные специалисты используют **когнитивно-поведенческую терапию (КПТ)** — один из самых эффективных научно доказанных методов.

### Что даёт КПТ:
- Понимание связи мыслей, эмоций и поведения
- Практические инструменты для управления состояниями
- Работа с конкретными проблемами и целями
- Измеримые результаты за 8-12 сессий

### Как это работает:
1. Вы оставляете заявку
2. Мы подбираем специалиста под ваш запрос
3. Первая консультация — знакомство и определение целей
4. Регулярные сессии онлайн или офлайн

### Стоимость:
- Первая консультация: **бесплатно** (30 минут)
- Разовая сессия: от 3000 ₽
- Пакет 4 сессии: от 10000 ₽ (скидка 15%)
- Пакет 8 сессий: от 18000 ₽ (скидка 25%)

*Все наши психологи имеют высшее образование, сертификаты КПТ и регулярно проходят супервизию.*

📞 Для записи свяжитесь с нами через форму обратной связи или напишите в Telegram."""
            },
            "tariff": {
                "key": "tariff",
                "title": "Тарифные планы",
                "content": """## Выберите подходящий тариф

### 🌱 Базовый — Бесплатно
- Отслеживание состояний
- Базовая аналитика
- Доступ к словарю состояний
- 3 обучающих видео

### ⭐ Продвинутый — 299 ₽/мес
- Всё из Базового
- Полная аналитика трендов
- Неограниченный доступ к обучению
- Экспорт данных
- Напоминания

### 💎 Премиум — 599 ₽/мес
- Всё из Продвинутого
- Персональные рекомендации
- Приоритетная поддержка
- Скидка 20% на консультации психолога
- Ранний доступ к новым функциям

---

💡 **Специальное предложение:** При оплате за год — 2 месяца бесплатно!

*Оплата происходит через безопасные платёжные системы. Отменить подписку можно в любой момент.*"""
            },
            "author": {
                "key": "author",
                "title": "Слово от автора",
                "content": """## Привет! 👋

Меня зовут [Имя], и я создал это приложение с одной простой целью — **помочь вам стать счастливее**.

Несколько лет назад я сам искал способы понять свои эмоции и научиться управлять своим состоянием. Перепробовал десятки методик, читал книги по психологии, работал с терапевтами.

И понял одну важную вещь: **осознанность — это навык**. Как любой навык, его можно развить через регулярную практику.

### Почему это работает

Когда мы начинаем замечать свои состояния, происходит магия:
- Мы перестаём быть заложниками эмоций
- Видим паттерны и можем их менять
- Делаем осознанный выбор в пользу гармонии

### Моё обещание

Я обещаю постоянно улучшать приложение, добавлять полезные функции и делать всё, чтобы ваш путь к счастью был понятным и приятным.

Если у вас есть идеи или предложения — пишите! Каждое сообщение читаю лично.

С верой в ваше счастье,
**[Имя]**

*P.S. Помните: маленькие шаги каждый день приводят к большим переменам. Вы уже на правильном пути!*"""
            }
        }
        
        if key in defaults:
            return defaults[key]
        raise HTTPException(status_code=404, detail="Контент не найден")
    
    return content

# ==================== Dictionary Endpoint ====================

@api_router.get("/dictionary")
async def get_dictionary():
    # Return states with descriptions
    dictionary = await db.dictionary.find({}, {"_id": 0}).to_list(1000)
    
    if not dictionary:
        # Return default from statesData
        return {"states": []}
    
    return {"states": dictionary}

# ==================== Admin Endpoints ====================

@api_router.get("/admin/stats")
async def get_admin_stats(authorization: str = Header(None)):
    await get_admin_user(authorization)
    
    users_count = await db.users.count_documents({})
    assessments_count = await db.assessments.count_documents({})
    questions_count = await db.faq.count_documents({"is_published": False})
    feedback_count = await db.feedback.count_documents({})
    
    return {
        "users": users_count,
        "assessments": assessments_count,
        "pending_questions": questions_count,
        "feedback": feedback_count
    }

# Admin - FAQ Management
@api_router.get("/admin/faq")
async def admin_get_faq(authorization: str = Header(None)):
    await get_admin_user(authorization)
    questions = await db.faq.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"questions": questions}

@api_router.post("/admin/faq")
async def admin_create_faq(data: FAQUpdate, authorization: str = Header(None)):
    await get_admin_user(authorization)
    
    faq_id = str(uuid.uuid4())
    faq_doc = {
        "id": faq_id,
        "question": data.question,
        "answer": data.answer,
        "topic": data.topic,
        "is_published": data.is_published,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.faq.insert_one(faq_doc)
    return {"message": "FAQ создан", "id": faq_id}

@api_router.put("/admin/faq/{faq_id}")
async def admin_update_faq(faq_id: str, data: FAQUpdate, authorization: str = Header(None)):
    await get_admin_user(authorization)
    
    await db.faq.update_one(
        {"id": faq_id},
        {"$set": {
            "question": data.question,
            "answer": data.answer,
            "topic": data.topic,
            "is_published": data.is_published
        }}
    )
    return {"message": "FAQ обновлён"}

@api_router.delete("/admin/faq/{faq_id}")
async def admin_delete_faq(faq_id: str, authorization: str = Header(None)):
    await get_admin_user(authorization)
    await db.faq.delete_one({"id": faq_id})
    return {"message": "FAQ удалён"}

# Admin - Content Texts
@api_router.get("/admin/content")
async def admin_get_all_content(authorization: str = Header(None)):
    await get_admin_user(authorization)
    content = await db.content_texts.find({}, {"_id": 0}).to_list(100)
    return {"content": content}

@api_router.put("/admin/content/{key}")
async def admin_update_content(key: str, data: ContentTextUpdate, authorization: str = Header(None)):
    await get_admin_user(authorization)
    
    await db.content_texts.update_one(
        {"key": key},
        {"$set": {
            "key": key,
            "title": data.title,
            "content": data.content
        }},
        upsert=True
    )
    return {"message": "Контент обновлён"}

# Admin - Education Categories
@api_router.get("/admin/education/categories")
async def admin_get_categories(authorization: str = Header(None)):
    await get_admin_user(authorization)
    categories = await db.education_categories.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return {"categories": categories}

@api_router.post("/admin/education/categories")
async def admin_create_category(data: CategoryCreate, authorization: str = Header(None)):
    await get_admin_user(authorization)
    
    cat_id = str(uuid.uuid4())
    cat_doc = {
        "id": cat_id,
        "name": data.name,
        "description": data.description,
        "order": data.order,
        "is_blocked": data.is_blocked,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.education_categories.insert_one(cat_doc)
    return {"message": "Категория создана", "id": cat_id}

@api_router.put("/admin/education/categories/{cat_id}")
async def admin_update_category(cat_id: str, data: CategoryCreate, authorization: str = Header(None)):
    await get_admin_user(authorization)
    
    await db.education_categories.update_one(
        {"id": cat_id},
        {"$set": {
            "name": data.name,
            "description": data.description,
            "order": data.order,
            "is_blocked": data.is_blocked
        }}
    )
    return {"message": "Категория обновлена"}

@api_router.delete("/admin/education/categories/{cat_id}")
async def admin_delete_category(cat_id: str, authorization: str = Header(None)):
    await get_admin_user(authorization)
    await db.education_categories.delete_one({"id": cat_id})
    await db.education_videos.delete_many({"category_id": cat_id})
    return {"message": "Категория и видео удалены"}

# Admin - Education Videos
@api_router.get("/admin/education/videos")
async def admin_get_videos(authorization: str = Header(None)):
    await get_admin_user(authorization)
    videos = await db.education_videos.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return {"videos": videos}

@api_router.post("/admin/education/videos")
async def admin_upload_video(
    title: str = Form(...),
    description: str = Form(""),
    category_id: str = Form(...),
    tags: str = Form(""),
    impact_scores: str = Form("{}"),
    order: int = Form(0),
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    await get_admin_user(authorization)
    
    video_id = str(uuid.uuid4())
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "mp4"
    file_name = f"{video_id}.{file_ext}"
    file_path = UPLOADS_DIR / file_name
    
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    import json
    tags_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    impact_dict = json.loads(impact_scores) if impact_scores else {}
    
    video_doc = {
        "id": video_id,
        "title": title,
        "description": description,
        "category_id": category_id,
        "file_url": f"/uploads/{file_name}",
        "tags": tags_list,
        "impact_scores": impact_dict,
        "order": order,
        "is_blocked": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.education_videos.insert_one(video_doc)
    
    return {"message": "Видео загружено", "id": video_id}

@api_router.put("/admin/education/videos/{video_id}")
async def admin_update_video(video_id: str, data: VideoCreate, authorization: str = Header(None)):
    await get_admin_user(authorization)
    
    await db.education_videos.update_one(
        {"id": video_id},
        {"$set": {
            "title": data.title,
            "description": data.description,
            "category_id": data.category_id,
            "tags": data.tags,
            "impact_scores": data.impact_scores,
            "order": data.order
        }}
    )
    return {"message": "Видео обновлено"}

@api_router.patch("/admin/education/videos/{video_id}/block")
async def admin_toggle_video_block(video_id: str, blocked: bool, authorization: str = Header(None)):
    await get_admin_user(authorization)
    
    await db.education_videos.update_one(
        {"id": video_id},
        {"$set": {"is_blocked": blocked}}
    )
    return {"message": "Статус обновлён"}

@api_router.delete("/admin/education/videos/{video_id}")
async def admin_delete_video(video_id: str, authorization: str = Header(None)):
    await get_admin_user(authorization)
    
    video = await db.education_videos.find_one({"id": video_id})
    if video and video.get("file_url"):
        file_path = ROOT_DIR / video["file_url"].lstrip("/")
        if file_path.exists():
            file_path.unlink()
    
    await db.education_videos.delete_one({"id": video_id})
    return {"message": "Видео удалено"}

# Admin - Feedback
@api_router.get("/admin/feedback")
async def admin_get_feedback(authorization: str = Header(None)):
    await get_admin_user(authorization)
    feedback = await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"feedback": feedback}

# Create admin user endpoint (one-time setup)
@api_router.post("/admin/setup")
async def setup_admin():
    existing = await db.users.find_one({"login": "admin"})
    if existing:
        raise HTTPException(status_code=400, detail="Админ уже создан")
    
    admin_id = str(uuid.uuid4())
    admin_doc = {
        "id": admin_id,
        "login": "admin",
        "password_hash": hash_password("admin123"),
        "password_hint": "стандартный",
        "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_doc)
    
    return {"message": "Админ создан", "login": "admin", "password": "admin123"}

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
