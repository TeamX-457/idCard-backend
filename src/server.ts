import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { logger } from "./middleware/logger.js";
import { errorHandler, AppError } from './middleware/errorHandler.js';
import authRouter from "./routes/authRoutes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./swagger.js";
import studentRouter from "./routes/studentRoutes.js";
import guardianRouter from "./routes/guardianRoutes.js";
import cardRouter from "./routes/cardRoutes.js";
import deviceRouter from "./routes/deviceRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import attendanceRuleRouter from "./routes/attendanceRuleRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import calendarRouter from "./routes/calendarRoutes.js";
import termRouter from "./routes/termRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(logger);

app.use("/auth", authRouter);
app.use("/students", studentRouter);
app.use("/guardians", guardianRouter);
app.use("/card", cardRouter);
app.use("/devices", deviceRouter);
app.use("/attendance", attendanceRouter);
app.use("/attendance-rules", attendanceRuleRouter);
app.use("/dashboard", dashboardRouter);
app.use("/calendar", calendarRouter);
app.use("/terms", termRouter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * @openapi
 * /:
 *   get:
 *     tags: [General]
 *     summary: Check that the API is running
 *     responses:
 *       200:
 *         description: API welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Welcome to id card's landing
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

app.get("/", (_req: Request, res: Response) => {
  res.json("Welcome to id card's landing" );
});

app.all("/{*splat}", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});