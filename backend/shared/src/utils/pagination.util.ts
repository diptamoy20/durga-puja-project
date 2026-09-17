import { PaginatedResult, PaginationMeta } from '../interfaces/api-response.interface';

export interface PaginationInput {
  page?: number;
  perPage?: number;
}

const DEFAULT_PER_PAGE = 15;
const MAX_PER_PAGE = 100;

/** Translates page/perPage into Prisma's skip/take, clamped to safe bounds. */
export function toPrismaPagination(input: PaginationInput): {
  skip: number;
  take: number;
  page: number;
  perPage: number;
} {
  const page = Math.max(1, Math.trunc(input.page ?? 1));
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, Math.trunc(input.perPage ?? DEFAULT_PER_PAGE)));

  return { skip: (page - 1) * perPage, take: perPage, page, perPage };
}

export function buildPaginationMeta(page: number, perPage: number, total: number): PaginationMeta {
  const lastPage = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;

  return {
    page,
    perPage,
    total,
    lastPage,
    hasPreviousPage: page > 1,
    hasNextPage: page < lastPage,
  };
}

export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
  total: number,
): PaginatedResult<T> {
  return { items, pagination: buildPaginationMeta(page, perPage, total) };
}
