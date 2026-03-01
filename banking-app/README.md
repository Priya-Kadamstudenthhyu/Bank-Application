# 🏦 Smart Digital Banking System

A full-stack banking web application with Admin Control & Digital Signature.

## Tech Stack
- **Backend:** Python Flask + MySQL + JWT
- **Frontend:** React.js + Tailwind CSS + Recharts

---

## 📁 Project Structure

```
banking-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py         # Flask app factory
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── routes/
│   │   │   ├── auth.py         # Login, Register, Refresh
│   │   │   ├── user.py         # User endpoints
│   │   │   └── admin.py        # Admin endpoints
│   │   └── utils/
│   │       └── decorators.py   # RBAC decorators
│   ├── schema.sql              # MySQL schema + seed
│   ├── requirements.txt
│   ├── .env                    # ← UPDATE THIS
│   └── run.py                  # Entry point
│
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── api/axios.js        # Axios instance + interceptors
    │   ├── hooks/useAuth.js    # Auth context & provider
    │   ├── components/common/  # Navbar, StatCard, Badge, ProtectedRoute
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── user/           # Dashboard, Profile, Accounts, Transactions, Signature
    │   │   └── admin/          # AdminDashboard, AdminUsers, AdminUserDetail, AdminTransactions, AdminAccounts
    │   ├── App.jsx             # Router
    │   └── index.js
    └── package.json
```

---

## ⚙️ Setup Instructions

### 1. MySQL Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
source /path/to/banking-app/backend/schema.sql

# Verify
USE banking_db;
SHOW TABLES;
```

### 2. Backend Setup

```bash
cd banking-app/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# ⚠️ IMPORTANT: Edit .env file
# Change DATABASE_URL to match your MySQL credentials:
# DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/banking_db
# Also update SECRET_KEY and JWT_SECRET_KEY to long random strings

# Run the Flask server
python run.py
```

Server runs at: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd banking-app/frontend

# Install dependencies
npm install

# Start React app
npm start
```

App runs at: **http://localhost:3000**

---

## 🔑 Default Credentials

| Role  | Email            | Password  |
|-------|-----------------|-----------|
| Admin | admin@bank.com  | Admin@123 |
| User  | Register at /register | Min 8 chars, 1 uppercase, 1 number |

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh token |
| GET  | /api/auth/me | Get current user |

### User (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/user/dashboard | Dashboard stats |
| GET/PUT | /api/user/profile | View/update profile |
| GET | /api/user/accounts | List accounts |
| POST | /api/user/accounts/open | Open new account |
| GET/POST | /api/user/transactions | List/create transactions |
| GET/POST | /api/user/signature | View/save signature |

### Admin (JWT + Admin Role Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Admin stats + chart data |
| GET | /api/admin/users | List all users |
| GET | /api/admin/users/:id | User detail |
| PUT | /api/admin/users/:id/toggle-status | Block/Activate user |
| GET | /api/admin/accounts | List all accounts |
| PUT | /api/admin/accounts/:id/activate | Activate account |
| GET | /api/admin/transactions | List transactions |
| PUT | /api/admin/transactions/:id/approve | Approve/Reject |
| GET | /api/admin/users/:id/signature | View user signature |

---

## 🌟 Features

### User
- Register & Login with JWT
- Open bank accounts (savings/checking/fixed)
- Submit transactions (deposit/withdrawal/transfer)
- Draw or upload digital signature
- View transaction history & approval status
- Update profile

### Admin
- Dashboard with charts (bar + pie via Recharts)
- Manage all users (view, block, activate)
- View individual user profiles & signatures
- Activate bank accounts
- Approve/Reject transactions with notes
- Filter by status

---

## 📌 Postman Test Examples

```json
// POST /api/auth/login
{
  "email": "admin@bank.com",
  "password": "Admin@123"
}

// POST /api/auth/register
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Jane@1234",
  "phone": "+1234567890"
}

// POST /api/user/transactions (with Bearer token)
{
  "transaction_type": "deposit",
  "from_account_id": 1,
  "amount": 500.00,
  "description": "Initial deposit"
}

// PUT /api/admin/transactions/1/approve (admin Bearer token)
{
  "action": "approve",
  "admin_note": "Verified and approved"
}
```

---

## 🔒 Security

- Passwords hashed with Werkzeug PBKDF2
- JWT access tokens (1hr) + refresh tokens
- Role-based access decorators on all routes
- CORS restricted to localhost:3000
- SQL injection prevented via SQLAlchemy ORM
- Input validation on all endpoints

---

## 🚀 Future Enhancements

- Email notifications (Flask-Mail)
- 2FA with TOTP
- PDF bank statements
- Transaction CSV export
- Mobile app (React Native)
- Savings interest calculator
- Loan management module
