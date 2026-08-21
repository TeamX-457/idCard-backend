import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ID Card Management API",
      version: "1.0.0",
      description: "API for school registration and authentication in the ID Card Management System.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],
    tags: [
      { name: "General", description: "Service information" },
      { name: "Authentication", description: "School and user authentication" },
      { name: "Students", description: "Student records for the authenticated school" },
    ],
    components: {
      responses: {
        ValidationError: {
          description: "Request validation failed",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        UnauthorizedError: {
          description: "Authentication failed",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        ForbiddenError: {
          description: "The authenticated user is not allowed to perform this operation",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        NotFoundError: {
          description: "The requested resource was not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        ConflictError: {
          description: "The request conflicts with existing data",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        ServerError: {
          description: "Unexpected server error",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterSchoolRequest: {
          type: "object",
          required: ["schoolName", "adminName", "email", "password"],
          properties: {
            schoolName: { type: "string", minLength: 2, example: "Northbridge Academy" },
            adminName: { type: "string", minLength: 2, example: "Ada Lovelace" },
            email: { type: "string", format: "email", example: "admin@northbridge.edu" },
            password: { type: "string", minLength: 6, format: "password", example: "secure-password" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@northbridge.edu" },
            password: { type: "string", minLength: 1, format: "password", example: "secure-password" },
          },
        },
        AuthResponse: {
          type: "object",
          required: ["token", "user"],
          properties: {
            token: { type: "string", description: "JWT access token" },
            user: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                email: { type: "string", format: "email" },
                role: { type: "string", enum: ["SUPER_ADMIN", "SCHOOL_ADMIN"] },
              },
            },
            school: { $ref: "#/components/schemas/School" },
          },
        },
        School: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
          },
        },
        CreateStudentRequest: {
          type: "object",
          required: ["name", "class", "admissionNumber"],
          properties: {
            name: { type: "string", minLength: 2, example: "Jordan Lee" },
            class: { type: "string", minLength: 1, example: "JSS 2" },
            admissionNumber: { type: "string", minLength: 1, example: "NBA-2026-0042" },
            metadata: {
              type: "object",
              additionalProperties: true,
              example: { bloodGroup: "O+", house: "Blue" },
            },
          },
        },
        Student: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            schoolId: { type: "string", format: "uuid" },
            name: { type: "string" },
            class: { type: "string" },
            admissionNumber: { type: "string" },
            status: { type: "string", example: "active" },
            metadata: { type: "object", nullable: true, additionalProperties: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        StudentResponse: {
          type: "object",
          required: ["student"],
          properties: {
            student: { $ref: "#/components/schemas/Student" },
          },
        },
        StudentListResponse: {
          type: "object",
          required: ["students", "pagination"],
          properties: {
            students: { type: "array", items: { $ref: "#/components/schemas/Student" } },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 25 },
                total: { type: "integer", example: 42 },
                totalPages: { type: "integer", example: 2 },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["success", "error"],
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                message: { type: "string", example: "Invalid request" },
                stack: { type: "string", description: "Included only when NODE_ENV=development" },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/server.ts", "./src/routes/*.ts"],
};

export const swaggerDocument = swaggerJsdoc(options);
