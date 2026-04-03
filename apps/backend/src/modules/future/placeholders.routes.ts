import { Router } from "express";
import { sendSuccess } from "@/utils/response";

export const futureRouter = Router();

const modules = [
  "inventory",
  "table-management",
  "kitchen-display",
  "delivery",
  "loyalty",
  "analytics",
  "subscription-billing"
] as const;

for (const moduleName of modules) {
  futureRouter.get(`/${moduleName}`, (_req, res) => {
    sendSuccess(res, `${moduleName} module scaffold ready`, {
      module: moduleName,
      status: "scaffolded",
      phase: "future-ready"
    });
  });
}