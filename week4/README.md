# FlyRank Auth API (Week 4)

This project demonstrates secure user authentication (Sign Up, Log In, Log Out) using Node.js, Express, and Supabase. It features protected endpoints verified via JWTs (Access Tokens) and provides full API documentation through Swagger UI.

## Setup Instructions

1. **Clone the repository** (if not already done).
2. **Install dependencies**:
   ```bash
   cd week4
   npm install
   ```
3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   PORT=3000
   ```
4. **Run the Server**:
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000`.

## API Reference

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Create a new user account | No |
| `POST` | `/auth/login` | Authenticate user & return JWT | No |
| `POST` | `/auth/logout` | Terminate the user session | Yes |
| `GET` | `/public/info` | Read public data | No |
| `GET` | `/protected/profile`| Read private user profile data | Yes |

## Testing with Swagger UI

1. Start the server and navigate to `http://localhost:3000/docs` in your browser.
2. Under `/auth/signup` or `/auth/login`, create an account or log in to receive an `access_token`.
3. Click the **Authorize** button (the padlock icon) at the top of the Swagger UI or next to protected routes.
4. Paste your `access_token` into the input field and click **Authorize**.
5. You can now successfully test protected endpoints like `/protected/profile`!

## Security Notes
- The `.env` file is excluded from Git to prevent leaking sensitive keys.
- Protected routes require a Bearer token passed in the `Authorization` HTTP header.
- Token verification is implemented as an Express middleware for reusability.
