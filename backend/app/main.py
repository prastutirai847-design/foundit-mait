from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine
from .routes import claims, listings
from .schemas import HealthOut
from .seed import seed_database


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Create tables and insert the samples only when the database is empty.
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        listing_count, claim_count = seed_database(db)
        if listing_count:
            print(
                f"[FoundIt] Seeded {listing_count} demo listings and "
                f"{claim_count} demo claims."
            )
    yield


app = FastAPI(
    title="FoundIt API",
    version="1.0.0",
    description=(
        "Demo backend for the FoundIt MAIT campus lost-and-found prototype. "
        "Identity is a spoofable X-Demo-User header, not authentication."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5180",
        "http://127.0.0.1:5180",
        "https://foundit-mait.vercel.app",
        "https://foundit-mait-74ql8fgw3-prastutirai847-design.vercel.app",
    ],
    # This also covers Vite when it falls back to another localhost port.
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings.router, prefix="/api")
app.include_router(claims.router, prefix="/api")


@app.get("/api/health", response_model=HealthOut, tags=["health"])
def health():
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def root():
    return {
        "name": "FoundIt API",
        "docs": "/docs",
        "health": "/api/health",
    }
