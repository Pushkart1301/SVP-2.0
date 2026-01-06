from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core import database
from app.routers.auth import get_current_user
from app.models.user import UserResponse
from app.services.ocr import extract_text_from_file
from app.services.ai_engine import ai_engine
from app.models.attendance import SubjectResponse, ScheduleResponse

from app.services.vacation_service import generate_vacation_plan

router = APIRouter(tags=["Planner"])

@router.post("/recommend")
async def recommend_vacation(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # 1. Fetch Subjects
    subjects_docs = await db["subjects"].find({"user_id": current_user.id}).to_list(100)
    subject_map = {str(s["_id"]): s["name"] for s in subjects_docs} # id -> name
    
    # 2. Fetch Attendance Stats
    stats = {} # subject_id -> {attended: int, total: int}
    for sid in subject_map.keys():
        stats[sid] = {"attended": 0, "total": 0}
        
    cursor = db["attendance_records"].find({"user_id": current_user.id})
    async for record in cursor:
        for entry in record.get("entries", []):
            sid = entry["subject_id"]
            if sid in stats and entry["status"] in ["P", "A"]:
                stats[sid]["total"] += 1
                if entry["status"] == "P":
                    stats[sid]["attended"] += 1

    subjects_data = []
    for sid, data in stats.items():
        subjects_data.append({
            "id": sid,
            "name": subject_map[sid],
            "attended": data["attended"],
            "total": data["total"]
        })

    # 3. Fetch Schedule
    schedule_docs = await db["schedules"].find({"user_id": current_user.id}).to_list(7)
    weekly_schedule = {}
    weekday_map = {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday"}
    
    for doc in schedule_docs:
        day_int = doc["weekday"]
        day_name = weekday_map.get(day_int)
        
        subjects = []
        if "slots" in doc:
            for slot in doc["slots"]:
                if "subject_id" in slot:
                    subjects.append(slot["subject_id"])
        
        if day_name:
            weekly_schedule[day_name] = subjects

    # 4. Fetch Calendar
    calendar_doc = await db["academic_calendars"].find_one({"user_id": current_user.id}, sort=[("_id", -1)])
    academic_calendar = {}
    from app.core.vacation_engine import DayType
    
    if calendar_doc and "parsed_events" in calendar_doc:
        holidays = calendar_doc["parsed_events"].get("holidays", [])
        for h in holidays:
            if isinstance(h, str):
                academic_calendar[h] = DayType.HOLIDAY
            elif isinstance(h, dict) and "date" in h:
                academic_calendar[h["date"]] = DayType.HOLIDAY

    # 5. Call Service
    result = generate_vacation_plan(
        subjects_data=subjects_data,
        weekly_schedule=weekly_schedule,
        academic_calendar=academic_calendar,
        min_attendance=75
    )

    # 6. Transform for Frontend
    windows = []
    if result["success"]:
        for opt in result["vacation_options"]:
            windows.append({
                "start_date": opt["start_date"],
                "end_date": opt["end_date"],
                "reason": f"Safe! Leaves: {opt['leave_days']}, Score: {opt['score']}"
            })

    return {
        "windows": windows,
        "ai_advice": result["ai_advice"],
        "debug_info": {"subjects_count": len(subjects_data)}
    }


@router.post("/academic-calendar/upload")
async def upload_academic_calendar(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # 1. OCR
    text = await extract_text_from_file(file)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from file")
    
    # 2. AI Extraction
    result = ai_engine.extract_calendar_events(text)
    if not result:
        raise HTTPException(status_code=500, detail="AI extraction failed")
        
    # 3. Save to DB
    doc = {
        "user_id": current_user.id,
        "raw_text": text[:500] + "...",
        "parsed_events": result,
        "uploaded_at": str(file.filename)
    }
    await db["academic_calendars"].insert_one(doc)
    
    return {"message": "Calendar processed", "data": result}

@router.post("/vacation/generate")
async def generate_vacation(
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # Gather Context
    subjects = await db["subjects"].find({"user_id": current_user.id}).to_list(100)
    schedule = await db["schedules"].find({"user_id": current_user.id}).to_list(7)
    
    # Get attendance stats (simplified inline logic from attendance router)
    stats = {} # In real app, call the service or common logic
    
    holidays_doc = await db["academic_calendars"].find_one({"user_id": current_user.id}, sort=[("_id", -1)])
    holidays = holidays_doc.get("parsed_events", {}).get("holidays", []) if holidays_doc else []
    
    request_data = await request.json()
    query = request_data.get("query")
    
    plan = ai_engine.generate_vacation_plan(
        attendance_summary=stats, # Mocked for now, needs real stats
        schedule=[s for s in schedule if "weekday" in s],
        holidays=holidays,
        query=query
    )
    
    return plan

@router.post("/study-plan/generate")
async def generate_study_plan(
    preferences: dict,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    subjects = await db["subjects"].find({"user_id": current_user.id}).to_list(100)
    subject_names = [s["name"] for s in subjects]
    
    plan = ai_engine.generate_study_plan(
        subjects=subject_names,
        preferences=preferences
    )
    
    # Save plan
    if plan:
        await db["study_plans"].insert_one({
            "user_id": current_user.id,
            "plan": plan,
            "created_at": "now"
        })
        
    return plan
