from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from datetime import datetime
import uuid
import os
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, func, or_, select
from app.models.team_model import create_default_teams
from app.models.user_model import UserRecord
from app.schemas.user_schema import UserCreate
from app.utils.database import get_session

# API Router for user-related endpoints: create user, upload profile picture, list users etc.
router = APIRouter()

# Directory for storing profile pictures
PROFILE_DIR = "app/storage/profile_pics"

# Return the user, or raise 404 (also used by the profile and team endpoints)
def find_user(session, user_id):
    user = session.exec(select(UserRecord).where(UserRecord.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Conditions of the user filters (also used by the export and the reports)
def user_filters(search=None, role=None, status=None):
    conditions = []

    #  SEARCH FILTER: the term anywhere in the name or the email, ignoring case
    #  (strpos and not LIKE, where _ and % in the term would be wildcards)
    if search:
        search_lower = search.lower()
        conditions.append(or_(
            func.strpos(func.lower(UserRecord.name), search_lower) > 0,
            func.strpos(func.lower(UserRecord.email), search_lower) > 0,
        ))

    #  ROLE FILTER
    if role:
        conditions.append(UserRecord.role == role)

    #  STATUS FILTER
    if status:
        conditions.append(UserRecord.status == status)

    return conditions

# -------------------------
# POST /users - Create User
# -------------------------
@router.post("/users")
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    # Check duplicate email
    if session.exec(select(UserRecord).where(UserRecord.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    # Create new user
    new_user = UserRecord(
        id=str(uuid.uuid4()),
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        profile_picture=None,
        created_at=datetime.utcnow().isoformat(),
    )
    result = new_user.to_dict()

    # Save new user; the unique e-mail also rejects two requests with the same e-mail at the same time
    session.add(new_user)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Email already exists")

    return result


# ---------------------------------------------------
# POST /users/{id}/upload-picture - Upload Profile Picture
# Query parameters:
# user_id: ID of the user whose picture is being uploaded
# ---------------------------------------------------
@router.post("/users/{user_id}/upload-picture")
def upload_picture(user_id: str, file: UploadFile = File(...), session: Session = Depends(get_session)):
    # Find user
    user = find_user(session, user_id)

    # Ensure storage folder exists
    os.makedirs(PROFILE_DIR, exist_ok=True)

    # Construct file path
    file_ext = os.path.splitext(file.filename)[1]
    picture_path = f"{PROFILE_DIR}/{user_id}{file_ext}"

    # Save file
    with open(picture_path, "wb") as f:
        f.write(file.file.read())

    # Update user record
    user.profile_picture = picture_path
    session.add(user)
    session.commit()

    return {"message": "Picture uploaded"}

# ---------------------------------
# GET /users - List Users
# Optional query parameters:
# search: search term for name or email
# role: filter by user role
# status: filter by user status
# size: number of items per page (default 10, at least 1)
# page: page number (default 1, at least 1)
# ---------------------------------
@router.get("/users")
def list_users(
    search: str | None = None,
    role: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1),
    session: Session = Depends(get_session),
    ):
    conditions = user_filters(search, role, status)

    #  PAGINATION: total, page, size, items, in the order of creation
    total = session.exec(select(func.count()).select_from(UserRecord).where(*conditions)).one()
    paginated = session.exec(
        select(UserRecord)
        .where(*conditions)
        .order_by(UserRecord.seq)
        .offset((page - 1) * size)
        .limit(size)
    ).all()

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": [u.to_dict() for u in paginated],
    }


# ---------------------------------------------------
# POST /reset - Reset Data
# Empties the user list, the user profiles and preferences, the teams, the reports and the sessions, creates the default teams again
# and deletes the uploaded profile pictures, so that a run of a test suite starts from the
# same state every time.
# ---------------------------------------------------
@router.post("/reset")
def reset_data(session: Session = Depends(get_session)):
    session.connection().execute(text(
        "TRUNCATE TABLE sessions, user_preferences, reports, team_members, teams, user_profiles, users RESTART IDENTITY"
    ))
    session.commit()
    create_default_teams(session)

    # Delete the uploaded profile pictures
    if os.path.isdir(PROFILE_DIR):
        for name in os.listdir(PROFILE_DIR):
            path = os.path.join(PROFILE_DIR, name)
            if os.path.isfile(path):
                os.remove(path)

    return {"message": "Data reset"}
