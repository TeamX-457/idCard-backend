import cron from "node-cron";
import { markAbsences } from "./markAbsences.js";

export function startScheduler() {
    cron.schedule("*/15 5-20 * * *", () => {
    markAbsences().catch((err) => console.error("markAbsences failed:", err));
    });
}