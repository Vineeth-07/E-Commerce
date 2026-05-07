# Sports Center

Sports Center is a full-stack e-commerce demo built with Spring Boot, React, MySQL, and Redis. It includes catalog browsing, basket and checkout flows, JWT-based authentication, and a demo payment step that does not process real card charges.

## Stack

- Backend: Java 17, Spring Boot, Spring Security, JPA
- Frontend: React, TypeScript, Redux Toolkit, Material UI, Vite
- Data: MySQL and Redis

## Local setup

This project runs with Java 17+ and Node 20+.

### 1. Start the local infrastructure

If you already have MySQL and Redis running locally, the app uses these defaults automatically:

- MySQL: `localhost:3306`
- Redis: `localhost:6379`

Seed the sample catalog once with:

```bash
mysql -h127.0.0.1 -P3306 -uroot < docker/data.sql
```

If you prefer Docker instead, use the included compose stack:

```bash
docker compose -f docker/docker-compose.yml up -d
```

The Docker profile uses:

- MySQL: `localhost:3307`
- Redis: `localhost:6380`

### 2. Start the backend

For local MySQL and Redis:

```bash
./mvnw spring-boot:run
```

For Docker MySQL and Redis:

```bash
SPRING_PROFILES_ACTIVE=docker ./mvnw spring-boot:run
```

The API runs on `http://localhost:8081`.

### 3. Start the frontend

```bash
cd client
npm install
npm run dev
```

The frontend talks to `http://localhost:8081/api/` by default.

If your backend runs elsewhere, set:

```bash
VITE_API_BASE_URL=http://localhost:8081/api/
```

## Accounts

No default personal account is seeded. Create an account from `/register`, then sign in with your own credentials.

## Demo checkout

The payment step is for demo purposes only. Card-style fields are UI-only and no real payment is captured, authorized, or stored by the backend.
