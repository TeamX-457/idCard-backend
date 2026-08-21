import { Router } from "express";
import { registerSchool, login } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validator.js";
import { registerSchoolSchema, loginSchema } from "../utils/validator.js";

const router = Router();

/**
 * @openapi
 * /auth/register-school:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a school and its administrator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterSchoolRequest'
 *     responses:
 *       201:
 *         description: School and administrator created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/register-school", 
  validate(registerSchoolSchema), 
  asyncHandler(registerSchool)
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/login", 
  validate(loginSchema), 
  asyncHandler(login)
);

export default router;