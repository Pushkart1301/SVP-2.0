#!/usr/bin/env python
"""
MongoDB Database Viewer for SVP 2.0
Usage: python view_database.py
"""

from pymongo import MongoClient
from datetime import datetime
import json

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017')
db = client['svp_db']

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def format_doc(doc):
    """Convert MongoDB document to pretty JSON"""
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return json.dumps(doc, indent=2)
    

# Show all collections
print_section("DATABASE: svp_db")
collections = db.list_collection_names()
print(f"Collections found: {', '.join(collections)}")

# Users
print_section("USERS")
users = list(db['users'].find().limit(10))
print(f"Total users: {db['users'].count_documents({})}")
for i, user in enumerate(users, 1):
    print(f"\n--- User {i} ---")
    # Don't show hashed_password for security
    user.pop('hashed_password', None)
    print(format_doc(user))

# Subjects
print_section("SUBJECTS")
subjects = list(db['subjects'].find().limit(20))
print(f"Total subjects: {db['subjects'].count_documents({})}")
for i, subject in enumerate(subjects, 1):
    print(f"\n--- Subject {i} ---")
    print(format_doc(subject))

# Schedules
print_section("SCHEDULES")
schedules = list(db['schedules'].find().limit(10))
print(f"Total schedules: {db['schedules'].count_documents({})}")
for i, schedule in enumerate(schedules, 1):
    print(f"\n--- Schedule {i} ---")
    print(format_doc(schedule))

# Attendance Records
print_section("ATTENDANCE RECORDS")
records = list(db['attendance_records'].find().limit(10))
print(f"Total attendance records: {db['attendance_records'].count_documents({})}")
for i, record in enumerate(records, 1):
    print(f"\n--- Attendance {i} ---")
    print(format_doc(record))

print("\n" + "="*60)
print("✅ Database inspection complete!")
print("="*60)
