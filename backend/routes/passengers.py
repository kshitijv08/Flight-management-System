from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/passengers", tags=["Passengers"])


@router.post("/", response_model=schemas.PassengerOut, status_code=status.HTTP_201_CREATED)
def create_passenger(payload: schemas.PassengerCreate, db: Session = Depends(get_db)):
    if db.query(models.Passenger).filter_by(IdentificationID=payload.IdentificationID).first():
        raise HTTPException(status_code=409, detail="Identification ID already registered")
    if db.query(models.Passenger).filter_by(Email=payload.Email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    passenger = models.Passenger(**payload.model_dump())
    db.add(passenger)
    db.commit()
    db.refresh(passenger)
    return passenger


@router.get("/", response_model=List[schemas.PassengerOut])
def list_passengers(db: Session = Depends(get_db)):
    return db.query(models.Passenger).all()


@router.get("/{identification_id}", response_model=schemas.PassengerOut)
def get_passenger(identification_id: str, db: Session = Depends(get_db)):
    p = db.query(models.Passenger).filter_by(IdentificationID=identification_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return p


@router.patch("/{identification_id}", response_model=schemas.PassengerOut)
def update_passenger(identification_id: str, payload: schemas.PassengerUpdate, db: Session = Depends(get_db)):
    p = db.query(models.Passenger).filter_by(IdentificationID=identification_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Passenger not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{identification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_passenger(identification_id: str, db: Session = Depends(get_db)):
    p = db.query(models.Passenger).filter_by(IdentificationID=identification_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Passenger not found")
    db.delete(p)
    db.commit()


@router.get("/{identification_id}/bookings", response_model=List[schemas.BookingOut])
def get_passenger_bookings(identification_id: str, db: Session = Depends(get_db)):
    p = db.query(models.Passenger).filter_by(IdentificationID=identification_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return p.bookings
