from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date

import models, schemas
from database import get_db

router = APIRouter(prefix="/flights", tags=["Flights"])


@router.post("/", response_model=schemas.FlightOut, status_code=status.HTTP_201_CREATED)
def create_flight(payload: schemas.FlightCreate, db: Session = Depends(get_db)):
    # Validate FKs
    if not db.query(models.Airline).filter_by(AirlineID=payload.AirlineID).first():
        raise HTTPException(status_code=404, detail="Airline not found")
    if not db.query(models.Aircraft).filter_by(AircraftID=payload.AircraftID).first():
        raise HTTPException(status_code=404, detail="Aircraft not found")
    if not db.query(models.Airport).filter_by(AirportCode=payload.DepartureAirport).first():
        raise HTTPException(status_code=404, detail="Departure airport not found")
    if not db.query(models.Airport).filter_by(AirportCode=payload.ArrivalAirport).first():
        raise HTTPException(status_code=404, detail="Arrival airport not found")
    if payload.DepartureAirport == payload.ArrivalAirport:
        raise HTTPException(status_code=400, detail="Departure and arrival airports must differ")
    if db.query(models.Flight).filter_by(FlightID=payload.FlightID).first():
        raise HTTPException(status_code=409, detail="Flight ID already exists")

    flight = models.Flight(**payload.model_dump())
    db.add(flight)
    db.commit()
    db.refresh(flight)
    return flight


@router.get("/", response_model=List[schemas.FlightOut])
def list_flights(
    from_airport: Optional[str]  = Query(None, description="Departure airport code"),
    to_airport:   Optional[str]  = Query(None, description="Arrival airport code"),
    travel_date:  Optional[date] = Query(None, description="Travel date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    List flights with optional filters.
    All three params are optional — pass none to get all flights.
    """
    q = db.query(models.Flight)
    if from_airport:
        q = q.filter(models.Flight.DepartureAirport == from_airport.upper())
    if to_airport:
        q = q.filter(models.Flight.ArrivalAirport == to_airport.upper())
    if travel_date:
        q = q.filter(func.date(models.Flight.DeptTime) == travel_date)
    return q.all()


@router.get("/{flight_id}", response_model=schemas.FlightOut)
def get_flight(flight_id: str, db: Session = Depends(get_db)):
    f = db.query(models.Flight).filter_by(FlightID=flight_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Flight not found")
    return f


@router.get("/{flight_id}/seats", summary="Get booked seats for a flight")
def get_booked_seats(flight_id: str, db: Session = Depends(get_db)):
    """Returns list of already-booked seat numbers for a flight."""
    f = db.query(models.Flight).filter_by(FlightID=flight_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Flight not found")
    booked = (
        db.query(models.Booking.SeatNo)
        .filter(
            models.Booking.FlightID == flight_id,
            models.Booking.Status != "Cancelled"
        )
        .all()
    )
    return {"flight_id": flight_id, "booked_seats": [r.SeatNo for r in booked]}


@router.delete("/{flight_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flight(flight_id: str, db: Session = Depends(get_db)):
    f = db.query(models.Flight).filter_by(FlightID=flight_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Flight not found")
    db.delete(f)
    db.commit()


@router.put("/{flight_id}", response_model=schemas.FlightOut)
def update_flight(flight_id: str, payload: schemas.FlightUpdate, db: Session = Depends(get_db)):
    f = db.query(models.Flight).filter_by(FlightID=flight_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Flight not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Validate FKs if they are being updated
    if "AirlineID" in update_data and update_data["AirlineID"] != f.AirlineID:
        if not db.query(models.Airline).filter_by(AirlineID=update_data["AirlineID"]).first():
            raise HTTPException(status_code=404, detail="Airline not found")
    if "AircraftID" in update_data and update_data["AircraftID"] != f.AircraftID:
        if not db.query(models.Aircraft).filter_by(AircraftID=update_data["AircraftID"]).first():
            raise HTTPException(status_code=404, detail="Aircraft not found")
    if "DepartureAirport" in update_data and update_data["DepartureAirport"] != f.DepartureAirport:
        if not db.query(models.Airport).filter_by(AirportCode=update_data["DepartureAirport"]).first():
            raise HTTPException(status_code=404, detail="Departure airport not found")
    if "ArrivalAirport" in update_data and update_data["ArrivalAirport"] != f.ArrivalAirport:
        if not db.query(models.Airport).filter_by(AirportCode=update_data["ArrivalAirport"]).first():
            raise HTTPException(status_code=404, detail="Arrival airport not found")

    # Check departure and arrival are different
    dep_airport = update_data.get("DepartureAirport", f.DepartureAirport)
    arr_airport = update_data.get("ArrivalAirport", f.ArrivalAirport)
    if dep_airport == arr_airport:
        raise HTTPException(status_code=400, detail="Departure and arrival airports must differ")

    # Apply updates
    for key, value in update_data.items():
        setattr(f, key, value)

    db.commit()
    db.refresh(f)
    return f
