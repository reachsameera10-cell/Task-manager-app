# TaskFlow

TaskFlow is a full-stack task management application built with React, Express, Prisma, and PostgreSQL. It includes JWT-based authentication, protected routes, task CRUD, analytics, filters, and a polished SaaS-style dashboard.

## Stack

- Frontend: React + Vite + Tailwind CSS + React Router
- Backend: Node.js + Express + JWT + bcrypt + Zod
- Database: PostgreSQL + Prisma ORM

## Local setup

1. Create a PostgreSQL database. The quickest option is a free Neon PostgreSQL database; copy its connection string from the Neon dashboard.
2. From the project root, install dependencies:

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

3. Create `backend/.env` from the example:

```bash
Copy-Item backend\.env.example backend\.env
```

The Neon CLI stores its connection strings in the root `.env.local`. Copy `DATABASE_URL` and `DATABASE_URL_UNPOOLED` from that file into `backend/.env`; use the pooled URL for `DATABASE_URL` and the direct URL for `DATABASE_URL_UNPOOLED`. Set `JWT_SECRET` to a new, private random value. Do not commit either env file.

4. Create the database tables and seed the demo account:

```bash
npm --prefix backend run prisma:migrate
npm --prefix backend run seed
```

The seed command creates the demo user and sample tasks. It is safe to run again; it will not duplicate demo tasks.

5. Start both apps:

```bash
npm run dev
```

This launches the backend on `http://localhost:5000` and the frontend on `http://localhost:5173`.
Open `http://localhost:5000/health` to verify the API can reach PostgreSQL before logging in.

## Demo credentials

Available after running the migration and seed commands above:

- Email: `demo@taskflow.app`
- Password: `password123`

## Notes

- Auth uses HTTP-only cookies for security.
- Passwords are hashed using `bcryptjs`.
- Sensitive configuration is kept in environment variables.
