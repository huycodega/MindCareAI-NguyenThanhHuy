"""Pydantic schemas — request / response bodies for the API."""
from typing import Optional, List
from pydantic import BaseModel, Field


# ---- Gmail self-registration + OTP ----
# Email kept as plain str (validated in the endpoint against the allowed
# domain list) so we don't hard-depend on the optional email-validator pkg.
class RegisterIn(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=6, max_length=128)


class VerifyOtpIn(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    otp: str = Field(min_length=4, max_length=8)


class ResendOtpIn(BaseModel):
    email: str = Field(min_length=5, max_length=254)


class LoginIn(BaseModel):
    # `username` accepts either the chosen handle or the Gmail address.
    username: str
    password: str
    expected_role: Optional[str] = None       # "user" or "admin"


class LoginOut(BaseModel):
    token: str
    username: str
    role: str
    consent_required: bool = False
    intake_required: bool = False


class ConsentIn(BaseModel):
    accepted: bool


class IntakeIn(BaseModel):
    raw_text: str = Field(min_length=20)


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: Optional[str] = None      # None → start a new thread
    n_responses: Optional[int] = None
    temperature: Optional[float] = None


class ConversationRenameIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)


class ReviewIn(BaseModel):
    decision: str                              # approve / edit / reject
    chosen_idx: int = 0
    edited_response: str = ""
    edited_technique: str = ""
    rating: Optional[int] = None                # 1-5 for feedback
