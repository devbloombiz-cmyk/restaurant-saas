export type PaginationInput = {
  page?: number;
  limit?: number;
};

export function normalizePagination(input: PaginationInput): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(input.page ?? 1));
  const limit = Math.min(200, Math.max(1, Number(input.limit ?? 50)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
