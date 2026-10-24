from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel

# Table of the user profiles (Edit User page): one row per user, created when the profile is first saved.
# A user without a row has the default profile.
class UserProfileRecord(SQLModel, table=True):
    __tablename__ = "user_profiles"

    user_id: str = Field(primary_key=True, foreign_key="users.id", ondelete="CASCADE")
    permissions: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    notifications: str = "email"
    phone: str | None = None
    language: str = "en"
    bio: str = ""
    updated_at: str | None = None

    # The profile as the API returns it
    def to_dict(self):
        return {
            "user_id": self.user_id,
            "permissions": list(self.permissions),
            "notifications": self.notifications,
            "phone": self.phone,
            "language": self.language,
            "bio": self.bio,
            "updated_at": self.updated_at,
        }
