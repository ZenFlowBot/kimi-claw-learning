from __future__ import annotations
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models import ScheduleItem, ScheduleItemCreate, ScheduleItemUpdate, Status
from services import storage

router = APIRouter(prefix="/api/schedules", tags=["schedules"])


@router.get("", response_model=List[ScheduleItem])
def list_schedules(period: str = Query(...), period_key: str = Query(...)):
    return storage.list_schedules(period, period_key)


@router.post("", response_model=ScheduleItem)
def create_schedule(body: ScheduleItemCreate):
    item = ScheduleItem(**body.model_dump())
    storage.save_schedule(item.model_dump(mode='json'))
    return item


@router.get("/dashboard")
def get_dashboard():
    today = date.today()
    year = today.year
    month_key = f"{year}-{today.month:02d}"
    week_num = today.isocalendar()[1]
    week_key = f"{year}-W{week_num:02d}"
    quarter = (today.month - 1) // 3 + 1
    quarter_key = f"{year}-Q{quarter}"
    today_key = today.isoformat()

    all_items = storage.list_all_schedules_in_year(year)
    all_todos = storage.list_todos()

    def active(items):
        return [i for i in items if i.get("status") not in ("done", "cancelled")]

    def overdue(items):
        result = []
        for i in items:
            due = i.get("due_date")
            if due and i.get("status") not in ("done", "cancelled"):
                try:
                    if date.fromisoformat(due) < today:
                        result.append(i)
                except ValueError:
                    pass
        return result

    return {
        "today": active([i for i in all_items if i.get("period") == "day" and i.get("period_key") == today_key]),
        "this_week": active([i for i in all_items if i.get("period") == "week" and i.get("period_key") == week_key]),
        "this_month": active([i for i in all_items if i.get("period") == "month" and i.get("period_key") == month_key]),
        "this_quarter": active([i for i in all_items if i.get("period") == "quarter" and i.get("period_key") == quarter_key]),
        "this_year": active([i for i in all_items if i.get("period") == "year" and i.get("period_key") == str(year)]),
        "pending_todos": active(all_todos),
        "overdue_items": overdue(all_items),
        "overdue_todos": overdue(all_todos),
    }


@router.get("/{item_id}", response_model=ScheduleItem)
def get_schedule(item_id: str, period: str = Query(...), period_key: str = Query(...)):
    item = storage.get_schedule(period, period_key, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    return item


@router.put("/{item_id}", response_model=ScheduleItem)
def update_schedule(item_id: str, body: ScheduleItemUpdate, period: str = Query(...), period_key: str = Query(...)):
    item = storage.get_schedule(period, period_key, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    updates["updated_at"] = datetime.now().isoformat()
    item.update(updates)
    storage.save_schedule(item)
    return item


@router.delete("/{item_id}")
def delete_schedule(item_id: str, period: str = Query(...), period_key: str = Query(...)):
    ok = storage.delete_schedule(period, period_key, item_id)
    if not ok:
        raise HTTPException(404, "Item not found")
    return {"ok": True}
