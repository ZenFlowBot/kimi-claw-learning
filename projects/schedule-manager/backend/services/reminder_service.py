"""Multi-channel reminder dispatch: terminal, email, webhook (DingTalk/WeCom/Slack)."""
from __future__ import annotations
import smtplib
import json
import logging
from datetime import date, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Dict

import httpx

import config
from services import storage

logger = logging.getLogger("reminder")


# ─── Message Builder ─────────────────────────────────────────────────────────

def _build_digest_text(items: List[Dict], todos: List[Dict], period_label: str) -> str:
    lines = [f"【日程提醒】{period_label}", ""]
    if items:
        lines.append("📅 日程事项：")
        for item in items:
            priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(item.get("priority", "medium"), "⚪")
            status = item.get("status", "pending")
            if status in ("done", "cancelled"):
                continue
            due = f"  截止: {item['due_date']}" if item.get("due_date") else ""
            lines.append(f"  {priority_icon} [{item['period_key']}] {item['title']}{due}")
    if todos:
        lines.append("")
        lines.append("✅ 临时待办：")
        for todo in todos:
            if todo.get("status") in ("done", "cancelled"):
                continue
            priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(todo.get("priority", "medium"), "⚪")
            due = f"  截止: {todo['due_date']}" if todo.get("due_date") else ""
            lines.append(f"  {priority_icon} {todo['title']}{due}")
    return "\n".join(lines)


# ─── Channels ────────────────────────────────────────────────────────────────

def send_terminal(message: str) -> None:
    print("\n" + "=" * 60)
    print(message)
    print("=" * 60 + "\n")


def send_email(subject: str, body: str, to_addr: str) -> None:
    if not all([config.SMTP_USER, config.SMTP_PASS, to_addr]):
        logger.warning("Email config incomplete, skipping.")
        return
    try:
        msg = MIMEMultipart()
        msg["From"] = config.SMTP_USER
        msg["To"] = to_addr
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(config.SMTP_USER, config.SMTP_PASS)
            server.send_message(msg)
        logger.info(f"Email sent to {to_addr}")
    except Exception as e:
        logger.error(f"Email send failed: {e}")


def send_webhook(message: str, webhook_url: str, webhook_type: str = "dingtalk") -> None:
    if not webhook_url:
        logger.warning("Webhook URL not configured, skipping.")
        return
    try:
        if webhook_type == "dingtalk":
            payload = {"msgtype": "text", "text": {"content": message}}
        elif webhook_type == "wecom":
            payload = {"msgtype": "text", "text": {"content": message}}
        elif webhook_type == "slack":
            payload = {"text": message}
        else:
            payload = {"text": message}

        resp = httpx.post(webhook_url, json=payload, timeout=10)
        resp.raise_for_status()
        logger.info(f"Webhook ({webhook_type}) sent successfully")
    except Exception as e:
        logger.error(f"Webhook send failed: {e}")


# ─── Dispatch ─────────────────────────────────────────────────────────────────

def dispatch(message: str, subject: str = "日程提醒") -> None:
    settings = storage.load_reminder_settings()
    channels = settings.get("channels", ["terminal"])

    if "terminal" in channels:
        send_terminal(message)

    if "email" in channels:
        to_addr = settings.get("email_to") or config.NOTIFY_EMAIL
        send_email(subject, message, to_addr)

    if "webhook" in channels:
        webhook_url = settings.get("webhook_url") or config.WEBHOOK_URL
        webhook_type = settings.get("webhook_type", "dingtalk")
        send_webhook(message, webhook_url, webhook_type)


# ─── Digest Jobs ──────────────────────────────────────────────────────────────

def _due_within(items: List[Dict], days: int) -> List[Dict]:
    today = date.today()
    result = []
    for item in items:
        due = item.get("due_date")
        if not due:
            continue
        try:
            due_date = date.fromisoformat(due)
            reminder_days = item.get("reminder_days_before", 1)
            remind_on = due_date - timedelta(days=reminder_days)
            if remind_on <= today <= due_date:
                result.append(item)
        except ValueError:
            pass
    return result


def run_daily_digest() -> None:
    from datetime import datetime
    today_str = date.today().isoformat()
    year = date.today().year

    all_schedules = storage.list_all_schedules_in_year(year)
    active = [s for s in all_schedules if s.get("status") not in ("done", "cancelled")]
    due_items = _due_within(active, 3)

    all_todos = storage.list_todos()
    active_todos = [t for t in all_todos if t.get("status") not in ("done", "cancelled")]
    due_todos = _due_within(active_todos, 3)

    # Always show today's day-period items
    today_items = [s for s in active if s.get("period") == "day" and s.get("period_key") == today_str]
    combined = {i["id"]: i for i in due_items + today_items}

    message = _build_digest_text(list(combined.values()), due_todos, f"每日摘要 {today_str}")
    dispatch(message, subject=f"每日日程摘要 {today_str}")


def run_weekly_digest() -> None:
    from datetime import datetime
    year = date.today().year
    week = date.today().isocalendar()[1]
    period_key = f"{year}-W{week:02d}"

    all_schedules = storage.list_all_schedules_in_year(year)
    week_items = [s for s in all_schedules if s.get("period") == "week" and s.get("period_key") == period_key]
    active = [s for s in week_items if s.get("status") not in ("done", "cancelled")]

    all_todos = storage.list_todos()
    active_todos = [t for t in all_todos if t.get("status") not in ("done", "cancelled")]

    message = _build_digest_text(active, active_todos, f"每周摘要 {period_key}")
    dispatch(message, subject=f"每周日程摘要 {period_key}")


def run_monthly_digest() -> None:
    today = date.today()
    period_key = f"{today.year}-{today.month:02d}"

    all_schedules = storage.list_all_schedules_in_year(today.year)
    month_items = [s for s in all_schedules if s.get("period") == "month" and s.get("period_key") == period_key]
    active = [s for s in month_items if s.get("status") not in ("done", "cancelled")]

    all_todos = storage.list_todos()
    active_todos = [t for t in all_todos if t.get("status") not in ("done", "cancelled")]

    message = _build_digest_text(active, active_todos, f"每月摘要 {period_key}")
    dispatch(message, subject=f"每月日程摘要 {period_key}")
