from fastapi import APIRouter, Depends
from datetime import datetime
from sqlmodel import Session
from app.api.users import find_user
from app.models.profile_model import UserProfileRecord
from app.schemas.profile_schema import PERMISSIONS, ProfileUpdate
from app.utils.database import get_session

# API Router for the profile of a user: permissions, notifications, phone, language and bio (Edit User page)
router = APIRouter()

# -------------------------------------------------
# GET /users/{user_id}/profile - Get Profile
# A user who never saved a profile has the default one
# -------------------------------------------------
@router.get("/users/{user_id}/profile")
def get_profile(user_id: str, session: Session = Depends(get_session)):
    find_user(session, user_id)
    profile = session.get(UserProfileRecord, user_id) or UserProfileRecord(user_id=user_id)
    return profile.to_dict()


# -------------------------------------------------
# PUT /users/{user_id}/profile - Save Profile
# Replaces the whole profile; 422 for invalid values, or SMS without a phone
# -------------------------------------------------
@router.put("/users/{user_id}/profile")
def save_profile(user_id: str, update: ProfileUpdate, session: Session = Depends(get_session)):
    find_user(session, user_id)
    profile = session.get(UserProfileRecord, user_id) or UserProfileRecord(user_id=user_id)

    # Permissions in a fixed order, without duplicates
    profile.permissions = [p for p in PERMISSIONS if p in update.permissions]
    profile.notifications = update.notifications
    profile.phone = update.phone
    profile.language = update.language
    profile.bio = update.bio
    profile.updated_at = datetime.utcnow().isoformat()
    result = profile.to_dict()

    session.add(profile)
    session.commit()

    return result
