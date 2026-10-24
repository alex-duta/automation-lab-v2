from fastapi import APIRouter, Depends, HTTPException, Request, Response
from datetime import datetime
import secrets
from sqlmodel import Session, func, select
from app.models.preference_model import UserPreferencesRecord
from app.models.session_model import SessionRecord
from app.models.user_model import UserRecord
from app.schemas.session_schema import PreferencesUpdate, SignIn
from app.utils.database import get_session

# API Router for the session of the browser and the preferences of the signed-in user (Session & Preferences page).
# The session is kept in the HTTP-only cookie session_id: the page cannot read it, the browser sends it with the
# requests made with credentials. Here the database session is called db, not to mix it up with the session of the
# browser.
router = APIRouter()

SESSION_COOKIE = "session_id"

# Return the session of the cookie and its user, or raise 401
def current_session(request, db):
    token = request.cookies.get(SESSION_COOKIE)
    record = db.get(SessionRecord, token) if token else None
    user = db.exec(select(UserRecord).where(UserRecord.id == record.user_id)).first() if record else None
    if not user:
        raise HTTPException(status_code=401, detail="Not signed in")
    return record, user

# The session as the API returns it: the user, when they signed in, and their preferences
def session_dict(db, record, user):
    preferences = db.get(UserPreferencesRecord, user.id) or UserPreferencesRecord(user_id=user.id)
    return {"user": user.to_dict(), "created_at": record.created_at, "preferences": preferences.to_dict()}

# ---------------------------------------------------
# POST /session - Sign In
# Signs in the user with this e-mail (no password); 404 for an unknown e-mail, 403 for a disabled user
# ---------------------------------------------------
@router.post("/session")
def sign_in(sign_in: SignIn, response: Response, db: Session = Depends(get_session)):
    user = db.exec(select(UserRecord).where(func.lower(UserRecord.email) == sign_in.email.lower())).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.status.lower() == "disabled":
        raise HTTPException(status_code=403, detail="User is disabled")

    record = SessionRecord(token=secrets.token_urlsafe(32), user_id=user.id, created_at=datetime.utcnow().isoformat())
    result = session_dict(db, record, user)
    db.add(record)
    db.commit()

    response.set_cookie(SESSION_COOKIE, record.token, httponly=True, samesite="lax", path="/")
    return result


# ---------------------------------------------------
# GET /session - Current Session
# The signed-in user and their preferences; 401 without a valid session cookie
# ---------------------------------------------------
@router.get("/session")
def get_current_session(request: Request, db: Session = Depends(get_session)):
    record, user = current_session(request, db)
    return session_dict(db, record, user)


# ---------------------------------------------------
# PUT /session/preferences - Save Preferences
# Saves the preferences of the signed-in user; 401 without a valid session cookie
# ---------------------------------------------------
@router.put("/session/preferences")
def save_preferences(update: PreferencesUpdate, request: Request, db: Session = Depends(get_session)):
    record, user = current_session(request, db)

    preferences = db.get(UserPreferencesRecord, user.id) or UserPreferencesRecord(user_id=user.id)
    preferences.theme = update.theme
    preferences.date_format = update.date_format
    result = preferences.to_dict()

    db.add(preferences)
    db.commit()

    return result


# ---------------------------------------------------
# DELETE /session - Sign Out
# Ends the session of the cookie, if there is one, and deletes the cookie
# ---------------------------------------------------
@router.delete("/session")
def sign_out(request: Request, response: Response, db: Session = Depends(get_session)):
    token = request.cookies.get(SESSION_COOKIE)
    record = db.get(SessionRecord, token) if token else None
    if record:
        db.delete(record)
        db.commit()

    response.delete_cookie(SESSION_COOKIE, httponly=True, samesite="lax", path="/")
    return {"message": "Signed out"}
