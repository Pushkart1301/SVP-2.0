from datetime import date, datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core import database
from app.routers.auth import get_current_user
from app.models.user import UserResponse
from app.models.attendance import (
    SubjectCreate, SubjectResponse, 
    WeekdaySchedule, ScheduleResponse, 
    DailyAttendance, DailyAttendanceResponse, AttendanceStats,
    OverallAttendanceStats
)

router = APIRouter()

# --- Helpers ---
def fix_id(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# --- Subjects ---
@router.post("/subjects", response_model=SubjectResponse)
async def create_subject(
    subject: SubjectCreate, 
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    new_subject = subject.model_dump()
    new_subject["user_id"] = current_user.id
    
    result = await db["subjects"].insert_one(new_subject)
    created_subject = await db["subjects"].find_one({"_id": result.inserted_id})
    return fix_id(created_subject)

@router.get("/subjects", response_model=List[SubjectResponse])
async def list_subjects(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    subjects = await db["subjects"].find({"user_id": current_user.id}).to_list(100)
    return [fix_id(s) for s in subjects]

@router.delete("/subjects/{subject_id}")
async def delete_subject(
    subject_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    result = await db["subjects"].delete_one({"_id": ObjectId(subject_id), "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"message": "Subject deleted"}

# --- Schedule ---
@router.post("/schedule", response_model=ScheduleResponse)
async def update_schedule(
    schedule: WeekdaySchedule,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # Upsert schedule for that weekday
    schedule_data = schedule.model_dump()
    schedule_data["user_id"] = current_user.id
    
    await db["schedules"].replace_one(
        {"user_id": current_user.id, "weekday": schedule.weekday},
        schedule_data,
        upsert=True
    )
    
    saved_schedule = await db["schedules"].find_one({"user_id": current_user.id, "weekday": schedule.weekday})
    return fix_id(saved_schedule)

@router.get("/schedule", response_model=List[ScheduleResponse])
async def get_schedule(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    schedules = await db["schedules"].find({"user_id": current_user.id}).to_list(7)
    return [fix_id(s) for s in schedules]

# --- Attendance ---
@router.post("/", response_model=DailyAttendanceResponse)
async def mark_attendance(
    attendance: DailyAttendance,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # ... (rest of function)
    date_str = attendance.date.isoformat()
    
    att_data = attendance.model_dump()
    att_data["date"] = date_str # Store as string for simpler querying or ISODate
    att_data["user_id"] = current_user.id
    
    await db["attendance_records"].replace_one(
        {"user_id": current_user.id, "date": date_str},
        att_data,
        upsert=True
    )
    
    saved_record = await db["attendance_records"].find_one({"user_id": current_user.id, "date": date_str})
    return fix_id(saved_record)

@router.get("/history", response_model=List[DailyAttendanceResponse])
async def get_attendance_history(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # Fetch all records for the user. In prod, you'd want pagination or date filters.
    records = await db["attendance_records"].find({"user_id": current_user.id}).to_list(1000)
    return [fix_id(r) for r in records]

@router.get("/stats", response_model=List[AttendanceStats])
async def get_attendance_stats(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # Aggregate stats using MongoDB Pipeline
    pipeline = [
        # 1. Match records for this user
        {"$match": {"user_id": current_user.id}},
        # 2. Unwind entries to process individual subject attendance
        {"$unwind": "$entries"},
        # 3. Group by subject_id -> calculate totals
        {"$group": {
            "_id": "$entries.subject_id",
            "total": {"$sum": 1},
            "attended": {
                "$sum": {
                    "$cond": [{"$eq": ["$entries.status", "P"]}, 1, 0]
                }
            }
        }}
    ]

    agg_results = await db["attendance_records"].aggregate(pipeline).to_list(None)
    agg_map = {doc["_id"]: doc for doc in agg_results}

    # Fetch subjects to ensure we show all subjects, even those with 0 attendance
    subjects = await db["subjects"].find({"user_id": current_user.id}).to_list(100)
    
    result = []
    for sub in subjects:
        sid = str(sub["_id"])
        data = agg_map.get(sid, {"total": 0, "attended": 0})
        
        total = data["total"]
        attended = data["attended"]
        pct = (attended / total * 100) if total > 0 else 0.0
        bunk_rate = (100 - pct) if total > 0 else 0.0
        
        result.append(AttendanceStats(
            subject_id=sid,
            total_classes=total,
            attended_classes=attended,
            current_percentage=round(pct, 2),
            bunk_rate=round(bunk_rate, 2)
        ))
        
    return result

@router.get("/stats/overall", response_model=OverallAttendanceStats)
async def get_overall_attendance_stats(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    attended_classes = 0
    absent_classes = 0
    
    # Count attended and absent from attendance records
    cursor = db["attendance_records"].find({"user_id": current_user.id})
    async for record in cursor:
        for entry in record.get("entries", []):
            status = entry["status"]
            if status == "P":
                attended_classes += 1
            elif status == "A":
                absent_classes += 1
    
    # Total = Attended + Absent (only tracked lectures)
    total_classes = attended_classes + absent_classes
    
    # Percentage = Attended / Total
    pct = (attended_classes / total_classes * 100) if total_classes > 0 else 0.0
    
    return OverallAttendanceStats(
        total_lectures=total_classes,
        lectures_attended=attended_classes,
        lectures_missed=absent_classes,
        overall_percentage=round(pct, 2)
    )

@router.delete("/clear")
async def clear_all_attendance(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    """Delete all attendance records for the current user"""
    result = await db["attendance_records"].delete_many({"user_id": current_user.id})
    return {"message": f"Deleted {result.deleted_count} attendance records", "deleted_count": result.deleted_count}
