import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validator.js";
import { createCalendarExceptionSchema } from "../utils/validator.js";
import {
  listCalendarExceptions,
  createCalendarException,
  deleteCalendarException,
} from "../controllers/calendarController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

/**
 * @openapi
 * /calendar:
 *   get:
 *     tags: [Calendar]
 *     summary: List school calendar exceptions
 *     description: Returns all school-specific holiday or make-up calendar exceptions for the authenticated school, ordered by date ascending.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Calendar exceptions returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalendarExceptionListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", requireAuth, asyncHandler(listCalendarExceptions));

/**
 * @openapi
 * /calendar:
 *   post:
 *     tags: [Calendar]
 *     summary: Create a calendar exception
 *     description: Adds a school holiday or make-up date for the authenticated school. Duplicate dates for the same school are rejected.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCalendarExceptionRequest'
 *     responses:
 *       201:
 *         description: Calendar exception created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalendarExceptionResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/",
  requireAuth,
  validate(createCalendarExceptionSchema),
  asyncHandler(createCalendarException)
);

/**
 * @openapi
 * /calendar/{id}:
 *   delete:
 *     tags: [Calendar]
 *     summary: Delete a calendar exception
 *     description: Removes a calendar exception for the authenticated school.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Calendar exception UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Calendar exception deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete("/:id", requireAuth, asyncHandler(deleteCalendarException));

export default router;
