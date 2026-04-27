from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from enum import Enum


# ── Enums ────────────────────────────────────────────────────────────────────

class GenderEnum(str, Enum):
    male   = "Male"
    female = "Female"
    other  = "Other"

class IDTypeEnum(str, Enum):
    passport        = "Passport"
    aadhar          = "Aadhar"
    driving_license = "Driving License"
    voter_id        = "Voter ID"

class StatusEnum(str, Enum):
    confirmed = "Confirmed"
    pending   = "Pending"
    cancelled = "Cancelled"

class ClassEnum(str, Enum):
    economy  = "Economy"
    business = "Business"
    first    = "First"

class PaymentMethodEnum(str, Enum):
    credit_card = "Credit Card"
    debit_card  = "Debit Card"
    upi         = "UPI"
    net_banking = "Net Banking"
    cash        = "Cash"


# ── Passenger ─────────────────────────────────────────────────────────────────

class PassengerCreate(BaseModel):
    IdentificationID: str
    IDType:           IDTypeEnum = IDTypeEnum.aadhar
    FirstName:        str
    LastName:         str
    Email:            EmailStr
    Phone:            str
    Age:              int
    Gender:           GenderEnum

    @field_validator("Age")
    @classmethod
    def age_positive(cls, v):
        if v <= 0:
            raise ValueError("Age must be positive")
        return v

class PassengerOut(PassengerCreate):
    class Config:
        from_attributes = True

class PassengerUpdate(BaseModel):
    IDType:    Optional[IDTypeEnum] = None
    FirstName: Optional[str]        = None
    LastName:  Optional[str]        = None
    Email:     Optional[EmailStr]   = None
    Phone:     Optional[str]        = None
    Age:       Optional[int]        = None
    Gender:    Optional[GenderEnum] = None


class PassengerLogin(BaseModel):
    username: str
    password: str


# ── Airline ───────────────────────────────────────────────────────────────────

class AirlineCreate(BaseModel):
    AirlineID:   str
    AirlineName: str
    Owner:       str

class AirlineOut(AirlineCreate):
    class Config:
        from_attributes = True


# ── Airport ───────────────────────────────────────────────────────────────────

class AirportCreate(BaseModel):
    AirportCode: str
    AirportName: str
    City:        str
    Country:     str
    Terminal:    Optional[str] = None

class AirportOut(AirportCreate):
    class Config:
        from_attributes = True


# ── Aircraft ──────────────────────────────────────────────────────────────────

class AircraftCreate(BaseModel):
    AircraftID: str
    Model:      str
    Capacity:   int
    AirlineID:  str

    @field_validator("Capacity")
    @classmethod
    def capacity_positive(cls, v):
        if v <= 0:
            raise ValueError("Capacity must be positive")
        return v

class AircraftOut(AircraftCreate):
    class Config:
        from_attributes = True


# ── Flight ────────────────────────────────────────────────────────────────────

class FlightCreate(BaseModel):
    FlightID:         str
    DeptTime:         datetime
    ArrivalTime:      datetime
    Cost:             Decimal
    AirlineID:        str
    AircraftID:       str
    DepartureAirport: str
    ArrivalAirport:   str

    @field_validator("ArrivalTime")
    @classmethod
    def arrival_after_departure(cls, v, info):
        dept = info.data.get("DeptTime")
        if dept and v <= dept:
            raise ValueError("ArrivalTime must be after DeptTime")
        return v

class FlightOut(BaseModel):
    FlightID:         str
    DeptTime:         datetime
    ArrivalTime:      datetime
    Cost:             Decimal
    AirlineID:        str
    AircraftID:       str
    DepartureAirport: str
    ArrivalAirport:   str

    class Config:
        from_attributes = True


# ── CoPassenger ───────────────────────────────────────────────────────────────

class CoPassengerCreate(BaseModel):
    FirstName:        str
    LastName:         str
    IdentificationID: str
    IDType:           IDTypeEnum = IDTypeEnum.aadhar
    Age:              int
    Gender:           GenderEnum
    Class:            ClassEnum
    SeatNo:           str

    @field_validator("Age")
    @classmethod
    def age_positive(cls, v):
        if v <= 0:
            raise ValueError("Age must be positive")
        return v

class CoPassengerOut(CoPassengerCreate):
    CoPassengerID: int
    BookingID:     int

    class Config:
        from_attributes = True


# ── Booking ───────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    BookingDate:      date
    SeatNo:           str
    Class:            ClassEnum = ClassEnum.economy
    Status:           StatusEnum = StatusEnum.pending
    FlightID:         str
    IdentificationID: str
    co_passengers:    List[CoPassengerCreate] = []

class BookingOut(BaseModel):
    BookingID:        int
    BookingDate:      date
    SeatNo:           str
    Class:            ClassEnum
    Status:           StatusEnum
    FlightID:         str
    IdentificationID: str
    co_passengers:    List[CoPassengerOut] = []

    class Config:
        from_attributes = True

class BookingStatusUpdate(BaseModel):
    Status: StatusEnum


# ── Payment ───────────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    Amount:      Decimal
    Method:      PaymentMethodEnum
    PaymentDate: date
    BookingID:   int

    @field_validator("Amount")
    @classmethod
    def amount_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v

class PaymentOut(PaymentCreate):
    PaymentID: int

    class Config:
        from_attributes = True
