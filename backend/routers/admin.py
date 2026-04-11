from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Admin, Doctor, Booking, User
import schemas
import auth
from uuid import UUID

router = APIRouter()

@router.post("/register", response_model=schemas.AdminOut)
def register_admin(admin: schemas.AdminCreate, db: Session = Depends(get_db)):
    hashed_password = auth.get_password_hash(admin.password)
    new_admin = Admin(email=admin.email, password_hash=hashed_password, full_name=admin.full_name)
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin

@router.get("/doctors/pending")
def pending_doctors(db: Session = Depends(get_db), current_admin: Admin = Depends(auth.get_current_admin)):
    docs = db.query(Doctor).filter(Doctor.is_verified == False).all()
    return {"data": docs, "message": "Success"}

@router.patch("/doctors/{id}/verify")
def verify_doctor(id: UUID, db: Session = Depends(get_db), current_admin: Admin = Depends(auth.get_current_admin)):
    doc = db.query(Doctor).filter(Doctor.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doc.is_verified = True
    db.commit()
    return {"message": "Doctor verified"}

@router.patch("/doctors/{id}/reject")
def reject_doctor(id: UUID, db: Session = Depends(get_db), current_admin: Admin = Depends(auth.get_current_admin)):
    doc = db.query(Doctor).filter(Doctor.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doc.is_active = False
    doc.is_verified = False
    db.commit()
    return {"message": "Doctor rejected"}

@router.get("/bookings")
def all_bookings(db: Session = Depends(get_db), current_admin: Admin = Depends(auth.get_current_admin)):
    bks = db.query(Booking).all()
    out = []
    for b in bks:
        out.append({"booking": b, "patient": b.patient.email, "doctor": b.doctor.email})
    return {"data": out, "message": "Success"}

@router.get("/users")
def all_users(db: Session = Depends(get_db), current_admin: Admin = Depends(auth.get_current_admin)):
    users = db.query(User).all()
    return {"data": users, "message": "Success"}

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_admin: Admin = Depends(auth.get_current_admin)):
    from datetime import date
    total_docs = db.query(Doctor).count()
    pending_docs = db.query(Doctor).filter(Doctor.is_verified == False).count()
    today_bookings = db.query(Booking).filter(db.func.date(Booking.created_at) == date.today()).count()
    return {
        "data": {
            "total_doctors": total_docs,
            "pending_verifications": pending_docs,
            "bookings_today": today_bookings,
        },
        "message": "Success"
    }
