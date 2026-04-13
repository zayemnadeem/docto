from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import schemas, models, auth
from datetime import timedelta
import os

router = APIRouter()

@router.post("/register/patient", response_model=schemas.UserOut)
def register_patient(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        phone=user.phone,
        profile_photo=user.profile_photo
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/register/doctor", response_model=schemas.DoctorOut)
def register_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = db.query(models.Doctor).filter(models.Doctor.email == doctor.email).first()
    if db_doctor:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    lat = doctor.clinic_lat
    lng = doctor.clinic_lng
    # Geocoding will be done via Google Geocoding API once key is configured
    # (clinic_lat/clinic_lng will be sent from frontend when available)

    hashed_password = auth.get_password_hash(doctor.password)
    new_doctor = models.Doctor(
        email=doctor.email,
        password_hash=hashed_password,
        full_name=doctor.full_name,
        phone=doctor.phone,
        specialization=doctor.specialization,
        qualifications=doctor.qualifications,
        experience_years=doctor.experience_years,
        consultation_fee=doctor.consultation_fee,
        clinic_name=doctor.clinic_name,
        clinic_address=doctor.clinic_address,
        clinic_lat=lat,
        clinic_lng=lng,
        bio=doctor.bio,
        profile_photo=doctor.profile_photo,
        is_verified=False
    )
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return new_doctor

@router.post("/login", response_model=schemas.Token)
def login(login_req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = None
    role = None
    
    patient = db.query(models.User).filter(models.User.email == login_req.email).first()
    if patient and auth.verify_password(login_req.password, patient.password_hash):
        user = patient
        role = "patient"
    else:
        doctor = db.query(models.Doctor).filter(models.Doctor.email == login_req.email).first()
        if doctor and auth.verify_password(login_req.password, doctor.password_hash):
            if not doctor.is_active:
                raise HTTPException(status_code=400, detail="Doctor account is not active")
            user = doctor
            role = "doctor"
        else:
            admin = db.query(models.Admin).filter(models.Admin.email == login_req.email).first()
            if admin and auth.verify_password(login_req.password, admin.password_hash):
                user = admin
                role = "admin"
                
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id), "role": role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": role, "user_id": user.id}

@router.get("/me")
def get_me(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db)):
    user, role = auth.get_current_user_logic(token, db)
    # Return specific dict
    return {"user": user, "role": role}
