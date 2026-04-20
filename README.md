-- ============================================================
--  FLIGHT MANAGEMENT SYSTEM — Complete MySQL Schema
--  Course: DBMS | VIT Pune | Semester 4
--  Includes: IdentificationID, IDType, Class in Booking,
--            no CHECK on FK columns, all sample data
-- ============================================================

DROP DATABASE IF EXISTS flight_management;
CREATE DATABASE flight_management;
USE flight_management;

-- ============================================================
-- 1. PASSENGER
-- ============================================================
CREATE TABLE PASSENGER (
    IdentificationID VARCHAR(20)  PRIMARY KEY,
    IDType           ENUM('Passport', 'Aadhar', 'Driving License', 'Voter ID') NOT NULL DEFAULT 'Aadhar',
    FirstName        VARCHAR(50)  NOT NULL,
    LastName         VARCHAR(50)  NOT NULL,
    Email            VARCHAR(100) NOT NULL UNIQUE,
    Phone            VARCHAR(15)  NOT NULL,
    Age              INT          NOT NULL CHECK (Age > 0),
    Gender           ENUM('Male', 'Female', 'Other') NOT NULL
);

-- ============================================================
-- 2. AIRLINE
-- ============================================================
CREATE TABLE AIRLINE (
    AirlineID   VARCHAR(10)  PRIMARY KEY,
    AirlineName VARCHAR(100) NOT NULL,
    Owner       VARCHAR(100) NOT NULL
);

-- ============================================================
-- 3. AIRPORT
-- ============================================================
CREATE TABLE AIRPORT (
    AirportCode CHAR(3)      PRIMARY KEY,
    AirportName VARCHAR(150) NOT NULL,
    City        VARCHAR(100) NOT NULL,
    Country     VARCHAR(100) NOT NULL,
    Terminal    VARCHAR(10)
);

