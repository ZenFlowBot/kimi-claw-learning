"""APScheduler setup – schedules digest jobs based on reminder settings."""
from __future__ import annotations
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from services import reminder_service, storage

logger = logging.getLogger("scheduler")
_scheduler: BackgroundScheduler | None = None

_WEEKDAY_MAP = {
    "Monday": "mon", "Tuesday": "tue", "Wednesday": "wed",
    "Thursday": "thu", "Friday": "fri", "Saturday": "sat", "Sunday": "sun",
}


def _reconfigure(scheduler: BackgroundScheduler) -> None:
    """Remove and re-add all digest jobs based on current settings."""
    for job in scheduler.get_jobs():
        job.remove()

    settings = storage.load_reminder_settings()
    digest_time = settings.get("daily_digest_time", "08:00")
    hour, minute = digest_time.split(":")

    # Daily digest
    scheduler.add_job(
        reminder_service.run_daily_digest,
        CronTrigger(hour=int(hour), minute=int(minute)),
        id="daily_digest",
        replace_existing=True,
    )
    logger.info(f"Daily digest scheduled at {digest_time}")

    # Weekly digest
    weekly_day = _WEEKDAY_MAP.get(settings.get("weekly_digest_day", "Monday"), "mon")
    scheduler.add_job(
        reminder_service.run_weekly_digest,
        CronTrigger(day_of_week=weekly_day, hour=int(hour), minute=int(minute)),
        id="weekly_digest",
        replace_existing=True,
    )
    logger.info(f"Weekly digest scheduled on {weekly_day} at {digest_time}")

    # Monthly digest
    monthly_day = settings.get("monthly_digest_day", 1)
    scheduler.add_job(
        reminder_service.run_monthly_digest,
        CronTrigger(day=monthly_day, hour=int(hour), minute=int(minute)),
        id="monthly_digest",
        replace_existing=True,
    )
    logger.info(f"Monthly digest scheduled on day {monthly_day} at {digest_time}")


def start() -> BackgroundScheduler:
    global _scheduler
    _scheduler = BackgroundScheduler(timezone="Asia/Shanghai")
    _reconfigure(_scheduler)
    _scheduler.start()
    logger.info("Scheduler started")
    return _scheduler


def reconfigure() -> None:
    if _scheduler:
        _reconfigure(_scheduler)


def shutdown() -> None:
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
