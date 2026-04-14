import os, random, uuid
from decimal import Decimal
from datetime import datetime, date, timedelta
import datetime as dt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import bcrypt

from dotenv import load_dotenv
load_dotenv(r".env")

from models import User, Doctor, DoctorSlot, Booking, Review, BookingStatusEnum, PaymentStatusEnum

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

db = SessionLocal()
pwd_hash = get_hash("password123")

# 1. Create 15 Fake Patients
patient_names = ["Arun Mohan", "Kavita Rao", "Deepak Kumar", "Sunita Sharma", "Vinay R", "Pooja Hegde", "Sanjay Das", "Akhil P", "Sneha K", "Gautam V", "Ravi Teja", "Nisha S", "Ajith K", "Pramod B", "Vaishnavi M"]

users = []
for p_name in patient_names:
    email = f"{p_name.replace(' ', '').lower()}@gmail.com"
    u = db.query(User).filter(User.email == email).first()
    if not u:
        u = User(id=uuid.uuid4(), email=email, password_hash=pwd_hash, full_name=p_name, is_active=True, created_at=datetime.now())
        db.add(u)
    users.append(u)
        
db.commit()

# 2. Add reviews for all doctors
review_texts_4_5 = [
    "Excellent doctor. Very patient and explained everything clearly.",
    "Highly recommended! The clinic was very clean and staff was polite.",
    "Had a great experience. Dr listened to all my concerns.",
    "Wait time was short and the treatment was very effective.",
    "Very professional approach and proper medication was provided.",
    "Thorough examination and gave great advice. Feeling much better.",
]
review_texts_3 = [
    "Doctor is good but wait time was quite long.",
    "Average experience. Communication could be better.",
    "Fine for regular visits but felt rushed.",
]

doctors = db.query(Doctor).all()
for d in doctors:
    num_reviews = random.randint(2, 6)
    total_rating = 0
    
    for i in range(num_reviews):
        past_date = date.today() - timedelta(days=random.randint(1, 60))
        start_t = dt.time(10, 0)
        end_t = dt.time(10, 30)
        
        slot = DoctorSlot(id=uuid.uuid4(), doctor_id=d.id, date=past_date, start_time=start_t, end_time=end_t, is_booked=True)
        db.add(slot)
        
        random_patient = random.choice(users)
        booking = Booking(
            id=uuid.uuid4(),
            patient_id=random_patient.id,
            doctor_id=d.id,
            slot_id=slot.id,
            status=BookingStatusEnum.completed,
            advance_amount=d.consultation_fee * Decimal('0.3') if d.consultation_fee else 100,
            payment_status=PaymentStatusEnum.paid,
        )
        db.add(booking)
        
        is_good = random.random() > 0.3
        rating = random.randint(4, 5) if is_good else random.randint(1, 3)
        total_rating += rating
        
        text = random.choice(review_texts_4_5) if is_good else random.choice(review_texts_3)
        
        rev = Review(
            id=uuid.uuid4(),
            patient_id=random_patient.id,
            doctor_id=d.id,
            booking_id=booking.id,
            rating=rating,
            review_text=text,
            created_at=datetime.now() - timedelta(days=random.randint(0, 30))
        )
        db.add(rev)
        
    d.total_reviews = num_reviews
    d.avg_rating = round(total_rating / num_reviews, 1)

db.commit()
print("Success: Generated users, slots, bookings, and reviews for all doctors.")
