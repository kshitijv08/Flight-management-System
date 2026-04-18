from sqlalchemy import (
    Column, String, Integer, Enum, Date, DateTime,
    Numeric, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from database import Base


class Passenger(Base):
    __tablename__ = "PASSENGER"

    IdentificationID = Column(String(20), primary_key=True)
    IDType           = Column(Enum("Passport", "Aadhar", "Driving License", "Voter ID"), nullable=False, default="Aadhar")
    FirstName        = Column(String(50),  nullable=False)
    LastName         = Column(String(50),  nullable=False)
    Email            = Column(String(100), nullable=False, unique=True)
    Phone            = Column(String(15),  nullable=False)
    Age              = Column(Integer,     nullable=False)
    Gender           = Column(Enum("Male", "Female", "Other"), nullable=False)

    bookings = relationship("Booking", back_populates="passenger")


class Airline(Base):
    __tablename__ = "AIRLINE"

    AirlineID   = Column(String(10),  primary_key=True)
    AirlineName = Column(String(100), nullable=False)
    Owner       = Column(String(100), nullable=False)

    aircraft = relationship("Aircraft", back_populates="airline")
    flights  = relationship("Flight",   back_populates="airline")


class Airport(Base):
    __tablename__ = "AIRPORT"

    AirportCode = Column(String(3),   primary_key=True)
    AirportName = Column(String(150), nullable=False)
    City        = Column(String(100), nullable=False)
    Country     = Column(String(100), nullable=False)
    Terminal    = Column(String(10))

    departing_flights = relationship(
        "Flight", foreign_keys="Flight.DepartureAirport", back_populates="departure_airport"
    )
    arriving_flights = relationship(
        "Flight", foreign_keys="Flight.ArrivalAirport", back_populates="arrival_airport"
    )


class Aircraft(Base):
    __tablename__ = "AIRCRAFT"

    AircraftID = Column(String(20),  primary_key=True)
    Model      = Column(String(100), nullable=False)
    Capacity   = Column(Integer,     nullable=False)
    AirlineID  = Column(String(10),  ForeignKey("AIRLINE.AirlineID", onupdate="CASCADE"), nullable=False)

    airline = relationship("Airline", back_populates="aircraft")
    flights = relationship("Flight",  back_populates="aircraft")


class Flight(Base):
    __tablename__ = "FLIGHT"

    FlightID         = Column(String(10),     primary_key=True)
    DeptTime         = Column(DateTime,       nullable=False)
    ArrivalTime      = Column(DateTime,       nullable=False)
    Cost             = Column(Numeric(10, 2), nullable=False)
    AirlineID        = Column(String(10),     ForeignKey("AIRLINE.AirlineID",   onupdate="CASCADE"), nullable=False)
    AircraftID       = Column(String(20),     ForeignKey("AIRCRAFT.AircraftID", onupdate="CASCADE"), nullable=False)
    DepartureAirport = Column(String(3),      ForeignKey("AIRPORT.AirportCode", onupdate="CASCADE"), nullable=False)
    ArrivalAirport   = Column(String(3),      ForeignKey("AIRPORT.AirportCode", onupdate="CASCADE"), nullable=False)

    airline           = relationship("Airline",  back_populates="flights")
    aircraft          = relationship("Aircraft", back_populates="flights")
    departure_airport = relationship("Airport",  foreign_keys=[DepartureAirport], back_populates="departing_flights")
    arrival_airport   = relationship("Airport",  foreign_keys=[ArrivalAirport],   back_populates="arriving_flights")
    bookings          = relationship("Booking",  back_populates="flight")


class Booking(Base):
    __tablename__ = "BOOKING"
    __table_args__ = (
        UniqueConstraint("FlightID", "SeatNo", name="uq_flight_seat"),
    )

    BookingID        = Column(Integer,    primary_key=True, autoincrement=True)
    BookingDate      = Column(Date,       nullable=False)
    SeatNo           = Column(String(5),  nullable=False)
    Status           = Column(Enum("Confirmed", "Pending", "Cancelled"), nullable=False, default="Pending")
    Class            = Column(Enum("Economy", "Business", "First"),       nullable=False, default="Economy")
    FlightID         = Column(String(10), ForeignKey("FLIGHT.FlightID",              onupdate="CASCADE"), nullable=False)
    IdentificationID = Column(String(20), ForeignKey("PASSENGER.IdentificationID",   onupdate="CASCADE"), nullable=False)

    flight        = relationship("Flight",    back_populates="bookings")
    passenger     = relationship("Passenger", back_populates="bookings")
    co_passengers = relationship("CoPassenger", back_populates="booking", cascade="all, delete-orphan")
    payment       = relationship("Payment",   back_populates="booking", uselist=False)


class CoPassenger(Base):
    __tablename__ = "CO_PASSENGER"

    CoPassengerID    = Column(Integer,    primary_key=True, autoincrement=True)
    FirstName        = Column(String(50), nullable=False)
    LastName         = Column(String(50), nullable=False)
    IdentificationID = Column(String(20), nullable=False)
    IDType           = Column(Enum("Passport", "Aadhar", "Driving License", "Voter ID"), nullable=False, default="Aadhar")
    Age              = Column(Integer,    nullable=False)
    Gender           = Column(Enum("Male", "Female", "Other"), nullable=False)
    Class            = Column(Enum("Economy", "Business", "First"), nullable=False, default="Economy")
    SeatNo           = Column(String(5),  nullable=False)
    BookingID        = Column(Integer,    ForeignKey("BOOKING.BookingID", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    booking = relationship("Booking", back_populates="co_passengers")


class Payment(Base):
    __tablename__ = "PAYMENT"

    PaymentID   = Column(Integer,       primary_key=True, autoincrement=True)
    Amount      = Column(Numeric(10, 2), nullable=False)
    Method      = Column(Enum("Credit Card", "Debit Card", "UPI", "Net Banking", "Cash"), nullable=False)
    PaymentDate = Column(Date,          nullable=False)
    BookingID   = Column(Integer,       ForeignKey("BOOKING.BookingID", onupdate="CASCADE"), nullable=False, unique=True)

    booking = relationship("Booking", back_populates="payment")
