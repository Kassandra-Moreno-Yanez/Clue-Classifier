from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.case import Case
from app.schemas.case import CaseCreate, CaseResponse
from app.services.report_service import build_report

router = APIRouter()


# Create a case.
@router.post("/cases", response_model=CaseResponse, status_code=201)
def create_case(payload: CaseCreate, db: Session = Depends(get_db)):
    case = Case(title=payload.title, description=payload.description)
    db.add(case)
    db.commit()
    db.refresh(case)  # reload it so we get the id the database assigned
    return case


# List all cases, newest first.
@router.get("/cases", response_model=list[CaseResponse])
def list_cases(db: Session = Depends(get_db)):
    return db.query(Case).order_by(Case.id.desc()).all()


# Get one case by its id.
@router.get("/cases/{case_id}", response_model=CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.get(Case, case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


# The full case report in one response: evidence grouped by category,
# comparisons, links, web findings, and the connections graph.
@router.get("/cases/{case_id}/report")
def case_report(case_id: int, db: Session = Depends(get_db)):
    case = db.get(Case, case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return build_report(db, case)
