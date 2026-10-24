from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, func, select
from app.api.users import find_user
from app.models.team_model import TeamMemberRecord, TeamRecord
from app.models.user_model import UserRecord
from app.schemas.team_schema import TeamAssignment, TeamRename
from app.utils.database import get_session

# API Router for the teams and their members (Team Board page)
router = APIRouter()

# Return the team, or raise 404
def find_team(session, team_id):
    team = session.get(TeamRecord, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

# ---------------------------------------------------
# GET /teams - List Teams
# Every team with its members, in the order in which they joined it
# ---------------------------------------------------
@router.get("/teams")
def list_teams(session: Session = Depends(get_session)):
    teams = session.exec(select(TeamRecord).order_by(TeamRecord.id)).all()
    rows = session.exec(
        select(TeamMemberRecord, UserRecord)
        .join(UserRecord, UserRecord.id == TeamMemberRecord.user_id)
        .order_by(TeamMemberRecord.position)
    ).all()

    members = {team.id: [] for team in teams}
    for member, user in rows:
        members[member.team_id].append({"id": user.id, "name": user.name, "email": user.email, "role": user.role})

    return [{"id": team.id, "name": team.name, "members": members[team.id]} for team in teams]


# ---------------------------------------------------
# PUT /teams/{team_id} - Rename Team
# 400 for a name that another team has
# ---------------------------------------------------
@router.put("/teams/{team_id}")
def rename_team(team_id: int, rename: TeamRename, session: Session = Depends(get_session)):
    team = find_team(session, team_id)

    other = session.exec(select(TeamRecord).where(TeamRecord.name == rename.name, TeamRecord.id != team_id)).first()
    if other:
        raise HTTPException(status_code=400, detail="Team name already exists")

    team.name = rename.name
    result = {"id": team.id, "name": team.name}

    # The unique name also rejects two requests with the same name at the same time
    session.add(team)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Team name already exists")

    return result


# ---------------------------------------------------
# PUT /users/{user_id}/team - Move User to Team
# The user becomes the last member of the team; a user is in at most one team
# ---------------------------------------------------
@router.put("/users/{user_id}/team")
def move_user(user_id: str, assignment: TeamAssignment, session: Session = Depends(get_session)):
    find_user(session, user_id)
    team = find_team(session, assignment.team_id)

    member = session.get(TeamMemberRecord, user_id)
    if not member or member.team_id != team.id:
        last = session.exec(select(func.max(TeamMemberRecord.position)).where(TeamMemberRecord.team_id == team.id)).one()
        position = (last or 0) + 1
        if member:
            member.team_id = team.id
            member.position = position
        else:
            member = TeamMemberRecord(user_id=user_id, team_id=team.id, position=position)
        session.add(member)
        session.commit()

    return {"user_id": user_id, "team_id": team.id}


# ---------------------------------------------------
# DELETE /users/{user_id}/team - Remove User from Team
# Nothing to do for a user who is in no team
# ---------------------------------------------------
@router.delete("/users/{user_id}/team")
def remove_user(user_id: str, session: Session = Depends(get_session)):
    find_user(session, user_id)

    member = session.get(TeamMemberRecord, user_id)
    if member:
        session.delete(member)
        session.commit()

    return {"message": "Removed from team"}
