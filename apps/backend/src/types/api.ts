export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  error: unknown;
};

export type RequestContext = {
  tenantId: string;
  shopId: string;
  role: import("@shared/types/roles").UserRole;
  userId: string;
};
