"""
Screening API — periodic PHQ-9 / GAD-7 mental health check-ins.
Users can submit results multiple times; history is returned newest-first.
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core import auth
from app.db import models
from app.db.session import get_db

router = APIRouter(prefix="/api")


def _phq9_level(score: int) -> str:
    if score <= 4:  return "normal"
    if score <= 9:  return "mild"
    if score <= 14: return "moderate"
    if score <= 19: return "moderately_severe"
    return "severe"


def _gad7_level(score: int) -> str:
    if score <= 4:  return "normal"
    if score <= 9:  return "mild"
    if score <= 14: return "moderate"
    return "severe"


LEVEL_VN = {
    "normal":             "Bình thường",
    "mild":               "Nhẹ",
    "moderate":           "Vừa phải",
    "moderately_severe":  "Trung bình nặng",
    "severe":             "Nặng",
}


class ScreeningIn(BaseModel):
    phq9_answers: Optional[List[int]] = Field(None, description="9 answers, each 0-3")
    gad7_answers: Optional[List[int]] = Field(None, description="7 answers, each 0-3")
    mood_score:   Optional[int]       = Field(None, ge=1, le=10)
    notes:        Optional[str]       = None


class ScreeningOut(BaseModel):
    id:            str
    created_at:    datetime
    phq9_score:    Optional[int]
    phq9_level:    Optional[str]
    phq9_level_vn: Optional[str]
    gad7_score:    Optional[int]
    gad7_level:    Optional[str]
    gad7_level_vn: Optional[str]
    mood_score:    Optional[int]
    notes:         Optional[str]


def _to_out(s: models.Screening) -> ScreeningOut:
    return ScreeningOut(
        id=str(s.id),
        created_at=s.created_at,
        phq9_score=s.phq9_score,
        phq9_level=s.phq9_level,
        phq9_level_vn=LEVEL_VN.get(s.phq9_level or "", None),
        gad7_score=s.gad7_score,
        gad7_level=s.gad7_level,
        gad7_level_vn=LEVEL_VN.get(s.gad7_level or "", None),
        mood_score=s.mood_score,
        notes=s.notes,
    )


@router.post("/screening", response_model=ScreeningOut)
def submit_screening(
    body: ScreeningIn,
    user: dict = Depends(auth.current_user),
    db: Session = Depends(get_db),
):
    phq9_score = None
    phq9_level = None
    if body.phq9_answers:
        if len(body.phq9_answers) != 9:
            raise HTTPException(400, "phq9_answers must have exactly 9 items")
        if any(v not in range(4) for v in body.phq9_answers):
            raise HTTPException(400, "phq9_answers values must be 0-3")
        phq9_score = sum(body.phq9_answers)
        phq9_level = _phq9_level(phq9_score)

    gad7_score = None
    gad7_level = None
    if body.gad7_answers:
        if len(body.gad7_answers) != 7:
            raise HTTPException(400, "gad7_answers must have exactly 7 items")
        if any(v not in range(4) for v in body.gad7_answers):
            raise HTTPException(400, "gad7_answers values must be 0-3")
        gad7_score = sum(body.gad7_answers)
        gad7_level = _gad7_level(gad7_score)

    row = models.Screening(
        user_id=user["uid"],
        phq9_score=phq9_score,
        phq9_answers=body.phq9_answers,
        gad7_score=gad7_score,
        gad7_answers=body.gad7_answers,
        phq9_level=phq9_level,
        gad7_level=gad7_level,
        mood_score=body.mood_score,
        notes=body.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _to_out(row)


@router.get("/screening/history", response_model=List[ScreeningOut])
def get_screening_history(
    limit: int = 20,
    user: dict = Depends(auth.current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.Screening)
        .filter_by(user_id=user["uid"])
        .order_by(models.Screening.created_at.desc())
        .limit(limit)
        .all()
    )
    return [_to_out(r) for r in rows]


@router.get("/screening/latest", response_model=Optional[ScreeningOut])
def get_latest_screening(
    user: dict = Depends(auth.current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(models.Screening)
        .filter_by(user_id=user["uid"])
        .order_by(models.Screening.created_at.desc())
        .first()
    )
    return _to_out(row) if row else None
