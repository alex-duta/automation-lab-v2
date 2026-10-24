from sqlmodel import Field, SQLModel

# Preferences of a user (Session & Preferences page): one row per user, created when the user first saves them.
# A user without a row has the default preferences.
DEFAULT_PREFERENCES = {"theme": "light", "date_format": "iso"}

class UserPreferencesRecord(SQLModel, table=True):
    __tablename__ = "user_preferences"

    user_id: str = Field(primary_key=True, foreign_key="users.id", ondelete="CASCADE")
    theme: str = DEFAULT_PREFERENCES["theme"]
    date_format: str = DEFAULT_PREFERENCES["date_format"]

    # The preferences as the API returns them
    def to_dict(self):
        return {"theme": self.theme, "date_format": self.date_format}
