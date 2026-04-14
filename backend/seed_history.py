import os
import random
from uuid import uuid4
from datetime import datetime, timedelta, time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

from models import Doctor, User, DoctorSlot, Booking

load_dotenv(r".env")

engine = create_engine(os.getenv("DATABASE_URL"))
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def seed_history():
    doctors = db.query(Doctor).filter(Doctor.is_verified == True).all()
    patients = db.query(User).all()
    
    if not patients:
        print("No patients found. Create at least one user to seed history.")
        return

    print("Seeding past bookings/slots...")
    now = datetime.now()
    
    for doc in doctors:
        num_past = random.randint(15, 60)
        for _ in range(num_past):
            days_ago = random.randint(1, 150)
            past_date = (now - timedelta(days=days_ago)).date()
            hour = random.randint(9, 18)
            t_start = time(hour=hour, minute=0)
            t_end = time(hour=hour, minute=30)
            
            overlap = db.query(DoctorSlot).filter(
                DoctorSlot.doctor_id == doc.id,
                DoctorSlot.date == past_date,
                DoctorSlot.start_time == t_start
            ).first()
            
            if overlap: 
                continue
            
            slot = DoctorSlot(
                id=uuid4(),
                doctor_id=doc.id,
                date=past_date,
                start_time=t_start,
                end_time=t_end,
                is_booked=True,
                is_online=random.choice([True, False, False])
            )
            db.add(slot)
            
            patient = random.choice(patients)
            fee = float(doc.consultation_fee or 500)
            
            is_emergency = random.choice([True, False, False, False, False])
            if is_emergency:
                fee = fee * 1.25
                
            booking = Booking(
                id=uuid4(),
                patient_id=patient.id,
                doctor_id=doc.id,
                slot_id=slot.id,
                status="completed",
                payment_status="paid",
                advance_amount=int(fee * 0.3),
                is_emergency=is_emergency,
                delay_minutes=random.choice([0, 0, 0, 10, 15, 30])
            )
            db.add(booking)
        
    db.commit()
    print("Historical seeding complete!")

if __name__ == "__main__":
    seed_history()
