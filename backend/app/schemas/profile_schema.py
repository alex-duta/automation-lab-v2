from typing import Literal, get_args
from pydantic import BaseModel, Field, model_validator

# Values that a profile accepts
Permission = Literal["create_users", "edit_users", "delete_users", "export_reports"]
PERMISSIONS = list(get_args(Permission))

class ProfileUpdate(BaseModel):
    permissions: list[Permission]
    notifications: Literal["email", "sms", "none"]
    phone: str | None = Field(default=None, pattern=r"^\+?[0-9 ]{7,15}$")
    language: Literal["en", "ro", "de", "fr"]
    bio: str = Field(max_length=2000)

    # SMS notifications need a phone number
    @model_validator(mode="after")
    def phone_for_sms(self):
        if self.notifications == "sms" and not self.phone:
            raise ValueError("phone is required for SMS notifications")
        return self
