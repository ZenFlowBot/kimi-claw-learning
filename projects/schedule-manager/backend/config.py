import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"

# Ensure data directories exist
DATA_DIR.mkdir(exist_ok=True)
(DATA_DIR / "sops").mkdir(exist_ok=True)
(DATA_DIR / "todos").mkdir(exist_ok=True)

# Reminder config (override via environment variables)
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
NOTIFY_EMAIL = os.getenv("NOTIFY_EMAIL", "")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")  # DingTalk / WeCom / Slack webhook
