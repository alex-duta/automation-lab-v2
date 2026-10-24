from typing import Literal
from pydantic import BaseModel, Field

class ReportCreate(BaseModel):
    type: Literal["by_role", "by_status"]
    search: str = Field(default="", max_length=100)
    delay: float = Field(default=3, ge=0, le=10)
