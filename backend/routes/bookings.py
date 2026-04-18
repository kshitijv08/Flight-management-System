from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/", response_model=schemas.BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(payload: schemas.BookingCreate, db: Session = Depends(get_db)):
    # FK checks
    if not db.query(models.Flight).filter_by(FlightID=payload.FlightID).first():
        raise HTTPException(status_code=404, detail="Flight not found")
    if not db.query(models.Passenger).filter_by(IdentificationID=payload.IdentificationID).first():
        raise HTTPException(status_code=404, detail="Passenger not found")

    # Seat availability check
    seat_taken = db.query(models.Booking).filter(
        models.Booking.FlightID == payload.FlightID,
        models.Booking.SeatNo   == payload.SeatNo,
        models.Booking.Status   != "Cancelled"
    ).first()
    if seat_taken:
        raise HTTPException(status_code=409, detail=f"Seat {payload.SeatNo} is already booked on this flight")

    # Create booking
    booking_data = payload.model_dump(exclude={"co_passengers"})
    booking = models.Booking(**booking_data)
    db.add(booking)
    db.flush()  # get BookingID before commit

    # Add co-passengers
    for cp in payload.co_passengers:
        co = models.CoPassenger(**cp.model_dump(), BookingID=booking.BookingID)
        db.add(co)

    db.commit()
    db.refresh(booking)
    return booking


@router.get("/", response_model=List[schemas.BookingOut])
def list_bookings(db: Session = Depends(get_db)):
    return db.query(models.Booking).all()


@router.get("/{booking_id}", response_model=schemas.BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    b = db.query(models.Booking).filter_by(BookingID=booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return b


@router.patch("/{booking_id}/status", response_model=schemas.BookingOut)
def update_booking_status(booking_id: int, payload: schemas.BookingStatusUpdate, db: Session = Depends(get_db)):
    b = db.query(models.Booking).filter_by(BookingID=booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    b.Status = payload.Status
    db.commit()
    db.refresh(b)
    return b


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    b = db.query(models.Booking).filter_by(BookingID=booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(b)
    db.commit()


# ── Co-passenger sub-routes ──────────────────────────────────────────────────

@router.get("/{booking_id}/co-passengers", response_model=List[schemas.CoPassengerOut])
def list_co_passengers(booking_id: int, db: Session = Depends(get_db)):
    b = db.query(models.Booking).filter_by(BookingID=booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return b.co_passengers


@router.post("/{booking_id}/co-passengers", response_model=schemas.CoPassengerOut, status_code=status.HTTP_201_CREATED)
def add_co_passenger(booking_id: int, payload: schemas.CoPassengerCreate, db: Session = Depends(get_db)):
    b = db.query(models.Booking).filter_by(BookingID=booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    co = models.CoPassenger(**payload.model_dump(), BookingID=booking_id)
    db.add(co)
    db.commit()
    db.refresh(co)
    return co


@router.delete("/{booking_id}/co-passengers/{co_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_co_passenger(booking_id: int, co_id: int, db: Session = Depends(get_db)):
    co = db.query(models.CoPassenger).filter_by(CoPassengerID=co_id, BookingID=booking_id).first()
    if not co:
        raise HTTPException(status_code=404, detail="Co-passenger not found")
    db.delete(co)
    db.commit()
