import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validator.js";
import { createGuardianSchema, attachStudentToGuardianSchema } from "../utils/validator.js";
import {
  createGuardian,
  getStudentsForGuardian,
  attachStudentToGuardian,
} from "../controllers/guardianController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

/**
 * @openapi
 * /guardians:
 *   post:
 *     tags: [Guardians]
 *     summary: Create a guardian
 *     description: Creates a guardian record without attaching it to a school.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGuardianRequest'
 *     responses:
 *       201:
 *         description: Guardian created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuardianResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", requireAuth, validate(createGuardianSchema), asyncHandler(createGuardian));

/**
 * @openapi
 * /guardians/{guardianId}/students:
 *   get:
 *     tags: [Guardians]
 *     summary: List students for a guardian
 *     description: Returns students linked to the guardian, limited to the authenticated user's school.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: guardianId
 *         in: path
 *         required: true
 *         description: Guardian UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Student list for the guardian
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentWithRelationshipListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:guardianId/students", requireAuth, asyncHandler(getStudentsForGuardian));

/**
 * @openapi
 * /guardians/{guardianId}/students:
 *   post:
 *     tags: [Guardians]
 *     summary: Attach a student to a guardian
 *     description: Creates the guardian-student relationship for the authenticated school.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: guardianId
 *         in: path
 *         required: true
 *         description: Guardian UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttachStudentToGuardianRequest'
 *     responses:
 *       201:
 *         description: Guardian-student link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentGuardianLinkResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/:guardianId/students",
  requireAuth,
  validate(attachStudentToGuardianSchema),
  asyncHandler(attachStudentToGuardian)
);

export default router;