import os
import random
import uuid
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import bcrypt

from dotenv import load_dotenv
load_dotenv(r".env")

from models import Doctor, SpecializationEnum, SubscriptionPlanEnum

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

first_names = ["Ramesh", "Suresh", "Priya", "Anjali", "Karthik", "Sneha", "Arjun", "Neha", "Vignesh", "Meenakshi", "Prakash", "Swathi", "Ashwin", "Deepa", "Rahul", "Nandini", "Vikram", "Kavya", "Siddharth", "Divya", "Ganesh", "Aishwarya", "Manoj", "Shalini", "Pradeep", "Vidya", "Bharath", "Preethi", "Senthil", "Lakshmi", "Rajesh", "Gowri", "Dinesh", "Kritika", "Arun", "Sruthi", "Vinod", "Harini", "Sivakumar", "Vaishnavi"]
last_names = ["Kumar", "Sharma", "Iyer", "Nair", "Reddy", "Menon", "Rao", "Pillai", "Krishnan", "Sundaram", "Rajan", "Srinivasan", "Venkatesh", "Balaji", "Natarajan", "Gopal", "Ramachandran", "Parthasarathy"]

clinic_bases = ["Health Care Clinic", "Specialty Hospital", "Care Center", "Family Clinic", "Apollo Center", "MedPlus Clinic", "CureWell Hospital", "LifeLine Care", "Global Health", "Prime Care"]
areas = ["Adyar", "Velachery", "T Nagar", "Anna Nagar", "OMR", "Chromepet", "Tambaram", "Mylapore", "Besant Nagar", "Nungambakkam", "Mogappair", "Porur", "Guindy", "Thiruvanmiyur"]

specializations = list(SpecializationEnum)
plans = list(SubscriptionPlanEnum)

db = SessionLocal()
pwd_hash = get_hash("password123")

all_docs = []
for i in range(60):
    fn = random.choice(first_names)
    ln = random.choice(last_names)
    full_name = f"Dr. {fn} {ln}"
    email = f"dr.{fn.lower()}.{ln.lower()}{i}@clinic.in"
    phone = "9" + "".join([str(random.randint(0, 9)) for _ in range(9)])
    specialty = specializations[i % len(specializations)]
    plan = plans[i % len(plans)]
    
    exp = random.randint(2, 35)
    fee = random.randint(6, 40) * 50.0  # 300 to 2000
    
    clinic = f"{fn} {random.choice(clinic_bases)}"
    area = random.choice(areas)
    address = f"{random.randint(1, 100)}, Main Road, {area}, Chennai"
    
    lat = 12.9 + random.random() * 0.25  # 12.9 to 13.15
    lng = 80.15 + random.random() * 0.13 # 80.15 to 80.28
    
    quals = "MBBS"
    if specialty.value == "Dentist": quals = "BDS, MDS"
    elif specialty.value == "Surgeon": quals = "MBBS, MS"
    else: quals = "MBBS, MD"
    
    doc = Doctor(
        id=uuid.uuid4(),
        email=email,
        password_hash=pwd_hash,
        full_name=full_name,
        phone=phone,
        specialization=specialty,
        qualifications=quals,
        experience_years=exp,
        consultation_fee=fee,
        clinic_name=clinic,
        clinic_address=address,
        clinic_lat=lat,
        clinic_lng=lng,
        bio=f"Dr. {fn} {ln} is a highly experienced {specialty.value} practicing in {area}, Chennai, with a commitment to providing excellent patient care.",
        is_verified=True,
        is_active=True,
        subscription_plan=plan,
        avg_rating=round(random.uniform(3.5, 5.0), 1),
        total_reviews=random.randint(10, 500),
        created_at=datetime.now()
    )
    all_docs.append(doc)

db.add_all(all_docs)
db.commit()
print("Success: Inserted 60 doctors.")
