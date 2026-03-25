from __future__ import annotations
from fastapi import APIRouter
from models import ReminderSettings
from services import storage, reminder_service
from services import scheduler as sched

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


@router.get("/settings", response_model=ReminderSettings)
def get_settings():
    return storage.load_reminder_settings()


@router.put("/settings", response_model=ReminderSettings)
def update_settings(body: ReminderSettings):
    data = storage.save_reminder_settings(body.model_dump())
    sched.reconfigure()
    return data


@router.post("/test")
def send_test_reminder():
    """Send a test reminder through all configured channels."""
    reminder_service.dispatch("🔔 这是一条测试提醒，您的日程管理系统已正常运行！", subject="测试提醒")
    return {"ok": True, "message": "测试提醒已发送"}


@router.post("/daily")
def trigger_daily():
    reminder_service.run_daily_digest()
    return {"ok": True}


@router.post("/weekly")
def trigger_weekly():
    reminder_service.run_weekly_digest()
    return {"ok": True}


@router.post("/monthly")
def trigger_monthly():
    reminder_service.run_monthly_digest()
    return {"ok": True}
