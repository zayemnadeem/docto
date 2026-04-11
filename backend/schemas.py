from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time, datetime
from uuid import UUID
from models import SpecializationEnum, SubscriptionPlanEnum, BookingStatusEnum, PaymentStatusEnum

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: UUID

class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    profile_photo: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

class DoctorBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    specialization: Optional[SpecializationEnum] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_lat: Optional[float] = None
    clinic_lng: Optional[float] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None

class DoctorCreate(DoctorBase):
    password: str

class DoctorOut(DoctorBase):
    id: UUID
    is_verified: bool
    is_active: bool
    subscription_plan: SubscriptionPlanEnum
    subscription_expires_at: Optional[datetime]
    avg_rating: float
    total_reviews: int
    created_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

class DoctorUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[SpecializationEnum] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_lat: Optional[float] = None
    clinic_lng: Optional[float] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None

class DoctorSlotBase(BaseModel):
    date: date
    start_time: time
    end_time: time

class DoctorSlotCreate(DoctorSlotBase):
    pass

class DoctorSlotOut(DoctorSlotBase):
    id: UUID
    doctor_id: UUID
    is_booked: bool
    created_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

class BookingBase(BaseModel):
    doctor_id: UUID
    slot_id: UUID

class BookingCreate(BookingBase):
    pass

class BookingOut(BookingBase):
    id: UUID
    patient_id: UUID
    status: BookingStatusEnum
    advance_amount: float
    payment_id: Optional[str] = None
    payment_status: PaymentStatusEnum
    cancellation_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

class BookingDetailOut(BookingOut):
    doctor: DoctorOut
    slot: DoctorSlotOut
    class Config:
        orm_mode = True
        from_attributes = True

class ReviewBase(BaseModel):
    rating: int
    review_text: Optional[str] = None

class ReviewCreate(ReviewBase):
    booking_id: UUID

class ReviewOut(ReviewBase):
    id: UUID
    patient_id: UUID
    doctor_id: UUID
    booking_id: UUID
    created_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

class SubscriptionOut(BaseModel):
    id: UUID
    doctor_id: UUID
    plan: SubscriptionPlanEnum
    amount_paid: float
    started_at: datetime
    expires_at: Optional[datetime] = None
    class Config:
        orm_mode = True
        from_attributes = True

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class AdminOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    created_at: datetime
    class Config:
        orm_mode = True
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RazorpayOrderOut(BaseModel):
    order_id: str
    amount: int
    currency: str
    booking_id: UUID
