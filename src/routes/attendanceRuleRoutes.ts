import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validator.js";
import { updateAttendanceRuleSchema } from "../utils/validator.js";
import { getAttendanceRule, updateAttendanceRule } from "../controllers/attendanceRuleController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

/**
 * @openapi
 * /attendance-rules:
 *   get:
 *     tags: [Attendance]
 *     summary: Get the school's attendance rule
 *     description: Returns the authenticated school's attendance thresholds and configured school days, creating the rule record if it does not yet exist.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance rule returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceRuleResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", requireAuth, asyncHandler(getAttendanceRule));

/**
 * @openapi
 * /attendance-rules:
 *   patch:
 *     tags: [Attendance]
 *     summary: Update the school's attendance rule
 *     description: "Merges the supplied values with the stored attendance rule and validates the threshold ordering: early < present < absent."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAttendanceRuleRequest'
 *     responses:
 *       200:
 *         description: Attendance rule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceRuleResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch("/", requireAuth, validate(updateAttendanceRuleSchema), asyncHandler(updateAttendanceRule));

export default router;