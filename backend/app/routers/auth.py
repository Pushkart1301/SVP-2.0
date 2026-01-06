from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core import security, database
from app.models.user import UserCreate, UserResponse, Token, UserInDB, UserUpdate
from app.core.config import settings
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncIOMotorDatabase = Depends(database.get_database)):
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = security.get_password_hash(user.password)
    user_in_db = UserInDB(**user.model_dump(), hashed_password=hashed_password)
    
    new_user = await db["users"].insert_one(user_in_db.model_dump(by_alias=True, exclude={"id"}))
    created_user = await db["users"].find_one({"_id": new_user.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    
    return UserResponse(**created_user)

@router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncIOMotorDatabase = Depends(database.get_database)):
    user = await db["users"].find_one({"email": form_data.username})
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: AsyncIOMotorDatabase = Depends(database.get_database)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except security.JWTError:
        raise credentials_exception
        
    user = await db["users"].find_one({"email": email})
    if user is None:
        raise credentials_exception
        
    user["_id"] = str(user["_id"])
    return UserResponse(**user)

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user(
    user_update: UserUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    
    if "password" in update_data:
        update_data["hashed_password"] = security.get_password_hash(update_data.pop("password"))
        
    if update_data:
        await db["users"].update_one({"_id": ObjectId(current_user.id)}, {"$set": update_data})
        
    updated_user = await db["users"].find_one({"_id": ObjectId(current_user.id)})
    updated_user["_id"] = str(updated_user["_id"])
    return UserResponse(**updated_user)
