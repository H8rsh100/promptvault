# 🔑 PromptVault

[![GitHub License](https://img.shields.io/github/license/H8rsh100/promptvault?style=for-the-badge&color=indigo)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JWT Auth](https://img.shields.io/badge/JWT%20Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)](https://react.dev/)

> **Secure AI Prompt Store & Token Compiler** — A full-stack vault designed to save, search, edit, and classify AI system instructions and prompt templates. Securely gated by JWT session verification and styled in a premium glassmorphic dark theme.

---

## 🔒 JWT Authentication Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client (User)
    participant API as FastAPI Gateway
    participant Auth as Security Layer (JOSE/Bcrypt)
    participant DB as SQLite Database

    Client->>API: POST /auth/login { username, password }
    API->>DB: Query User record by username
    DB-->>API: Return User (hashed_password)
    API->>Auth: verify_password(password, hashed_password)
    Auth-->>API: Validated (True)
    API->>Auth: create_access_token() & create_refresh_token()
    Auth-->>API: Return HS256 signed JWT tokens
    API-->>Client: 200 OK (access_token, refresh_token)
    
    Note over Client: Client stores access_token in LocalStorage
    
    Client->>API: GET /prompts/my [Header: Authorization: Bearer <token>]
    API->>Auth: get_current_user() (Decode HS256 & verify claims)
    Auth-->>API: Claims valid (sub: username, type: access)
    API->>DB: Fetch prompts for user ID
    DB-->>API: Return prompts list
    API-->>Client: 200 OK [JSON Prompt List]
```

---

## 🛠️ Tech Stack

* **Backend**: FastAPI, SQLAlchemy, SQLite, passlib (Bcrypt hashing), python-jose (JWT validation).
* **Frontend**: React (Vite-scaffolded), Lucide-react, CSS Glassmorphism.
* **Database**: SQLite (local single-file database).

---

## 🚀 Installation & Local Development

### 1. Backend Server Setup
Create a `.env` configuration file in `backend/`:

```env
SECRET_KEY=your_super_secret_key_change_this_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Activate virtual environment and run the server:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API Swagger docs will be live at `http://localhost:8000/docs`.

### 2. React Client Setup

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to access the PromptVault Dashboard.

---

## ⚙️ GitHub Repository Configuration

To optimize your repository index card on GitHub, update the following fields in your repo settings:

* **About Section**:
  > A full-stack AI prompt management vault. Features a FastAPI REST backend gated by JWT access/refresh token pairs, SQLAlchemy SQLite storage, and a responsive glassmorphic React dashboard with tag search filters.
* **Topics/Keywords**:
  `fastapi`, `reactjs`, `jwt-authentication`, `sqlite`, `sqlalchemy`, `prompt-engineering`, `full-stack`, `developer-tools`
