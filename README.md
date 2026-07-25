# LeadFlow — Lead Management Platform

A full-stack lead management application built for small sales teams. Capture leads through a public form, track them through a status pipeline, assign them to team members, add notes, and monitor the complete activity trail.

**🔗 Live Demo**: [Deployed URL - TBD]

**Login Credentials**:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@leadflow.com | Admin@123 |
| Member | member@leadflow.com | Member@123 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Testing | Jest, Supertest, MongoDB Memory Server |
| Styling | Tailwind CSS v3 (Dark theme, Glassmorphism) |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/leadflow.git
cd leadflow
```

### 2. Server Setup
```bash
cd server
npm install

# Create environment file
cp ../.env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed the database with demo users
npm run seed

# Start the development server
npm run dev
```

The API runs on `http://localhost:5000`.

### 3. Client Setup
```bash
cd client
npm install

# Start the development server
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/leadflow` |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Response Format
**Success:**
```json
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 47, "pages": 5 }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

### Auth Endpoints

#### `POST /api/auth/login`
Login and receive a JWT token.

**Body:**
```json
{
  "email": "admin@leadflow.com",
  "password": "Admin@123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "_id": "...",
      "name": "Admin User",
      "email": "admin@leadflow.com",
      "role": "admin"
    }
  }
}
```

#### `GET /api/auth/me`
Get the current authenticated user's profile.

**Auth:** Required  
**Response:** `200 OK`

---

### Public Endpoints

#### `POST /api/public/leads`
Submit a lead via the public capture form. No authentication required.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "source": "website"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "message": "Thank you! Your information has been submitted successfully.",
    "leadId": "..."
  }
}
```

---

### Lead Endpoints

#### `GET /api/leads`
List leads with pagination and filtering. Admin sees all leads; members see only assigned leads.

**Auth:** Required  
**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 50) |
| `status` | string | — | Filter by status |
| `assignedTo` | string | — | Filter by user ID |
| `search` | string | — | Search name, email, company |
| `sortBy` | string | createdAt | Sort field |
| `order` | string | desc | Sort order (asc/desc) |

**Response:** `200 OK` with pagination metadata

#### `GET /api/leads/:id`
Get a single lead with notes and activity trail.

**Auth:** Required  
**Response:** `200 OK`

#### `POST /api/leads`
Create a new lead manually (admin only).

**Auth:** Required (Admin)  
**Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+9876543210",
  "company": "Tech Corp",
  "source": "referral"
}
```

**Response:** `201 Created`

#### `PUT /api/leads/:id`
Update a lead. Admin can update any lead; members can only update assigned leads.

**Auth:** Required  
**Body:** (any subset)
```json
{
  "name": "Updated Name",
  "status": "contacted",
  "company": "New Company"
}
```

**Response:** `200 OK`

#### `PATCH /api/leads/:id/assign`
Assign or unassign a lead to a user (admin only).

**Auth:** Required (Admin)  
**Body:**
```json
{
  "userId": "user_id_here"
}
```
Pass `null` or omit `userId` to unassign.

**Response:** `200 OK`

#### `POST /api/leads/:id/notes`
Add a note to a lead. Admin can add notes to any lead; members only to assigned leads.

**Auth:** Required  
**Body:**
```json
{
  "content": "Spoke with the client, they are very interested."
}
```

**Response:** `200 OK`

#### `DELETE /api/leads/:id`
Delete a lead (admin only).

**Auth:** Required (Admin)  
**Response:** `200 OK`

---

### User Endpoints (Admin Only)

#### `GET /api/users`
List all users.

**Auth:** Required (Admin)  
**Response:** `200 OK`

#### `POST /api/users`
Create a new user.

**Auth:** Required (Admin)  
**Body:**
```json
{
  "name": "New Member",
  "email": "new@leadflow.com",
  "password": "Secure@123",
  "role": "member"
}
```

**Response:** `201 Created`

#### `DELETE /api/users/:id`
Delete a user.

**Auth:** Required (Admin)  
**Response:** `200 OK`

---

### Health Check

#### `GET /api/health`
Check if the API is running.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Status Values

| Status | Description |
|--------|-------------|
| `new` | Just captured, not yet contacted |
| `contacted` | Initial outreach made |
| `qualified` | Lead meets criteria, worth pursuing |
| `proposal` | Proposal/quote sent |
| `won` | Deal closed successfully |
| `lost` | Deal lost or lead disqualified |

## Source Values

`website`, `referral`, `social`, `cold_call`, `email`, `other`

## Roles & Permissions

| Permission | Admin | Member |
|-----------|-------|--------|
| View all leads | ✅ | ❌ (only assigned) |
| Create leads | ✅ | ❌ |
| Update any lead | ✅ | ❌ (only assigned) |
| Delete leads | ✅ | ❌ |
| Assign leads | ✅ | ❌ |
| Add notes (any lead) | ✅ | ❌ (only assigned) |
| Manage users | ✅ | ❌ |

---

## Testing

```bash
cd server
npm test
```

Tests cover:
- ✅ Login with valid/invalid credentials
- ✅ Token verification and expiration
- ✅ Role-based access control (admin vs member)
- ✅ Complete lead lifecycle (create → assign → update status → add note)
- ✅ Public capture form submission
- ✅ Pagination and filtering
- ✅ Permission enforcement (member restrictions)

---

## Task B Documents

Located in the `docs/` directory:
- [Assessment Document](docs/assessment.md) — Audit of the inherited codebase
- [Migration Plan](docs/migration-plan.md) — Phased migration strategy (Week 1, Month 1, Quarter 1)
- [Before/After Refactor](docs/refactor-before-after.md) — Realistic bad code refactored with commentary
- [Standards Proposal](docs/standards-proposal.md) — Engineering standards and team adoption strategy

---

## License

MIT

---

<p align="center">
  <a href="https://digitalheroesco.com" target="_blank">Built for Digital Heroes Training Task</a>
</p>
