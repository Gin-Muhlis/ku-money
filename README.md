# ku-money

Backend for a personal finance management SaaS application.

## Goal

Create a backend for a personal finance application called **ku-money**, a SaaS-based app to manage financial accounts (bank, e-wallet, cash), income/expense categories, and transaction operations.
In the initial phase, only the project structure + basic authentication features with email verification placeholders are needed.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Cookie-parser
- Cors
- Dotenv
- Nodemailer

## Installation and Running

1.  Clone the repository
2.  Install dependencies: `npm install`
3.  Create a `.env` file and fill in the required variables
4.  Run the development server: `npm run dev`

## Endpoints

| Method | Endpoint              | Description           | Auth |
|--------|-----------------------|-----------------------|------|
| POST   | /api/auth/register    | Register a new user   | ❌   |
| GET    | /api/auth/verify/:token | Verify email          | ❌   |
| POST   | /api/auth/login       | Login user            | ❌   |
| POST   | /api/auth/logout      | Logout user           | ✅   |
| POST   | /api/auth/refresh     | Refresh access token  | ✅   |

## Folder Structure

```
my-express-app
├── src
│   ├── config          # Database & environment configuration
│   ├── controllers     # Main API logic (register, login, etc)
│   ├── models          # Mongoose schema
│   ├── routes          # API endpoint definitions
│   ├── middlewares     # Auth & error handler middleware
│   ├── services        # External services (e.g., email verification, token)
│   ├── utils           # Helpers and general utilities
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
├── .env                   # Environment variables
├── .gitignore             # Ignore node_modules & env
├── package.json           # Scripts and dependencies
├── README.md              # Project documentation
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
