from fastapi import APIRouter, Depends, HTTPException, Response
from datetime import datetime
import csv
import io
from sqlmodel import Session, func, select
from app.api.users import user_filters
from app.models.report_model import ReportRecord
from app.models.user_model import UserRecord
from app.schemas.report_schema import ReportCreate
from app.utils.database import get_session

# API Router for the CSV export of the users and the reports (Export & Reports page)
router = APIRouter()

REPORT_TITLES = {"by_role": "Users by role", "by_status": "Users by status"}

# Status of a report from the time since it was requested: queued for the first third of the delay,
# running (with its progress in percent) until the delay has passed, then ready
def report_state(report):
    elapsed = (datetime.utcnow() - datetime.fromisoformat(report.created_at)).total_seconds()
    if elapsed >= report.delay:
        return "ready", 100
    queued_for = report.delay / 3
    if elapsed < queued_for:
        return "queued", 0
    return "running", int(100 * (elapsed - queued_for) / (report.delay - queued_for))

# The report as the API returns it; the result only when it is ready
def report_dict(report):
    status, progress = report_state(report)
    return {
        "id": report.id,
        "type": report.report_type,
        "title": REPORT_TITLES[report.report_type],
        "search": report.search,
        "delay": report.delay,
        "status": status,
        "progress": progress,
        "created_at": report.created_at,
        "result": report.result if status == "ready" else None,
    }

# ---------------------------------------------------
# GET /users/export.csv - Export Users
# The users that match the filters of GET /users, all of them, as a CSV file to download
# ---------------------------------------------------
@router.get("/users/export.csv")
def export_users(
    search: str | None = None,
    role: str | None = None,
    status: str | None = None,
    session: Session = Depends(get_session),
    ):
    users = session.exec(select(UserRecord).where(*user_filters(search, role, status)).order_by(UserRecord.seq)).all()

    content = io.StringIO()
    writer = csv.writer(content)
    writer.writerow(["id", "name", "email", "role", "status", "created_at"])
    for u in users:
        writer.writerow([u.id, u.name, u.email, u.role, u.status, u.created_at])

    return Response(
        content=content.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="users.csv"'},
    )


# ---------------------------------------------------
# POST /reports - Request Report
# Counts the users that match the search, by role or by status; ready after the delay (0 to 10 s)
# ---------------------------------------------------
@router.post("/reports")
def create_report(create: ReportCreate, session: Session = Depends(get_session)):
    column = UserRecord.role if create.type == "by_role" else UserRecord.status
    rows = session.exec(
        select(column, func.count())
        .where(*user_filters(search=create.search))
        .group_by(column)
        .order_by(column)
    ).all()

    report = ReportRecord(
        report_type=create.type,
        search=create.search,
        delay=create.delay,
        created_at=datetime.utcnow().isoformat(),
        result=[{"label": label, "count": count} for label, count in rows],
    )
    session.add(report)
    session.commit()
    session.refresh(report)

    return report_dict(report)


# ---------------------------------------------------
# GET /reports/{report_id} - Get Report
# ---------------------------------------------------
@router.get("/reports/{report_id}")
def get_report(report_id: int, session: Session = Depends(get_session)):
    report = session.get(ReportRecord, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report_dict(report)
