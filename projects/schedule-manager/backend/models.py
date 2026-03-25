from __future__ import annotations
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


def gen_id() -> str:
    return str(uuid.uuid4())[:8]


class Priority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class Status(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    done = "done"
    cancelled = "cancelled"


class Period(str, Enum):
    year = "year"
    quarter = "quarter"
    month = "month"
    week = "week"
    day = "day"


class ReminderChannel(str, Enum):
    terminal = "terminal"
    email = "email"
    webhook = "webhook"


# ─── Schedule Item ────────────────────────────────────────────────────────────

class ScheduleItemCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    period: Period
    period_key: str                        # e.g. "2026", "2026-Q1", "2026-03", "2026-W12", "2026-03-25"
    priority: Priority = Priority.medium
    tags: List[str] = []
    due_date: Optional[str] = None        # ISO date string
    reminder_days_before: int = 1


class ScheduleItem(ScheduleItemCreate):
    id: str = Field(default_factory=gen_id)
    status: Status = Status.pending
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class ScheduleItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    tags: Optional[List[str]] = None
    due_date: Optional[str] = None
    reminder_days_before: Optional[int] = None


# ─── SOP ─────────────────────────────────────────────────────────────────────

class SOPStep(BaseModel):
    step: int
    action: str
    detail: Optional[str] = ""
    checklist: List[str] = []


class SOPCreate(BaseModel):
    title: str
    category: str = "通用"
    description: Optional[str] = ""
    steps: List[SOPStep] = []
    tags: List[str] = []
    trigger: Optional[str] = ""          # 触发场景


class SOP(SOPCreate):
    id: str = Field(default_factory=gen_id)
    version: int = 1
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class SOPUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[SOPStep]] = None
    tags: Optional[List[str]] = None
    trigger: Optional[str] = None


# ─── Temporary Todo ───────────────────────────────────────────────────────────

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Priority = Priority.medium
    due_date: Optional[str] = None
    tags: List[str] = []
    reminder_days_before: int = 0


class Todo(TodoCreate):
    id: str = Field(default_factory=gen_id)
    status: Status = Status.pending
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    tags: Optional[List[str]] = None
    due_date: Optional[str] = None
    reminder_days_before: Optional[int] = None


# ─── Reminder Settings ────────────────────────────────────────────────────────

class ReminderSettings(BaseModel):
    channels: List[ReminderChannel] = [ReminderChannel.terminal]
    daily_digest_time: str = "08:00"     # HH:MM
    weekly_digest_day: str = "Monday"
    monthly_digest_day: int = 1
    email_to: Optional[str] = None
    webhook_url: Optional[str] = None
    webhook_type: str = "dingtalk"       # dingtalk | wecom | slack


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardData(BaseModel):
    today: List[ScheduleItem] = []
    this_week: List[ScheduleItem] = []
    this_month: List[ScheduleItem] = []
    this_quarter: List[ScheduleItem] = []
    this_year: List[ScheduleItem] = []
    pending_todos: List[Todo] = []
    overdue_items: List[ScheduleItem] = []
    overdue_todos: List[Todo] = []
