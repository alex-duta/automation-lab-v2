from sqlmodel import Field, SQLModel

# Table of the sessions (Session & Preferences page). The token is the value of the HTTP-only cookie session_id.
# A session is not authentication: any user who is not disabled can be signed in by e-mail, without a password.
class SessionRecord(SQLModel, table=True):
    __tablename__ = "sessions"

    token: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="users.id", ondelete="CASCADE")
    created_at: str
