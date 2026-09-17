"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPrismaPagination = toPrismaPagination;
exports.buildPaginationMeta = buildPaginationMeta;
exports.paginate = paginate;
const DEFAULT_PER_PAGE = 15;
const MAX_PER_PAGE = 100;
/** Translates page/perPage into Prisma's skip/take, clamped to safe bounds. */
function toPrismaPagination(input) {
    const page = Math.max(1, Math.trunc(input.page ?? 1));
    const perPage = Math.min(MAX_PER_PAGE, Math.max(1, Math.trunc(input.perPage ?? DEFAULT_PER_PAGE)));
    return { skip: (page - 1) * perPage, take: perPage, page, perPage };
}
function buildPaginationMeta(page, perPage, total) {
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
function paginate(items, page, perPage, total) {
    return { items, pagination: buildPaginationMeta(page, perPage, total) };
}
