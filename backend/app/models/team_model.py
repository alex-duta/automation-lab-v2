from sqlmodel import Field, SQLModel, select

# Teams of the Team Board page: full-stack teams, each owning a product area, as most teams work today.
# The default teams are created at startup and again by POST /reset.
DEFAULT_TEAMS = ["Payments", "Growth", "Platform"]

class TeamRecord(SQLModel, table=True):
    __tablename__ = "teams"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True)

# Membership of a user in a team: a user is in at most one team; position orders the members of a team
class TeamMemberRecord(SQLModel, table=True):
    __tablename__ = "team_members"

    user_id: str = Field(primary_key=True, foreign_key="users.id", ondelete="CASCADE")
    team_id: int = Field(foreign_key="teams.id", ondelete="CASCADE")
    position: int

# Create the default teams when there is no team (ids 1, 2, 3 after a reset)
def create_default_teams(session):
    if session.exec(select(TeamRecord)).first():
        return
    for name in DEFAULT_TEAMS:
        session.add(TeamRecord(name=name))
    session.commit()
