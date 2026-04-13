from fastapi import APIRouter, Depends, Query, HTTPException, status, UploadFile, File
import os, shutil, uuid as _uuid
from sqlalchemy.orm import Session
from database import get_db
from models import Doctor, DoctorSlot, Booking, User, SubscriptionPlanEnum
import schemas
import auth
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
from math import radians, sin, cos, sqrt, asin

router = APIRouter()

def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlng/2)**2
    return R * 2 * asin(sqrt(a))

@router.get("/search")
def search_doctors(
    lat: float,
    lng: float,
    radius_km: float = 10.0,
    specialty: Optional[str] = None,
    query_str: Optional[str] = Query(None, alias="query"),
    sort_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Doctor).filter(Doctor.is_active == True)
    if specialty:
        query = query.filter(Doctor.specialization == specialty)
    if query_str:
        from sqlalchemy import or_
        search_filter = f"%{query_str}%"
        query = query.filter(or_(
            Doctor.full_name.ilike(search_filter),
            Doctor.clinic_address.ilike(search_filter)
        ))

    results = []
    for doc in query.all():
        if doc.clinic_lat and doc.clinic_lng:
            dist = haversine(lat, lng, doc.clinic_lat, doc.clinic_lng)
            if dist <= radius_km:
                results.append({"doctor": doc, "distance_km": round(dist, 2), "has_coords": True})
        else:
            # No coordinates — push to end with 9999 instead of faking 0.0
            results.append({"doctor": doc, "distance_km": 9999.0, "has_coords": False})

    plan_rank = {"enterprise": 0, "annual": 1, "quarterly": 2, "monthly": 3, "free": 4}

    if sort_by == "rating":
        results.sort(key=lambda x: x["doctor"].avg_rating or 0, reverse=True)
    elif sort_by == "fee":
        results.sort(key=lambda x: x["doctor"].consultation_fee or 0)
    elif sort_by == "experience":
        results.sort(key=lambda x: x["doctor"].experience_years or 0, reverse=True)
    else:
        # Default: nearest first, subscription plan as tiebreaker within same km bucket
        results.sort(key=lambda x: (
            x["distance_km"],
            plan_rank.get(x["doctor"].subscription_plan.value if x["doctor"].subscription_plan else "free", 4)
        ))
    
    out = []
    for r in results:
        doc_dict = r["doctor"].__dict__.copy()
        doc_dict.pop("_sa_instance_state", None)
        doc_dict["distance_km"] = r["distance_km"]
        out.append(doc_dict)
    
    return {"data": out, "message": "Success"}

@router.get("/me/slots", response_model=List[schemas.DoctorSlotOut])
def get_slots(db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    today = date.today()
    slots = db.query(DoctorSlot).filter(
        DoctorSlot.doctor_id == current_doctor.id,
        DoctorSlot.date >= today
    ).all()
    return slots

@router.post("/me/slots", response_model=schemas.DoctorSlotOut)
def add_slot(slot: schemas.DoctorSlotCreate, db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    new_slot = DoctorSlot(doctor_id=current_doctor.id, **slot.dict())
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    return new_slot

@router.delete("/me/slots/{slot_id}")
def delete_slot(slot_id: UUID, db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    slot = db.query(DoctorSlot).filter(DoctorSlot.id == slot_id, DoctorSlot.doctor_id == current_doctor.id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.is_booked:
        raise HTTPException(status_code=400, detail="Cannot delete a booked slot")
    db.delete(slot)
    db.commit()
    return {"message": "Deleted"}

@router.get("/me/appointments")
def get_appointments(db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    bookings = db.query(Booking).filter(Booking.doctor_id == current_doctor.id).all()
    out = []
    for b in bookings:
        out.append({"booking": b, "patient": b.patient, "slot": b.slot})
    return {"data": out, "message": "Success"}

@router.get("/me/earnings")
def get_earnings(db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    import os
    pct = float(os.getenv("PLATFORM_COMMISSION_PERCENT", "10"))
    bookings = db.query(Booking).filter(Booking.doctor_id == current_doctor.id, Booking.status == "completed").all()
    total = sum(float(b.doctor.consultation_fee) for b in bookings) if bookings else 0.0
    platform_fee = (total * pct) / 100
    net = total - platform_fee
    return {"data": {"total_earned": total, "platform_commission": platform_fee, "net_earnings": net}, "message": "Success"}

@router.patch("/me/appointments/{booking_id}/complete")
def complete_appointment(booking_id: UUID, db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.doctor_id == current_doctor.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "completed"
    db.commit()
    return {"message": "Completed"}

@router.patch("/me/appointments/{booking_id}/no_show")
def no_show_appointment(booking_id: UUID, db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.doctor_id == current_doctor.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "no_show"
    booking.payment_status = "forfeited"
    db.commit()
    return {"message": "No-show marked"}

@router.post("/me/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(auth.get_current_doctor)
):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG/WebP images are allowed.")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"doctor_{current_doctor.id}_{_uuid.uuid4().hex}.{ext}"
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    photo_url = f"/uploads/{filename}"
    current_doctor.profile_photo = photo_url
    db.commit()
    db.refresh(current_doctor)
    return {"profile_photo": photo_url, "message": "Photo updated successfully"}


@router.put("/me", response_model=schemas.DoctorOut)
def update_profile(
    update_data: schemas.DoctorUpdate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(auth.get_current_doctor)
):
    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(current_doctor, key, value)
    db.commit()
    db.refresh(current_doctor)
    return current_doctor

@router.get("/{id}", response_model=schemas.DoctorOut)
def get_doctor(id: UUID, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doc

@router.get("/{id}/slots", response_model=List[schemas.DoctorSlotOut])
def get_public_slots(id: UUID, db: Session = Depends(get_db)):
    today = date.today()
    slots = db.query(DoctorSlot).filter(
        DoctorSlot.doctor_id == id,
        DoctorSlot.date >= today
    ).all()
    return slots
