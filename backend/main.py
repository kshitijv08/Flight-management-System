from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routes import passengers, airlines, airports, aircraft, flights, bookings, payments

# Create tables automatically if they don't exist yet
# (Safe to call every startup — won't overwrite existing data)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Flight Management System",
    description="DBMS Course Project — VIT Pune | Semester 4",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(passengers.router)
app.include_router(airlines.router)
app.include_router(airports.router)
app.include_router(aircraft.router)
app.include_router(flights.router)
app.include_router(bookings.router)
app.include_router(payments.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "message": "Flight Management System API is running",
        "docs": "/docs",
    }
