"""YAML-based persistent storage helpers."""
from __future__ import annotations
import yaml
from pathlib import Path
from typing import Any, Dict, List, Optional
from config import DATA_DIR


def _load(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        return data
    except yaml.YAMLError:
        return {}


def _save(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False, default_flow_style=False)


# ─── Schedule Storage ─────────────────────────────────────────────────────────

def _schedule_path(period: str, period_key: str) -> Path:
    """
    Mapping:
      year    / 2026          -> data/2026/yearly.yaml
      quarter / 2026-Q1       -> data/2026/Q1/quarterly.yaml
      month   / 2026-03       -> data/2026/03/monthly.yaml
      week    / 2026-W12      -> data/2026/weeks/W12.yaml
      day     / 2026-03-25    -> data/2026/03/days/2026-03-25.yaml
    """
    if period == "year":
        return DATA_DIR / period_key / "yearly.yaml"
    if period == "quarter":
        year, q = period_key.split("-")
        return DATA_DIR / year / q / "quarterly.yaml"
    if period == "month":
        year, month = period_key.split("-")
        return DATA_DIR / year / month / "monthly.yaml"
    if period == "week":
        year, week = period_key.split("-")
        return DATA_DIR / year / "weeks" / f"{week}.yaml"
    if period == "day":
        year, month, _ = period_key.split("-")
        return DATA_DIR / year / month / "days" / f"{period_key}.yaml"
    raise ValueError(f"Unknown period: {period}")


def list_schedules(period: str, period_key: str) -> List[Dict]:
    path = _schedule_path(period, period_key)
    data = _load(path)
    return list(data.get("items", {}).values())


def get_schedule(period: str, period_key: str, item_id: str) -> Optional[Dict]:
    path = _schedule_path(period, period_key)
    data = _load(path)
    return data.get("items", {}).get(item_id)


def save_schedule(item: Dict) -> Dict:
    path = _schedule_path(item["period"], item["period_key"])
    data = _load(path)
    if "items" not in data:
        data["items"] = {}
    data["items"][item["id"]] = item
    _save(path, data)
    return item


def delete_schedule(period: str, period_key: str, item_id: str) -> bool:
    path = _schedule_path(period, period_key)
    data = _load(path)
    items = data.get("items", {})
    if item_id not in items:
        return False
    del items[item_id]
    data["items"] = items
    _save(path, data)
    return True


def list_all_schedules_in_year(year: int) -> List[Dict]:
    """Collect all schedule items for dashboard aggregation."""
    results = []
    year_dir = DATA_DIR / str(year)
    if not year_dir.exists():
        return results

    def _collect(path: Path):
        if path.is_file() and path.suffix == ".yaml":
            d = _load(path)
            results.extend(d.get("items", {}).values())
        elif path.is_dir():
            for child in path.iterdir():
                _collect(child)

    _collect(year_dir)
    return results


# ─── SOP Storage ──────────────────────────────────────────────────────────────

_SOP_FILE = DATA_DIR / "sops" / "sops.yaml"


def list_sops() -> List[Dict]:
    data = _load(_SOP_FILE)
    return list(data.get("sops", {}).values())


def get_sop(sop_id: str) -> Optional[Dict]:
    data = _load(_SOP_FILE)
    return data.get("sops", {}).get(sop_id)


def save_sop(sop: Dict) -> Dict:
    data = _load(_SOP_FILE)
    if "sops" not in data:
        data["sops"] = {}
    data["sops"][sop["id"]] = sop
    _save(_SOP_FILE, data)
    return sop


def delete_sop(sop_id: str) -> bool:
    data = _load(_SOP_FILE)
    sops = data.get("sops", {})
    if sop_id not in sops:
        return False
    del sops[sop_id]
    data["sops"] = sops
    _save(_SOP_FILE, data)
    return True


# ─── Todo Storage ─────────────────────────────────────────────────────────────

_TODO_FILE = DATA_DIR / "todos" / "todos.yaml"


def list_todos() -> List[Dict]:
    data = _load(_TODO_FILE)
    return list(data.get("todos", {}).values())


def get_todo(todo_id: str) -> Optional[Dict]:
    data = _load(_TODO_FILE)
    return data.get("todos", {}).get(todo_id)


def save_todo(todo: Dict) -> Dict:
    data = _load(_TODO_FILE)
    if "todos" not in data:
        data["todos"] = {}
    data["todos"][todo["id"]] = todo
    _save(_TODO_FILE, data)
    return todo


def delete_todo(todo_id: str) -> bool:
    data = _load(_TODO_FILE)
    todos = data.get("todos", {})
    if todo_id not in todos:
        return False
    del todos[todo_id]
    data["todos"] = todos
    _save(_TODO_FILE, data)
    return True


# ─── Reminder Settings Storage ────────────────────────────────────────────────

_REMINDER_FILE = DATA_DIR / "reminder_settings.yaml"


def load_reminder_settings() -> Dict:
    data = _load(_REMINDER_FILE)
    return data.get("settings", {
        "channels": ["terminal"],
        "daily_digest_time": "08:00",
        "weekly_digest_day": "Monday",
        "monthly_digest_day": 1,
        "email_to": None,
        "webhook_url": None,
        "webhook_type": "dingtalk",
    })


def save_reminder_settings(settings: Dict) -> Dict:
    _save(_REMINDER_FILE, {"settings": settings})
    return settings
