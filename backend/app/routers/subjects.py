from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.core import database
from app.models.subject import SubjectCreate, SubjectResponse, SubjectInDB
from app.models.user import UserResponse
from app.routers.auth import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[SubjectResponse])
async def get_subjects(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    subjects = await db["subjects"].find({"user_id": current_user.id}).to_list(100)
    # Convert _id to str for Pydantic
    for sub in subjects:
        sub["_id"] = str(sub["_id"])
    return subjects

@router.post("/", response_model=SubjectResponse)
async def create_subject(
    subject: SubjectCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # Check for duplicate code
    existing = await db["subjects"].find_one({"user_id": current_user.id, "code": subject.code})
    if existing:
        raise HTTPException(status_code=400, detail="Subject code already exists")

    new_subject = SubjectInDB(
        **subject.model_dump(),
        user_id=current_user.id
    )
    
    result = await db["subjects"].insert_one(new_subject.model_dump(by_alias=True, exclude=["id"]))
    created_subject = await db["subjects"].find_one({"_id": result.inserted_id})
    created_subject["_id"] = str(created_subject["_id"])
    
    return created_subject

@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    result = await db["subjects"].delete_one({"_id": ObjectId(subject_id), "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"message": "Subject deleted"}
