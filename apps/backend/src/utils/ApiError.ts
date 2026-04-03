export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly code?: string;

  constructor(statusCode: number, message: string, details?: unknown, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}
