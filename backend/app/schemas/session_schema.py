from typing import Literal
from pydantic import BaseModel, EmailStr

class SignIn(BaseModel):
    email: EmailStr

class PreferencesUpdate(BaseModel):
    theme: Literal["light", "dark"]
    date_format: Literal["iso", "eu", "us"]
