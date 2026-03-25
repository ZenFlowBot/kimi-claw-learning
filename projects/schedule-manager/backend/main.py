import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from routers import schedules, sops, todos, reminders
from services import scheduler

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(
    title="日程管理系统",
    description="全年/季度/月度/每周/每日日程、SOP流程、临时待办的一站式管理平台",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schedules.router)
app.include_router(sops.router)
app.include_router(todos.router)
app.include_router(reminders.router)

# Serve React frontend from /dist if it exists
dist_dir = Path(__file__).parent.parent / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/", StaticFiles(directory=str(dist_dir), html=True), name="static")


@app.get("/health")
def health():
    return {"status": "ok", "service": "schedule-manager"}
