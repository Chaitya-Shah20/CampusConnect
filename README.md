# CampusConnect

CampusConnect is a vanilla HTML/CSS/JavaScript campus community platform backed by Express, MongoDB and JWT cookie authentication.

## Run locally

1. Install Node.js 18+ and MongoDB Community Edition, or create a MongoDB Atlas database.
2. Copy `.env` values into your local environment and replace `JWT_SECRET` with a long random value.
3. From the project root run:

```bash
npm install
npm start
```

4. Open `http://localhost:3000`. The Express server serves the frontend and API from the same origin.

## Main routes

- `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- `/api/users`, `/api/users/me`, `/api/connections/:userId`
- `/api/projects`, `/api/opportunities`, `/api/hackathons`, `/api/resources`, `/api/questions`

The API uses bcryptjs for password hashing, JWTs in an HTTP-only cookie, Mongoose validation, protected middleware, and environment variables. MongoDB must be running for registration and data features to work; there are no hardcoded login users.

The homepage walking scene is built from HTML elements and CSS keyframes: four differently timed student figures move across a campus backdrop with a building, trees and bench. Limiting the scene on small screens keeps the heading and actions readable.
