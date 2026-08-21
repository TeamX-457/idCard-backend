# ID Card Management System - Backend

Backend service for the ID Card Management System. It is built with Express and TypeScript, uses Prisma to connect to PostgreSQL, and validates requests with Zod.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- Zod
- JSON Web Tokens

## Getting Started

### Prerequisites

- Node.js
- pnpm
- PostgreSQL

### Installation

```bash
git clone https://github.com/TeamX-457/idCard-backend.git
cd idCard-backend
pnpm install
```

### Environment Variables

Create a `.env` file in the project root. Keep database credentials and JWT secrets private and do not commit them.

```env
PORT=5050
```

### Running the Server

Start the development server:

```bash
pnpm dev
```

The server runs on port `5050` by default.

To build and start the production version:

```bash
pnpm build
pnpm start
```

## Project Structure

```text
idCard-backend/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controllers/       # Request handlers
│   ├── generated/prisma/   # Generated Prisma client
│   ├── lib/                # JWT and password helpers
│   ├── middleware/         # Logging, validation, auth, and errors
│   ├── routes/             # Express route definitions
│   ├── utils/              # Validation schemas and utilities
│   ├── db.ts               # Prisma database client
│   ├── server.ts           # Express application entry point
│   └── swagger.ts          # OpenAPI and Swagger configuration
├── package.json
├── pnpm-lock.yaml
├── .env
└── README.md
```

## Frontend

This backend serves the frontend application located in:

**Frontend:** https://github.com/TeamX-457/idCard

Make sure the frontend is configured to use the URL where this backend API is running.

## Development

When contributing to the backend:

1. Create a new branch for your changes.
2. Install any required dependencies.
3. Configure your environment variables.
4. Run the server locally.
5. Test API endpoints and their interaction with the frontend.
6. Commit your changes with a clear commit message.
7. Open a pull request for review.

## Related Repository

* Frontend: https://github.com/TeamX-457/idCard

## License

This project is currently maintained by **TeamX-457**.
