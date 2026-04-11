from database import SessionLocal
from models import Admin, Doctor, DoctorSlot, User, Booking, SpecializationEnum, SubscriptionPlanEnum
from auth import get_password_hash
from datetime import date, time, timedelta

db = SessionLocal()

def seed_data():
    if db.query(Admin).first():
        print("Data already seeded.")
        return
        
    admin = Admin(
        email="admin@docto.in",
        password_hash=get_password_hash("Admin@123"),
        full_name="Super Admin"
    )
    db.add(admin)
    db.commit()
    
    spec_list = list(SpecializationEnum)
    for i in range(10):
        lat = 13.08 + (i * 0.01)
        lng = 80.27 + (i * 0.01)
        doc = Doctor(
            email=f"doc{i}@docto.in",
            password_hash=get_password_hash("Doc@123"),
            full_name=f"Dr. Test Doc {i}",
            specialization=spec_list[i % len(spec_list)],
            experience_years=i+5,
            consultation_fee=500 + i*100,
            clinic_name=f"Clinic {i}",
            clinic_lat=lat,
            clinic_lng=lng,
            is_verified=i < 5,
            subscription_plan=SubscriptionPlanEnum.free
        )
        db.add(doc)
    db.commit()
    print("Seeded successfully.")

if __name__ == "__main__":
    seed_data()
