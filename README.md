
# 📝 Yardstick Assessment — Multi-Tenant Notes App

A full-stack **multi-tenant notes application** built with **Next.js**, **Supabase**, and **Tailwind CSS**.  
Supports tenant-based isolation, authentication with JWT, and plan-based feature gating (Free vs Pro).

---

## 🚀 Features

- **Multi-Tenancy**
  - Each tenant (organization) has isolated users and notes.
  - Users cannot access data from another tenant.

- **Authentication**
  - Email + password login (JWT based).
  - Passwords hashed with `bcrypt`.

- **Notes CRUD**
  - Create, read, update, and delete notes within your tenant.
  - Tenant admins can manage their own members.

- **Subscription Plans**
  - **Free plan**: maximum 3 notes per tenant.
  - **Pro plan**: unlimited notes.
  - Admins can upgrade tenant to **Pro** via `/api/tenants/[slug]/upgrade`.

- **Admin Functions**
  - Invite users (stub can be extended).
  - Upgrade tenant plan.

- **CORS Enabled**
  - Cross-origin requests supported (`Access-Control-Allow-*` headers added).

- **Health Check Endpoint**
  - `/api/health` → returns `{ "status": "ok" }`.

- **Frontend**
  - Login form + Notes dashboard UI built with Tailwind.
  - Shows tenant info, user role, and plan status.
  - Upgrade prompt when Free plan limit reached.

---

## 📂 Project Structure

```

.
├── lib/                # Helpers (auth, CORS, Supabase, middleware)
├── pages/
│   ├── api/            # Backend API routes (auth, notes, tenants, health)
│   ├── index.js        # Login page
│   ├── notes.js        # Notes dashboard
│   └── \_app.js         # Global styles wrapper
├── scripts/
│   └── seed.js         # Seed initial tenants + users
├── styles/
│   └── globals.css     # Tailwind global styles
├── .env                # Environment variables (Supabase, JWT secret)
├── package.json
└── README.md

````

---

## 🔑 Test Accounts

Default accounts seeded into Supabase (password = **`password`**):

- `admin@acme.test` → **Admin, Acme tenant**
- `user@acme.test` → **Member, Acme tenant**
- `admin@globex.test` → **Admin, Globex tenant**
- `user@globex.test` → **Member, Globex tenant**

---

## ⚙️ Setup & Development

### 1. Clone the repo
```bash
git clone https://github.com/Ultimecia1463/Yardstick-assesment.git
cd Yardstick-assesment
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in project root:

```ini
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-secret
```

> ⚠️ Keep these values private. Never commit `.env` to GitHub.

### 4. Seed the database

```bash
npm run seed
```

This inserts tenants (`acme`, `globex`) and users into Supabase.

### 5. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deployment (Vercel)

This app is deployed on **Vercel**.

* **Frontend (Next.js)**:
  [https://yardstick-assesment-8c0w6rc63-ultimecias-projects.vercel.app](https://yardstick-assesment-8c0w6rc63-ultimecias-projects.vercel.app)

* **Base API URL (Vercel)**:
  Same as frontend since Next.js hosts API routes under `/api`

  ```
  https://yardstick-assesment-8c0w6rc63-ultimecias-projects.vercel.app/api
  ```

### Important API Endpoints

* Health:

  ```
  GET /api/health
  → { "status": "ok" }
  ```

* Auth (Login):

  ```
  POST /api/auth/login
  body: { email, password }
  → { token, user, tenant }
  ```

* Current user info:

  ```
  GET /api/me
  headers: Authorization: Bearer <token>
  ```

* Notes CRUD:

  ```
  GET    /api/notes
  POST   /api/notes
  PUT    /api/notes/:id
  DELETE /api/notes/:id
  ```

* Tenant upgrade:

  ```
  POST /api/tenants/:slug/upgrade
  ```

---

## 🔒 Multi-Tenancy Approach

* Each user belongs to a **tenant** (`users.tenant_id`).
* Each note belongs to a **tenant** (`notes.tenant_id`).
* Middleware (`withAuth`) validates the JWT, loads the user + tenant, and ensures requests stay within the tenant boundary.
* Plan enforcement: if tenant is `free` and has 3+ notes → `403 Forbidden`.

---

## ✅ Requirements Checklist

* [x] README explains multi-tenancy approach.
* [x] `/api/health` endpoint.
* [x] CORS middleware enabled.
* [ ] “Invite users” endpoint stubbed (extendable).
* [x] Edit notes UI present in frontend.
* [x] Deployed to Vercel (working links provided).

---

## 🛠️ Tech Stack

* **Next.js** 15
* **React** 19
* **Tailwind CSS** 4
* **Supabase** (Postgres + Auth + API)
* **JWT** (jsonwebtoken)
* **bcryptjs** (password hashing)

---

## 📜 License

This project is licensed under the **ISC License**.

---

## 📎 Links

* **Live Demo (Vercel)**:
  [https://yardstick-assesment-8c0w6rc63-ultimecias-projects.vercel.app](https://yardstick-assesment-8c0w6rc63-ultimecias-projects.vercel.app)

* **GitHub Repository**:
  [https://github.com/Ultimecia1463/Yardstick-assesment](https://github.com/Ultimecia1463/Yardstick-assesment)


