import crypto from "crypto";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../middleware/errorHandler.js";
import { requireSchoolAdmin } from "../utils/requireSchoolAdmin.js"

export const registerDevice = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const { locationName, latitude, longitude } = req.body;

  const secret = crypto.randomBytes(32).toString("hex");
  const secretHash = await bcrypt.hash(secret, 10);

  const device = await prisma.device.create({
    data: {
      schoolId,
      locationName,
      latitude,
      longitude,
      secretHash,
      status: "active",
    },
  });

  res.status(201).json({ device, secret });
};

export const listDevices = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);

  const devices = await prisma.device.findMany({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
  });

  res.json({ devices });
};

export const disableDevice = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const id = req.params.id as string;

  const device = await prisma.device.findUnique({ where: { id } });
  if (!device || device.schoolId !== schoolId) {
    throw new AppError("Device not found", 404);
  }

  if (device.status === "disabled") {
    throw new AppError("Device is already disabled", 409);
  }

  const updated = await prisma.device.update({
    where: { id },
    data: { status: "disabled" },
  });

  res.json({ device: updated });
};

export const resetDeviceSecret = async (req: Request, res: Response) => {
  const schoolId = requireSchoolAdmin(req);
  const id = req.params.id as string;

  const device = await prisma.device.findUnique({ where: { id } });
  if (!device || device.schoolId !== schoolId) {
    throw new AppError("Device not found", 404);
  }

  const secret = crypto.randomBytes(32).toString("hex");
  const secretHash = await bcrypt.hash(secret, 10);

  const updated = await prisma.device.update({
    where: { id },
    data: { secretHash },
  });

  // old secret is now invalid; caller must reconfigure the physical device
  res.json({ device: updated, secret });
};