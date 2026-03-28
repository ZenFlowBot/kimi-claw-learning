from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models import SOP, SOPCreate, SOPUpdate
from services import storage

router = APIRouter(prefix="/api/sops", tags=["sops"])


@router.get("", response_model=List[SOP])
def list_sops(category: Optional[str] = Query(None), tag: Optional[str] = Query(None)):
    sops = storage.list_sops()
    if category:
        sops = [s for s in sops if s.get("category") == category]
    if tag:
        sops = [s for s in sops if tag in s.get("tags", [])]
    return sops


@router.post("", response_model=SOP)
def create_sop(body: SOPCreate):
    sop = SOP(**body.model_dump())
    storage.save_sop(sop.model_dump(mode='json'))
    return sop


@router.get("/categories")
def list_categories():
    sops = storage.list_sops()
    cats = sorted(set(s.get("category", "通用") for s in sops))
    return cats


@router.get("/{sop_id}", response_model=SOP)
def get_sop(sop_id: str):
    sop = storage.get_sop(sop_id)
    if not sop:
        raise HTTPException(404, "SOP not found")
    return sop


@router.put("/{sop_id}", response_model=SOP)
def update_sop(sop_id: str, body: SOPUpdate):
    sop = storage.get_sop(sop_id)
    if not sop:
        raise HTTPException(404, "SOP not found")
    updates = {k: v for k, v in body.model_dump(mode='json').items() if v is not None}
    updates["updated_at"] = datetime.now().isoformat()
    updates["version"] = sop.get("version", 1) + 1
    sop.update(updates)
    storage.save_sop(sop)
    return sop


@router.delete("/{sop_id}")
def delete_sop(sop_id: str):
    ok = storage.delete_sop(sop_id)
    if not ok:
        raise HTTPException(404, "SOP not found")
    return {"ok": True}
