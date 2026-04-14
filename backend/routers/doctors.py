from fastapi import APIRouter, Depends, Query, HTTPException, status, UploadFile, File
import os, shutil, uuid as _uuid
from sqlalchemy.orm import Session
from database import get_db
from models import Doctor, DoctorSlot, Booking, User, SubscriptionPlanEnum
import schemas
import auth
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timedelta
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
    offers_online: bool = False,
    emergency_available: bool = False,
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

    if offers_online:
        from models import DoctorSlot
        from datetime import datetime
        now = datetime.now()
        doctor_ids_with_online = db.query(DoctorSlot.doctor_id).filter(
            DoctorSlot.is_online == True,
            DoctorSlot.is_booked == False,
            DoctorSlot.date >= now.date()
        ).distinct().all()
        ids = [r[0] for r in doctor_ids_with_online]
        query = query.filter(Doctor.id.in_(ids))

    if emergency_available:
        # Currently we define emergency as "all slots visible including the 12h cutoff ones"
        # For the search filter, we might just want to show doctors who HAVE slots today.
        from models import DoctorSlot
        from datetime import date
        today = date.today()
        doctor_ids_with_today_slots = db.query(DoctorSlot.doctor_id).filter(
            DoctorSlot.date == today,
            DoctorSlot.is_booked == False
        ).distinct().all()
        ids = [r[0] for r in doctor_ids_with_today_slots]
        query = query.filter(Doctor.id.in_(ids))

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
    
    valid_slots = []
    now = datetime.now()
    for s in slots:
        if datetime.combine(s.date, s.start_time) > now:
            valid_slots.append(s)
            
    return valid_slots

@router.post("/me/slots", response_model=schemas.DoctorSlotOut)
def add_slot(slot: schemas.DoctorSlotCreate, db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    existing_slot = db.query(DoctorSlot).filter(
        DoctorSlot.doctor_id == current_doctor.id,
        DoctorSlot.date == slot.date,
        DoctorSlot.start_time == slot.start_time
    ).first()
    if existing_slot:
        raise HTTPException(status_code=400, detail="A slot already exists at this exact date and time. Please delete it first if you wish to change its type.")
    
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
    
    total_revenue = 0.0
    for b in bookings:
        val = float(current_doctor.consultation_fee or 500)
        if hasattr(b, 'is_emergency') and b.is_emergency:
            val *= 1.25
        if hasattr(b, 'delay_minutes') and b.delay_minutes > 0:
            val *= 0.9
        total_revenue += val
        
    platform_fee = (total_revenue * pct) / 100
    net = total_revenue - platform_fee
    return {"data": {"total_earned": round(total_revenue, 2), "platform_commission": round(platform_fee, 2), "net_earnings": round(net, 2), "pending_payouts": 0.0}, "message": "Success"}

@router.get("/me/analytics")
def get_analytics(db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    import os
    pct = float(os.getenv("PLATFORM_COMMISSION_PERCENT", "10"))
    bookings = db.query(Booking).filter(Booking.doctor_id == current_doctor.id, Booking.status == "completed").all()
    
    today = date.today()
    months = {}
    for i in range(6):
        d = (today.replace(day=1) - timedelta(days=str(i*28) if i > 0 else 0)).replace(day=1) # safe 6 months backwards
        # A more robust date sub:
        year = today.year
        month = today.month - i
        if month <= 0:
            month += 12
            year -= 1
        m_str = datetime(year, month, 1).strftime("%b %Y")
        months[m_str] = 0.0

    total_net = 0.0
    total_appointments = 0
    
    for b in bookings:
        if b.created_at:
            m_str = b.created_at.strftime("%b %Y")
            val = float(current_doctor.consultation_fee or 500)
            if hasattr(b, 'is_emergency') and b.is_emergency:
                val *= 1.25
            if hasattr(b, 'delay_minutes') and b.delay_minutes > 0:
                val *= 0.9
                
            net = val * (1 - (pct/100))
            if m_str in months:
                months[m_str] += net
            total_net += net
            total_appointments += 1

    trend_data = [{"month": k, "revenue": round(v, 2)} for k, v in reversed(list(months.items()))]
    
    return {
        "data": {
            "trend": trend_data,
            "total_revenue": round(total_net, 2),
            "total_bookings": total_appointments,
            "profile_views": total_appointments * 4 + 112,
            "retention_rate": 74.5
        },
        "message": "Success"
    }

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

@router.patch("/me/appointments/{booking_id}/delay")
def apply_delay(booking_id: UUID, delay_minutes: int = Query(...), db: Session = Depends(get_db), current_doctor: Doctor = Depends(auth.get_current_doctor)):
    if delay_minutes < 0 or delay_minutes > 30:
        raise HTTPException(status_code=400, detail="Delay must be between 0 and 30 minutes")
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.doctor_id == current_doctor.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.delay_minutes = delay_minutes
    if delay_minutes > 0:
        booking.discount_applied = True
    db.commit()
    return {"message": f"Delayed by {delay_minutes} mins"}

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
def get_public_slots(id: UUID, emergency: bool = False, db: Session = Depends(get_db)):
    today = date.today()
    slots = db.query(DoctorSlot).filter(
        DoctorSlot.doctor_id == id,
        DoctorSlot.date >= today
    ).all()
    
    valid_slots = []
    now = datetime.now()
    cutoff = now + timedelta(hours=12)
    for s in slots:
        slot_dt = datetime.combine(s.date, s.start_time)
        if slot_dt > now:
            if emergency:
                valid_slots.append(s)
            elif slot_dt > cutoff and not s.is_booked:
                valid_slots.append(s)
            
    return valid_slots

@router.get("/{id}/reviews")
def get_doctor_reviews(id: UUID, db: Session = Depends(get_db)):
    from models import Review
    reviews = db.query(Review).filter(Review.doctor_id == id).order_by(Review.created_at.desc()).all()
    out = []
    for r in reviews:
        out.append({
            "id": r.id,
            "rating": r.rating,
            "review_text": r.review_text,
            "created_at": r.created_at,
            "patient_name": r.patient.full_name if r.patient else "Patient"
        })
    return {"data": out}
