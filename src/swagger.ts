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
      { name: "Guardians", description: "Guardian records and links to students" },
      { name: "Cards", description: "ID card assignment and revocation for the authenticated school" },
      { name: "Devices", description: "Device registration and credential management for the authenticated school" },
      { name: "Attendance", description: "Attendance event capture and attendance rule configuration" },
      { name: "Dashboard", description: "School dashboard summaries and live status views" },
      { name: "Calendar", description: "School calendar exceptions such as holidays and make-up days" },
      { name: "Terms", description: "Academic term management for the school calendar" },
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
            schoolName: { type: "string", minLength: 2, example: "Itam Community School" },
            adminName: { type: "string", minLength: 2, example: "Akpan Eteng" },
            email: { type: "string", format: "email", example: "admin@itamcommunity.edu" },
            password: { type: "string", minLength: 6, format: "password", example: "secure-password" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@itamcommunity.edu" },
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
            name: { type: "string", minLength: 2, example: "Grace Nkereuwem" },
            class: { type: "string", minLength: 1, example: "JSS 2" },
            admissionNumber: { type: "string", minLength: 1, example: "NBA-2026-0042" },
            metadata: {
              type: "object",
              additionalProperties: true,
              example: { bloodGroup: "O+", house: "Blue" },
            },
          },
        },
        CreateGuardianRequest: {
          type: "object",
          required: ["name", "phoneNumber"],
          properties: {
            name: { type: "string", minLength: 2, example: "Uduak Thompson" },
            phoneNumber: { type: "string", minLength: 7, example: "+2348012345678" },
            notificationPreference: { type: "string", example: "sms" },
          },
        },
        AttachStudentToGuardianRequest: {
          type: "object",
          required: ["studentId", "relationship"],
          properties: {
            studentId: { type: "string", format: "uuid", example: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6" },
            relationship: { type: "string", example: "Father" },
          },
        },
        AssignCardRequest: {
          type: "object",
          required: ["studentId", "uid"],
          properties: {
            studentId: { type: "string", minLength: 1, example: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6" },
            uid: { type: "string", minLength: 1, example: "A1B2C3D4" },
          },
        },
        RegisterDeviceRequest: {
          type: "object",
          required: ["locationName"],
          properties: {
            locationName: { type: "string", minLength: 1, example: "North Gate" },
            latitude: { type: "number", example: 5.123456 },
            longitude: { type: "number", example: 7.456789 },
          },
        },
        CreateAttendanceEventRequest: {
          type: "object",
          required: ["uid", "eventType"],
          properties: {
            uid: { type: "string", minLength: 1, example: "A1B2C3D4" },
            eventType: { type: "string", enum: ["check_in", "check_out"], example: "check_in" },
          },
        },
        UpdateAttendanceRuleRequest: {
          type: "object",
          properties: {
            earlyThreshold: { type: "integer", minimum: 0, maximum: 1439, example: 480 },
            presentThreshold: { type: "integer", minimum: 0, maximum: 1439, example: 540 },
            absentThreshold: { type: "integer", minimum: 0, maximum: 1439, example: 780 },
            schoolDays: {
              type: "array",
              items: { type: "integer", minimum: 0, maximum: 6 },
              example: [1, 2, 3, 4, 5],
            },
          },
        },
        CreateTermRequest: {
          type: "object",
          required: ["name", "startDate", "endDate"],
          properties: {
            name: { type: "string", example: "First Term" },
            startDate: { type: "string", format: "date", example: "2026-09-01" },
            endDate: { type: "string", format: "date", example: "2026-12-18" },
          },
        },
        CreateCalendarExceptionRequest: {
          type: "object",
          required: ["date", "type", "label"],
          properties: {
            date: { type: "string", format: "date", example: "2026-10-12" },
            type: { type: "string", enum: ["holiday", "makeup"], example: "holiday" },
            label: { type: "string", example: "Independence Day" },
          },
        },
        EditStudentRequest: {
          type: "object",
          description: "At least one field may be provided.",
          properties: {
            name: { type: "string", minLength: 2, example: "Grace Nkereuwem" },
            class: { type: "string", minLength: 1, example: "JSS 3" },
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
        StudentWithRelationship: {
          allOf: [
            { $ref: "#/components/schemas/Student" },
            {
              type: "object",
              properties: {
                relationship: { type: "string", example: "Father" },
              },
            },
          ],
        },
        Guardian: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            phoneNumber: { type: "string" },
            notificationPreference: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        GuardianWithRelationship: {
          allOf: [
            { $ref: "#/components/schemas/Guardian" },
            {
              type: "object",
              properties: {
                relationship: { type: "string", example: "Mother" },
              },
            },
          ],
        },
        StudentGuardianLink: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            studentId: { type: "string", format: "uuid" },
            guardianId: { type: "string", format: "uuid" },
            relationship: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Card: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            schoolId: { type: "string", format: "uuid" },
            studentId: { type: "string", format: "uuid" },
            uid: { type: "string" },
            status: { type: "string", enum: ["active", "revoked"], example: "active" },
            revokedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Device: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            schoolId: { type: "string", format: "uuid" },
            locationName: { type: "string" },
            latitude: { type: "number", nullable: true },
            longitude: { type: "number", nullable: true },
            status: { type: "string", enum: ["active", "disabled"], example: "active" },
            secretHash: { type: "string", description: "Hashed secret. Never exposed to clients." },
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
        CardResponse: {
          type: "object",
          required: ["card"],
          properties: {
            card: { $ref: "#/components/schemas/Card" },
          },
        },
        DeviceResponse: {
          type: "object",
          required: ["device"],
          properties: {
            device: { $ref: "#/components/schemas/Device" },
          },
        },
        DeviceWithSecretResponse: {
          type: "object",
          required: ["device", "secret"],
          properties: {
            device: { $ref: "#/components/schemas/Device" },
            secret: { type: "string", description: "Raw device secret returned only once after registration or reset" },
          },
        },
        DeviceListResponse: {
          type: "object",
          required: ["devices"],
          properties: {
            devices: { type: "array", items: { $ref: "#/components/schemas/Device" } },
          },
        },
        AttendanceEvent: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            studentId: { type: "string", format: "uuid" },
            cardId: { type: "string", format: "uuid" },
            deviceId: { type: "string", format: "uuid" },
            eventType: { type: "string", enum: ["check_in", "check_out"] },
            readerLocation: { type: "string", nullable: true },
            timestamp: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            student: {
              type: "object",
              properties: {
                name: { type: "string" },
                class: { type: "string" },
                admissionNumber: { type: "string" },
              },
            },
          },
        },
        AttendanceRule: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            schoolId: { type: "string", format: "uuid" },
            earlyThreshold: { type: "integer", nullable: true },
            presentThreshold: { type: "integer", nullable: true },
            absentThreshold: { type: "integer", nullable: true },
            schoolDays: { type: "array", items: { type: "integer" } },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AttendanceEventResponse: {
          type: "object",
          required: ["event"],
          properties: {
            event: { $ref: "#/components/schemas/AttendanceEvent" },
          },
        },
        AttendanceEventListResponse: {
          type: "object",
          required: ["events", "pagination"],
          properties: {
            events: { type: "array", items: { $ref: "#/components/schemas/AttendanceEvent" } },
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
        AttendanceRuleResponse: {
          type: "object",
          required: ["attendanceRule"],
          properties: {
            attendanceRule: { $ref: "#/components/schemas/AttendanceRule" },
          },
        },
        CalendarException: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            schoolId: { type: "string", format: "uuid" },
            date: { type: "string", format: "date" },
            type: { type: "string", enum: ["holiday", "makeup"] },
            label: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CalendarExceptionResponse: {
          type: "object",
          required: ["exception"],
          properties: {
            exception: { $ref: "#/components/schemas/CalendarException" },
          },
        },
        CalendarExceptionListResponse: {
          type: "object",
          required: ["exceptions"],
          properties: {
            exceptions: { type: "array", items: { $ref: "#/components/schemas/CalendarException" } },
          },
        },
        Term: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            schoolId: { type: "string", format: "uuid" },
            name: { type: "string" },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TermResponse: {
          type: "object",
          required: ["term"],
          properties: {
            term: { $ref: "#/components/schemas/Term" },
          },
        },
        TermListResponse: {
          type: "object",
          required: ["terms"],
          properties: {
            terms: { type: "array", items: { $ref: "#/components/schemas/Term" } },
          },
        },
        DashboardStudentSummary: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            class: { type: "string" },
            admissionNumber: { type: "string" },
            timingStatus: { type: "string", example: "present" },
            presenceStatus: { type: "string", example: "signed_in" },
            lastEventTime: { type: "string", format: "date-time", nullable: true },
            lastLocation: { type: "string", nullable: true },
          },
        },
        DashboardTodayResponse: {
          type: "object",
          required: ["date", "counts", "students"],
          properties: {
            date: { type: "string", format: "date-time" },
            counts: {
              type: "object",
              properties: {
                early: { type: "integer" },
                present: { type: "integer" },
                late: { type: "integer" },
                absent: { type: "integer" },
                unknown: { type: "integer" },
              },
            },
            students: { type: "array", items: { $ref: "#/components/schemas/DashboardStudentSummary" } },
          },
        },
        GuardianResponse: {
          type: "object",
          required: ["guardian"],
          properties: {
            guardian: { $ref: "#/components/schemas/Guardian" },
          },
        },
        StudentGuardianLinkResponse: {
          type: "object",
          required: ["link"],
          properties: {
            link: { $ref: "#/components/schemas/StudentGuardianLink" },
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
        GuardianListResponse: {
          type: "object",
          required: ["guardians"],
          properties: {
            guardians: { type: "array", items: { $ref: "#/components/schemas/GuardianWithRelationship" } },
          },
        },
        StudentWithRelationshipListResponse: {
          type: "object",
          required: ["students"],
          properties: {
            students: { type: "array", items: { $ref: "#/components/schemas/StudentWithRelationship" } },
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
