from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models import Todo, TodoCreate, TodoUpdate
from services import storage

router = APIRouter(prefix="/api/todos", tags=["todos"])


@router.get("", response_model=List[Todo])
def list_todos(status: Optional[str] = Query(None), priority: Optional[str] = Query(None)):
    todos = storage.list_todos()
    if status:
        todos = [t for t in todos if t.get("status") == status]
    if priority:
        todos = [t for t in todos if t.get("priority") == priority]
    # Sort: high priority first, then by due_date
    priority_order = {"high": 0, "medium": 1, "low": 2}
    todos.sort(key=lambda t: (priority_order.get(t.get("priority", "medium"), 1), t.get("due_date") or "9999"))
    return todos


@router.post("", response_model=Todo)
def create_todo(body: TodoCreate):
    todo = Todo(**body.model_dump())
    storage.save_todo(todo.model_dump(mode='json'))
    return todo


@router.get("/{todo_id}", response_model=Todo)
def get_todo(todo_id: str):
    todo = storage.get_todo(todo_id)
    if not todo:
        raise HTTPException(404, "Todo not found")
    return todo


@router.put("/{todo_id}", response_model=Todo)
def update_todo(todo_id: str, body: TodoUpdate):
    todo = storage.get_todo(todo_id)
    if not todo:
        raise HTTPException(404, "Todo not found")
    updates = {k: v for k, v in body.model_dump(mode='json').items() if v is not None}
    updates["updated_at"] = datetime.now().isoformat()
    todo.update(updates)
    storage.save_todo(todo)
    return todo


@router.delete("/{todo_id}")
def delete_todo(todo_id: str):
    ok = storage.delete_todo(todo_id)
    if not ok:
        raise HTTPException(404, "Todo not found")
    return {"ok": True}
