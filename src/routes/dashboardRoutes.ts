import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getTodayDashboard } from "../controllers/dashboardController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

/**
 * @openapi
 * /dashboard/today:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get the school dashboard summary for today
 *     description: Returns the current day's roster, student attendance statuses, and summary counts for the authenticated school's students.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardTodayResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/today", requireAuth, asyncHandler(getTodayDashboard));

export default router;