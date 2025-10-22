from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from clerk_backend_api import Clerk
from .database import engine, Base
from .routers import auth, emails, calendar, newsletters, analytics
from .config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

# Initialize Clerk
clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)  # Add this to your .env
security = HTTPBearer()

# Configure CORS - UPDATE YOUR DOMAINS HERE
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mail.arktechnologies.ai",
        "https://agents.arktechnologies.ai", 
        "https://arktechnologies.ai",
        "https://accounts.arktechnologies.ai",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        # Verify the token with Clerk
        session = clerk.sessions.verify_session(token)
        return session
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Include routers - add auth dependency to protected routes
app.include_router(auth.router)
app.include_router(emails.router, dependencies=[Depends(verify_token)])
app.include_router(calendar.router, dependencies=[Depends(verify_token)])
app.include_router(newsletters.router, dependencies=[Depends(verify_token)])
app.include_router(analytics.router, dependencies=[Depends(verify_token)])

@app.get("/")
def read_root():
    return {"message": "Welcome to Arkmail API"}

@app.get("/protected-example", dependencies=[Depends(verify_token)])
async def protected_route():
    return {"message": "This route is protected!"}