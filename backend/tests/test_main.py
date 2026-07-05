import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Set dummy env vars for test runner
os.environ["SECRET_KEY"] = "test_secret_key_12345"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "15"
os.environ["REFRESH_TOKEN_EXPIRE_DAYS"] = "2"

from database import Base, get_db
from main import app

# Create SQLite DB for isolated testing
TEST_DB_URL = "sqlite:///test_promptvault.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.drop_all(bind=test_engine)
Base.metadata.create_all(bind=test_engine)

def override_get_db():
    try:
        db = TestingSession()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    # Make sure we clean up the tables for clean states
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "PromptVault API is live"}

def test_auth_workflow():
    # 1. Register User
    reg_response = client.post("/auth/register", json={
        "username": "tester",
        "email": "tester@example.com",
        "password": "securepassword123"
    })
    assert reg_response.status_code == 200
    assert reg_response.json()["username"] == "tester"
    
    # 2. Login User
    login_response = client.post("/auth/login", json={
        "username": "tester",
        "email": "tester@example.com", # unused in login validation but required by schema
        "password": "securepassword123"
    })
    assert login_response.status_code == 200
    tokens = login_response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"

def test_prompts_crud():
    # Register & Login
    client.post("/auth/register", json={
        "username": "prompt_engineer",
        "email": "pe@example.com",
        "password": "pe_password"
    })
    login_res = client.post("/auth/login", json={
        "username": "prompt_engineer",
        "email": "pe@example.com",
        "password": "pe_password"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Prompt (should succeed)
    create_res = client.post("/prompts", json={
        "title": "System Prompt 1",
        "content": "Act as a code helper.",
        "tags": "helper,code"
    }, headers=headers)
    assert create_res.status_code == 200
    prompt_id = create_res.json()["id"]
    
    # Get My Prompts
    my_prompts = client.get("/prompts/my", headers=headers)
    assert my_prompts.status_code == 200
    assert len(my_prompts.json()) == 1
    assert my_prompts.json()[0]["title"] == "System Prompt 1"
    
    # Update Prompt
    update_res = client.put(f"/prompts/{prompt_id}", json={
        "title": "Updated Prompt Title",
        "content": "New content description",
        "tags": "helper,code,updated"
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Prompt Title"
    
    # Delete Prompt
    delete_res = client.delete(f"/prompts/{prompt_id}", headers=headers)
    assert delete_res.status_code == 200
    assert delete_res.json() == {"message": "Prompt deleted successfully"}
