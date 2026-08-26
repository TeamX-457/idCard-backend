import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validator.js";
import { registerDeviceSchema } from "../utils/validator.js";
import {
  registerDevice,
  listDevices,
  disableDevice,
  resetDeviceSecret,
} from "../controllers/deviceController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

/**
 * @openapi
 * /devices:
 *   post:
 *     tags: [Devices]
 *     summary: Register a device
 *     description: Creates a school device and returns a one-time raw secret to configure the physical device.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDeviceRequest'
 *     responses:
 *       201:
 *         description: Device created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceWithSecretResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/", requireAuth, validate(registerDeviceSchema), asyncHandler(registerDevice));

/**
 * @openapi
 * /devices:
 *   get:
 *     tags: [Devices]
 *     summary: List devices for the school
 *     description: Returns all devices belonging to the authenticated school.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Device list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", requireAuth, asyncHandler(listDevices));

/**
 * @openapi
 * /devices/{id}/disable:
 *   patch:
 *     tags: [Devices]
 *     summary: Disable a device
 *     description: Marks a registered device as disabled for the authenticated school.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Device UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Device disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch("/:id/disable", requireAuth, asyncHandler(disableDevice));

/**
 * @openapi
 * /devices/{id}/reset-secret:
 *   patch:
 *     tags: [Devices]
 *     summary: Reset a device secret
 *     description: Rotates the device secret and returns the new raw secret to reconfigure the physical device.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Device UUID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Secret reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceWithSecretResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch("/:id/reset-secret", requireAuth, asyncHandler(resetDeviceSecret));

export default router;