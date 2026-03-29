from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models import RecurringTemplate, RecurringTemplateCreate, RecurringTemplateUpdate
from services import storage

router = APIRouter(prefix="/api/recurring", tags=["recurring"])


@router.get("", response_model=List[RecurringTemplate])
def list_recurring(period_type: Optional[str] = Query(None)):
    return storage.list_recurring(period_type)


@router.post("", response_model=RecurringTemplate)
def create_recurring(body: RecurringTemplateCreate):
    template = RecurringTemplate(**body.model_dump())
    storage.save_recurring(template.model_dump(mode='json'))
    return template


@router.put("/{template_id}", response_model=RecurringTemplate)
def update_recurring(template_id: str, body: RecurringTemplateUpdate):
    template = storage.get_recurring(template_id)
    if not template:
        raise HTTPException(404, "Template not found")
    updates = {k: v for k, v in body.model_dump(mode='json').items() if v is not None}
    updates["updated_at"] = datetime.now().isoformat()
    template.update(updates)
    storage.save_recurring(template)
    return template


@router.delete("/{template_id}")
def delete_recurring(template_id: str):
    if not storage.delete_recurring(template_id):
        raise HTTPException(404, "Template not found")
    return {"ok": True}


@router.get("/completions/{period_key}")
def get_completions(period_key: str):
    return storage.get_completions(period_key)


@router.post("/completions/{period_key}/{template_id}")
def toggle_completion(period_key: str, template_id: str, done: bool = Query(True)):
    storage.set_completion(period_key, template_id, done)
    return {"ok": True}
