from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/aircraft", tags=["Aircraft"])


@router.post("/", response_model=schemas.AircraftOut, status_code=status.HTTP_201_CREATED)
def create_aircraft(payload: schemas.AircraftCreate, db: Session = Depends(get_db)):
    if not db.query(models.Airline).filter_by(AirlineID=payload.AirlineID).first():
        raise HTTPException(status_code=404, detail="Airline not found")
    if db.query(models.Aircraft).filter_by(AircraftID=payload.AircraftID).first():
        raise HTTPException(status_code=409, detail="Aircraft ID already exists")
    aircraft = models.Aircraft(**payload.model_dump())
    db.add(aircraft)
    db.commit()
    db.refresh(aircraft)
    return aircraft


@router.get("/", response_model=List[schemas.AircraftOut])
def list_aircraft(db: Session = Depends(get_db)):
    return db.query(models.Aircraft).all()


@router.get("/{aircraft_id}", response_model=schemas.AircraftOut)
def get_aircraft(aircraft_id: str, db: Session = Depends(get_db)):
    a = db.query(models.Aircraft).filter_by(AircraftID=aircraft_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    return a


@router.delete("/{aircraft_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_aircraft(aircraft_id: str, db: Session = Depends(get_db)):
    a = db.query(models.Aircraft).filter_by(AircraftID=aircraft_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    db.delete(a)
    db.commit()
