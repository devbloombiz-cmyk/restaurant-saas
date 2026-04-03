import type { NextFunction, Request, Response } from "express";
import { Logger } from "@/services/logger.service";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
	const startedAt = performance.now();

	res.on("finish", () => {
		const durationMs = Number((performance.now() - startedAt).toFixed(2));

		Logger.info({
			module: "http",
			message: "Request completed",
			request: {
				method: req.method,
				path: req.originalUrl,
				ip: req.ip,
				userId: req.context?.userId
			},
			tenantId: req.context?.tenantId,
			shopId: req.context?.shopId,
			metadata: {
				statusCode: res.statusCode,
				durationMs
			}
		});
	});

	next();
}
