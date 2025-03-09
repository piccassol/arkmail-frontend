from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, emails, calendar, newsletters, analytics
from .config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-app.vercel.app", "http://localhost:3000"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(emails.router)
app.include_router(calendar.router)
app.include_router(newsletters.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to PDGmail API"}

@app.get("/test-db")
async def test_db(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"message": "Database connection successful!"}
    except Exception as e:
        return {"error": f"Database connection failed: {str(e)}"}
