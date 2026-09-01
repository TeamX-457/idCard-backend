import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validator.js";
import { createTermSchema } from "../utils/validator.js";
import { listTerms, createTerm, deleteTerm } from "../controllers/termController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

/**
 * @openapi
 * /terms:
 *   get:
 *     tags: [Terms]
 *     summary: List school terms
 *     description: Returns all academic terms for the authenticated school, ordered from earliest to latest start date.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Terms returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TermListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", requireAuth, asyncHandler(listTerms));

/**
 * @openapi
 * /terms:
 *   post:
 *     tags: [Terms]
 *     summary: Create a school term
 *     description: Adds a new academic term and rejects overlapping date ranges within the same school.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTermRequest'
 *     responses:
 *       201:
 *         description: Term created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TermResponse'
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
router.post("/", requireAuth, validate(createTermSchema), asyncHandler(createTerm));

/**
 * @openapi
 * /terms/{id}:
 *   delete:
 *     tags: [Terms]
 *     summary: Delete a school term
 *     description: Removes a term that belongs to the authenticated school's academic calendar.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Term UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Term deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete("/:id", requireAuth, asyncHandler(deleteTerm));

export default router;
