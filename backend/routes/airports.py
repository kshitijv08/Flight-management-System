from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/airports", tags=["Airports"])


@router.post("/", response_model=schemas.AirportOut, status_code=status.HTTP_201_CREATED)
def create_airport(payload: schemas.AirportCreate, db: Session = Depends(get_db)):
    if db.query(models.Airport).filter_by(AirportCode=payload.AirportCode).first():
        raise HTTPException(status_code=409, detail="Airport code already exists")
    airport = models.Airport(**payload.model_dump())
    db.add(airport)
    db.commit()
    db.refresh(airport)
    return airport


@router.get("/", response_model=List[schemas.AirportOut])
def list_airports(db: Session = Depends(get_db)):
    return db.query(models.Airport).all()


@router.get("/{airport_code}", response_model=schemas.AirportOut)
def get_airport(airport_code: str, db: Session = Depends(get_db)):
    a = db.query(models.Airport).filter_by(AirportCode=airport_code.upper()).first()
    if not a:
        raise HTTPException(status_code=404, detail="Airport not found")
    return a


@router.delete("/{airport_code}", status_code=status.HTTP_204_NO_CONTENT)
def delete_airport(airport_code: str, db: Session = Depends(get_db)):
    a = db.query(models.Airport).filter_by(AirportCode=airport_code.upper()).first()
    if not a:
        raise HTTPException(status_code=404, detail="Airport not found")
    db.delete(a)
    db.commit()
