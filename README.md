# 🎓 Student Vacation Planner 2.0 (SVP 2.0)

> **Your intelligent companion for academic success and automated break planning.**

SVP 2.0 is a comprehensive full-stack application designed to help students manage their academic life effortlessly. By combining smart attendance tracking with AI-powered insights, it helps you plan vacations without compromising your attendance criteria.

## ✨ Key Features

- **📊 Smart Attendance Tracking**
  - Visualize your attendance with interactive calendars.
  - Set thresholds (e.g., 75%) and get alerts.
  - "Safe to Bunk" calculations.

- **🤖 AI-Powered Engine**
  - **Vacation Planner**: Get personalized vacation recommendations based on your schedule.
  - **Study Plans**: Generate AI-tailored study routines.
  - **Calendar Extraction**: Upload your academic calendar image, and our OCR + AI engine (Groq) auto-digitizes it.

- **📈 Performance Analytics**
  - Visual insights into your academic trends using Recharts.
  - Track subject-wise performance.

- **🗓️ Dynamic Scheduling**
  - Map subjects to weekdays.
  - Real-time timetable management.

## 🛠️ Tech Stack

**Frontend**
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts

**Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **AI/ML**: Groq LLM Integration, OCR
- **Database**: MongoDB

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB connection string

### 1. Clone the Repository
```bash
git clone <repository_url>
cd svp_2_0
```

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file based on .env.example
cp .env.example .env
# Update .env with your MongoDB URL and Groq API Key

# Run server
uvicorn app.main:app --reload
```
*The backend runs on `http://localhost:8000`*

### 3. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Run development server
npm run dev
```
*The frontend runs on `http://localhost:3000`*

## 📂 Project Structure

```bash
svp_2_0/
├── frontend/          # Next.js Application
│   ├── app/           # App Router Pages & Layouts
│   ├── components/    # Reusable UI Components
│   └── lib/           # Utilities
├── backend/           # FastAPI Application
│   ├── app/           # API Routes & Logic
│   ├── services/      # AI & Business Logic
│   └── models/        # Database Models
└── README.md          # Project Documentation
```
---
*Built with ❤️ for students.*
