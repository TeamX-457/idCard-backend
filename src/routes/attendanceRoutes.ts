import { Router } from "express";
import { deviceAuth } from "../middleware/deviceAuth.js";
import { validate } from "../middleware/validator.js";
import { createAttendanceEventSchema } from "../utils/validator.js";
import { createAttendanceEvent } from "../controllers/attendanceController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { listAttendanceEvents } from "../controllers/attendanceController.js";

const router = Router();

/**
 * @openapi
 * /attendance:
 *   post:
 *     tags: [Attendance]
 *     summary: Record a student attendance event
 *     description: Accepts a device-authenticated check-in or check-out event, verifies the card belongs to the school's active cards, and updates the daily attendance status when appropriate.
 *     security: []
 *     parameters:
 *       - name: x-device-id
 *         in: header
 *         required: true
 *         description: ID of the registered attendance device
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: x-device-secret
 *         in: header
 *         required: true
 *         description: Secret for the registered attendance device
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttendanceEventRequest'
 *     responses:
 *       201:
 *         description: Attendance event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceEventResponse'
 *       200:
 *         description: Duplicate attendance event; the original event is returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceEventDuplicateResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/",
  deviceAuth,
  validate(createAttendanceEventSchema),
  asyncHandler(createAttendanceEvent)
);

/**
 * @openapi
 * /attendance:
 *   get:
 *     tags: [Attendance]
 *     summary: List attendance events
 *     description: Returns the authenticated school's attendance history with pagination and optional filters by student, event type, and date range.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number, starting at 1
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of records per page, from 1 to 100
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *       - name: studentId
 *         in: query
 *         description: Filter by a student UUID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: eventType
 *         in: query
 *         description: Filter by event type
 *         schema:
 *           type: string
 *           enum: [check_in, check_out]
 *       - name: startDate
 *         in: query
 *         description: Inclusive start date for filtering events (ISO date or datetime string)
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: endDate
 *         in: query
 *         description: Inclusive end date for filtering events (ISO date or datetime string)
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Attendance history returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceEventListResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  "/",
  requireAuth,
  asyncHandler(listAttendanceEvents)
);

export default router;