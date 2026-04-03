import { ApiError } from "@/utils/ApiError";
import type { RequestContext } from "@/types/api";

export function getTenantContext(context: RequestContext | undefined): RequestContext {
  if (!context) {
    throw new ApiError(401, "Missing request context");
  }

  return context;
}
