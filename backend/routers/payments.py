from fastapi import APIRouter

router = APIRouter()
# Delegated most payment logic correctly to /bookings and /subscriptions.
# Keeping router available for pure webhooks and future standalone components!
