from sqlmodel import Field, SQLModel

# Table of the users in the PostgreSQL database.
# seq keeps the order in which the users were created (listing and pagination);
# id is the identifier that the API returns.
class UserRecord(SQLModel, table=True):
    __tablename__ = "users"

    seq: int | None = Field(default=None, primary_key=True)
    id: str = Field(unique=True, index=True)
    name: str
    email: str = Field(unique=True)
    role: str
    status: str
    profile_picture: str | None = None
    created_at: str

    # The user as the API returns it, without seq
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "status": self.status,
            "profile_picture": self.profile_picture,
            "created_at": self.created_at,
        }
