from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Booking
import schemas
import auth

router = APIRouter()

@router.get("/me", response_model=schemas.UserOut)
def get_profile(current_patient: User = Depends(auth.get_current_patient)):
    return current_patient

@router.put("/me", response_model=schemas.UserOut)
def update_profile(update_data: schemas.UserBase, db: Session = Depends(get_db), current_patient: User = Depends(auth.get_current_patient)):
    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(current_patient, key, value)
    db.commit()
    db.refresh(current_patient)
    return current_patient

@router.get("/me/bookings")
def get_bookings(db: Session = Depends(get_db), current_patient: User = Depends(auth.get_current_patient)):
    bookings = db.query(Booking).filter(Booking.patient_id == current_patient.id).all()
    out = []
    for b in bookings:
        out.append({"booking": b, "doctor": b.doctor, "slot": b.slot})
    return {"data": out, "message": "Success"}
