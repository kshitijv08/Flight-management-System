from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=schemas.PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(payload: schemas.PaymentCreate, db: Session = Depends(get_db)):
    # Check booking exists
    booking = db.query(models.Booking).filter_by(BookingID=payload.BookingID).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # 1 booking : 1 payment
    if db.query(models.Payment).filter_by(BookingID=payload.BookingID).first():
        raise HTTPException(status_code=409, detail="Payment already exists for this booking")

    payment = models.Payment(**payload.model_dump())
    db.add(payment)

    # Auto-confirm booking on payment
    booking.Status = "Confirmed"

    db.commit()
    db.refresh(payment)
    return payment


@router.get("/", response_model=List[schemas.PaymentOut])
def list_payments(db: Session = Depends(get_db)):
    return db.query(models.Payment).all()


@router.get("/{payment_id}", response_model=schemas.PaymentOut)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Payment).filter_by(PaymentID=payment_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    return p


@router.get("/booking/{booking_id}", response_model=schemas.PaymentOut)
def get_payment_by_booking(booking_id: int, db: Session = Depends(get_db)):
    """Fetch the payment record for a specific booking."""
    p = db.query(models.Payment).filter_by(BookingID=booking_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="No payment found for this booking")
    return p


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Payment).filter_by(PaymentID=payment_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(p)
    db.commit()
