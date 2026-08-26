import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db.js";
import { AppError } from "./errorHandler.js";

// Extend Express's Request type so req.device is typed downstream
declare global {
  namespace Express {
    interface Request {
      device?: {
        id: string;
        schoolId: string;
        locationName: string;
      };
    }
  }
}

export const deviceAuth = async (req: Request, res: Response, next: NextFunction) => {
  const deviceId = req.header("x-device-id");
  const deviceSecret = req.header("x-device-secret");

  if (!deviceId || !deviceSecret) {
    throw new AppError("Device credentials required", 401);
  }

  const device = await prisma.device.findUnique({ where: { id: deviceId } });

  if (!device || device.status !== "active") {
    throw new AppError("Device not recognized", 401);
  }

  const valid = await bcrypt.compare(deviceSecret, device.secretHash);
  if (!valid) {
    throw new AppError("Device not recognized", 401);
  }

  req.device = {
    id: device.id,
    schoolId: device.schoolId,
    locationName: device.locationName,
  };

  next();
};