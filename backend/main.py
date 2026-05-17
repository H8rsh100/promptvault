from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth_router, prompt_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PromptVault API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(prompt_router.router)

@app.get("/")
def root():
    return {"message": "PromptVault API is live"}