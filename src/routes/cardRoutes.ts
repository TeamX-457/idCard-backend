import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validator.js";
import { assignCardSchema } from "../utils/validator.js";
import { assignCard, revokeCard } from "../controllers/cardController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

/**
 * @openapi
 * /card:
 *   post:
 *     tags: [Cards]
 *     summary: Assign a card to a student
 *     description: Creates an active card for a student in the authenticated school and prevents duplicate active UIDs in that school.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignCardRequest'
 *     responses:
 *       201:
 *         description: Card assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardResponse'
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
router.post("/", requireAuth, validate(assignCardSchema), asyncHandler(assignCard));

/**
 * @openapi
 * /card/{id}/revoke:
 *   patch:
 *     tags: [Cards]
 *     summary: Revoke a card
 *     description: Marks the card as revoked and sets the revoked timestamp for the authenticated school.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Card UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Card revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch("/:id/revoke", requireAuth, asyncHandler(revokeCard));

export default router;