-- ============================================================
-- 4. AIRCRAFT
-- ============================================================
CREATE TABLE AIRCRAFT (
    AircraftID VARCHAR(20)  PRIMARY KEY,
    Model      VARCHAR(100) NOT NULL,
    Capacity   INT          NOT NULL CHECK (Capacity > 0),
    AirlineID  VARCHAR(10)  NOT NULL,

    CONSTRAINT fk_aircraft_airline
        FOREIGN KEY (AirlineID) REFERENCES AIRLINE(AirlineID)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- 5. FLIGHT
--    CHECK on FK columns removed (MySQL 8 limitation)
--    Airport difference enforced at application level
-- ============================================================
CREATE TABLE FLIGHT (
    FlightID         VARCHAR(10)    PRIMARY KEY,
    DeptTime         DATETIME       NOT NULL,
    ArrivalTime      DATETIME       NOT NULL,
    Cost             DECIMAL(10, 2) NOT NULL CHECK (Cost >= 0),
    AirlineID        VARCHAR(10)    NOT NULL,
    AircraftID       VARCHAR(20)    NOT NULL,
    DepartureAirport CHAR(3)        NOT NULL,
    ArrivalAirport   CHAR(3)        NOT NULL,

    CONSTRAINT fk_flight_airline
        FOREIGN KEY (AirlineID)        REFERENCES AIRLINE(AirlineID)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_flight_aircraft
        FOREIGN KEY (AircraftID)       REFERENCES AIRCRAFT(AircraftID)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_flight_dep_airport
        FOREIGN KEY (DepartureAirport) REFERENCES AIRPORT(AirportCode)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_flight_arr_airport
        FOREIGN KEY (ArrivalAirport)   REFERENCES AIRPORT(AirportCode)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_flight_times
        CHECK (ArrivalTime > DeptTime)
);

-- ============================================================
-- 6. BOOKING
--    Status moved from PASSENGER–AIRLINE relation
--    Class added at booking level
-- ============================================================
CREATE TABLE BOOKING (
    BookingID        INT         PRIMARY KEY AUTO_INCREMENT,
    BookingDate      DATE        NOT NULL,
    SeatNo           VARCHAR(5)  NOT NULL,
    Status           ENUM('Confirmed', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Pending',
    Class            ENUM('Economy', 'Business', 'First')      NOT NULL DEFAULT 'Economy',
    FlightID         VARCHAR(10) NOT NULL,
    IdentificationID VARCHAR(20) NOT NULL,

    CONSTRAINT fk_booking_flight
        FOREIGN KEY (FlightID)         REFERENCES FLIGHT(FlightID)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_booking_passenger
        FOREIGN KEY (IdentificationID) REFERENCES PASSENGER(IdentificationID)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_flight_seat
        UNIQUE (FlightID, SeatNo)
);

-- ============================================================
-- 7. CO_PASSENGER
-- ============================================================
CREATE TABLE CO_PASSENGER (
    CoPassengerID    INT        PRIMARY KEY AUTO_INCREMENT,
    FirstName        VARCHAR(50) NOT NULL,
    LastName         VARCHAR(50) NOT NULL,
    IdentificationID VARCHAR(20) NOT NULL,
    IDType           ENUM('Passport', 'Aadhar', 'Driving License', 'Voter ID') NOT NULL DEFAULT 'Aadhar',
    Age              INT         NOT NULL CHECK (Age > 0),
    Gender           ENUM('Male', 'Female', 'Other') NOT NULL,
    Class            ENUM('Economy', 'Business', 'First') NOT NULL DEFAULT 'Economy',
    SeatNo           VARCHAR(5)  NOT NULL,
    BookingID        INT         NOT NULL,

    CONSTRAINT fk_copassenger_booking
        FOREIGN KEY (BookingID) REFERENCES BOOKING(BookingID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 8. PAYMENT
--    1 booking → 1 payment (UNIQUE on BookingID)
-- ============================================================
CREATE TABLE PAYMENT (
    PaymentID   INT            PRIMARY KEY AUTO_INCREMENT,
    Amount      DECIMAL(10, 2) NOT NULL CHECK (Amount > 0),
    Method      ENUM('Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash') NOT NULL,
    PaymentDate DATE           NOT NULL,
    BookingID   INT            NOT NULL UNIQUE,

    CONSTRAINT fk_payment_booking
        FOREIGN KEY (BookingID) REFERENCES BOOKING(BookingID)
        ON DELETE RESTRICT ON UPDATE CASCADE
);


-- ============================================================
--  SAMPLE DATA
-- ============================================================

INSERT INTO AIRLINE VALUES
    ('AI', 'Air India',  'Government of India'),
    ('6E', 'IndiGo',     'InterGlobe Aviation'),
    ('SG', 'SpiceJet',   'SpiceJet Ltd');

INSERT INTO AIRPORT VALUES
    ('BOM', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai',    'India', 'T2'),
    ('DEL', 'Indira Gandhi International Airport',               'Delhi',     'India', 'T3'),
    ('BLR', 'Kempegowda International Airport',                  'Bengaluru', 'India', 'T1'),
    ('PNQ', 'Pune Airport',                                      'Pune',      'India', 'T1');

INSERT INTO AIRCRAFT VALUES
    ('VT-ANB', 'Boeing 737',     180, 'AI'),
    ('VT-IGA', 'Airbus A320',    180, '6E'),
    ('VT-SGN', 'Boeing 737 MAX', 189, 'SG');

-- Original 3 flights (updated to Apr 28 2026)
INSERT INTO FLIGHT VALUES
    ('AI202', '2026-04-28 06:00:00', '2026-04-28 08:00:00', 4500.00, 'AI', 'VT-ANB', 'PNQ', 'DEL'),
    ('6E301', '2026-04-28 09:00:00', '2026-04-28 11:30:00', 3800.00, '6E', 'VT-IGA', 'BOM', 'BLR'),
    ('SG101', '2026-04-28 12:00:00', '2026-04-28 13:45:00', 2900.00, 'SG', 'VT-SGN', 'DEL', 'BOM');

-- PNQ → DEL on multiple dates
INSERT INTO FLIGHT VALUES
    ('AI203', '2026-04-29 06:00:00', '2026-04-29 08:00:00', 4500.00, 'AI', 'VT-ANB', 'PNQ', 'DEL'),
    ('AI204', '2026-04-30 06:00:00', '2026-04-30 08:00:00', 4800.00, 'AI', 'VT-ANB', 'PNQ', 'DEL'),
    ('AI205', '2026-05-01 06:00:00', '2026-05-01 08:00:00', 4200.00, 'AI', 'VT-ANB', 'PNQ', 'DEL'),
    ('AI206', '2026-05-02 06:00:00', '2026-05-02 08:00:00', 4500.00, 'AI', 'VT-ANB', 'PNQ', 'DEL');

-- BOM → BLR on multiple dates
INSERT INTO FLIGHT VALUES
    ('6E302', '2026-04-29 09:00:00', '2026-04-29 11:30:00', 3800.00, '6E', 'VT-IGA', 'BOM', 'BLR'),
    ('6E303', '2026-04-30 09:00:00', '2026-04-30 11:30:00', 3500.00, '6E', 'VT-IGA', 'BOM', 'BLR'),
    ('6E304', '2026-05-01 09:00:00', '2026-05-01 11:30:00', 4000.00, '6E', 'VT-IGA', 'BOM', 'BLR'),
    ('6E305', '2026-05-02 14:00:00', '2026-05-02 16:30:00', 3600.00, '6E', 'VT-IGA', 'BOM', 'BLR');

-- DEL → BOM on multiple dates
INSERT INTO FLIGHT VALUES
    ('SG102', '2026-04-29 12:00:00', '2026-04-29 13:45:00', 2900.00, 'SG', 'VT-SGN', 'DEL', 'BOM'),
    ('SG103', '2026-04-30 12:00:00', '2026-04-30 13:45:00', 3100.00, 'SG', 'VT-SGN', 'DEL', 'BOM'),
    ('SG104', '2026-05-01 18:00:00', '2026-05-01 19:45:00', 2700.00, 'SG', 'VT-SGN', 'DEL', 'BOM'),
    ('SG105', '2026-05-02 12:00:00', '2026-05-02 13:45:00', 2900.00, 'SG', 'VT-SGN', 'DEL', 'BOM');

-- New routes
INSERT INTO FLIGHT VALUES
    ('AI301', '2026-04-28 08:00:00', '2026-04-28 09:30:00', 3200.00, 'AI', 'VT-ANB', 'DEL', 'BLR'),
    ('AI302', '2026-04-29 08:00:00', '2026-04-29 09:30:00', 3400.00, 'AI', 'VT-ANB', 'DEL', 'BLR'),
    ('6E401', '2026-04-28 11:00:00', '2026-04-28 12:15:00', 2800.00, '6E', 'VT-IGA', 'BLR', 'PNQ'),
    ('6E402', '2026-04-30 11:00:00', '2026-04-30 12:15:00', 2600.00, '6E', 'VT-IGA', 'BLR', 'PNQ'),
    ('SG201', '2026-04-28 15:00:00', '2026-04-28 16:30:00', 3300.00, 'SG', 'VT-SGN', 'BOM', 'DEL'),
    ('SG202', '2026-05-01 15:00:00', '2026-05-01 16:30:00', 3100.00, 'SG', 'VT-SGN', 'BOM', 'DEL');

INSERT INTO PASSENGER VALUES
    ('P1234567', 'Passport', 'Kshitij', 'Verma',  'kshitij@email.com', '9876543210', 20, 'Male'),
    ('P7654321', 'Passport', 'Riya',    'Sharma', 'riya@email.com',    '9988776655', 22, 'Female');

INSERT INTO BOOKING (BookingDate, SeatNo, Status, Class, FlightID, IdentificationID) VALUES
    ('2026-04-20', '12A', 'Confirmed', 'Economy',  'AI202', 'P1234567'),
    ('2026-04-21', '5B',  'Pending',   'Business', '6E301', 'P7654321');

INSERT INTO PAYMENT (Amount, Method, PaymentDate, BookingID) VALUES
    (4500.00, 'UPI',          '2026-04-20', 1),
    (3800.00, 'Credit Card',  '2026-04-21', 2);

INSERT INTO CO_PASSENGER (FirstName, LastName, IdentificationID, IDType, Age, Gender, Class, SeatNo, BookingID) VALUES
    ('Arjun', 'Verma', 'A1234567890', 'Aadhar', 18, 'Male', 'Economy', '12B', 1);