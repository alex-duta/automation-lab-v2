from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel

# Table of the reports (Export & Reports page). The result is counted when the report is requested;
# the API shows it once the processing time (delay, in seconds) has passed.
class ReportRecord(SQLModel, table=True):
    __tablename__ = "reports"

    id: int | None = Field(default=None, primary_key=True)
    report_type: str
    search: str
    delay: float
    created_at: str
    result: list[dict] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
