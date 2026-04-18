from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/airlines", tags=["Airlines"])


@router.post("/", response_model=schemas.AirlineOut, status_code=status.HTTP_201_CREATED)
def create_airline(payload: schemas.AirlineCreate, db: Session = Depends(get_db)):
    if db.query(models.Airline).filter_by(AirlineID=payload.AirlineID).first():
        raise HTTPException(status_code=409, detail="Airline ID already exists")
    airline = models.Airline(**payload.model_dump())
    db.add(airline)
    db.commit()
    db.refresh(airline)
    return airline


@router.get("/", response_model=List[schemas.AirlineOut])
def list_airlines(db: Session = Depends(get_db)):
    return db.query(models.Airline).all()


@router.get("/{airline_id}", response_model=schemas.AirlineOut)
def get_airline(airline_id: str, db: Session = Depends(get_db)):
    a = db.query(models.Airline).filter_by(AirlineID=airline_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Airline not found")
    return a


@router.delete("/{airline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_airline(airline_id: str, db: Session = Depends(get_db)):
    a = db.query(models.Airline).filter_by(AirlineID=airline_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Airline not found")
    db.delete(a)
    db.commit()
