from datetime import datetime
from app.core.vacation_engine import (
    Subject,
    VacationRecommendationEngine,
    AIReasoningLayer,
    DayType
)

def generate_vacation_plan(
    subjects_data,
    weekly_schedule,
    academic_calendar,
    min_attendance
):
    # 1️⃣ Convert subjects to engine objects
    subjects = []
    for s in subjects_data:
        subjects.append(
            Subject(
                subject_id=s["id"],
                name=s["name"],
                attended=s["attended"],
                total=s["total"],
                threshold=min_attendance
            )
        )

    # 2️⃣ Initialize engine
    engine = VacationRecommendationEngine(
        subjects=subjects,
        weekly_schedule=weekly_schedule,
        academic_calendar=academic_calendar,
        global_threshold=min_attendance
    )

    # 3️⃣ Run simulation
    safe_windows = engine.find_safe_vacations(
        start_date=datetime.now(),
        top_n=3
    )

    # 4️⃣ Generate AI prompt
    ai_prompt = AIReasoningLayer.generate_ai_prompt(
        vacation_windows=safe_windows,
        subjects=engine.subjects
    )

    # ⚠️ Later: send ai_prompt to Groq LLM
    ai_response = "AI response from Groq here"

    # 5️⃣ Format final output
    return AIReasoningLayer.format_results_for_student(
        vacation_windows=safe_windows,
        ai_explanation=ai_response
    )
