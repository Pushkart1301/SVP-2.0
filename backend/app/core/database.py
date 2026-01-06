from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

# Configure logger for this module
logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None

    def connect(self):
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URL)
            logger.info(f"Connected to MongoDB at {settings.MONGODB_URL}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

    def close(self):
        if self.client:
            try:
                self.client.close()
                logger.info("Closed MongoDB connection")
            except Exception as e:
                logger.error(f"Error closing MongoDB connection: {str(e)}")

    async def create_indexes(self):
        if self.client:
            db = self.get_db()
            # User indexes
            await db["users"].create_index("email", unique=True)
            
            # Performance indexes for user-based queries
            await db["subjects"].create_index("user_id")
            await db["schedules"].create_index("user_id")
            await db["attendance_records"].create_index("user_id")
            await db["attendance_records"].create_index([("user_id", 1), ("date", 1)], unique=True)
            
            logger.info("Database indexes created successfully")

    def get_db(self):
        return self.client[settings.DATABASE_NAME]

db = Database()

async def get_database():
    return db.get_db()
