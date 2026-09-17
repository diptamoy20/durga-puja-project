"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translatePrismaError = translatePrismaError;
const service_exception_util_1 = require("./service-exception.util");
/**
 * Translates Prisma's known request errors into a ServiceException with a
 * meaningful status and message.
 *
 * Without this, a duplicate email surfaces as a 500 with driver internals in
 * the body. Raw database errors must never reach the client.
 */
const FIELD_LABELS = {
    email: 'email address',
    username: 'username',
    employee_id: 'employee ID',
    slug: 'slug',
    registration_no: 'registration number',
    committee_id: 'committee ID',
    permission_key: 'permission key',
    registration_code: 'registration code',
    file_path: 'file path',
};
function isPrismaKnownError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        typeof error.code === 'string' &&
        /^P\d{4}$/.test(error.code));
}
function describeTarget(target) {
    if (!target)
        return 'value';
    const fields = Array.isArray(target) ? target : [target];
    const labels = fields
        // Prisma reports the constraint name for composite uniques; strip the noise.
        .map((field) => field.replace(/^.*_/, ''))
        .map((field) => FIELD_LABELS[field] ?? field.replace(/_/g, ' '));
    return labels.join(' and ');
}
/**
 * Rethrows `error` as a ServiceException when it is a recognised Prisma
 * failure; otherwise rethrows it unchanged for the caller's catch-all.
 */
function translatePrismaError(error, resource = 'record') {
    if (!isPrismaKnownError(error)) {
        throw error;
    }
    switch (error.code) {
        // Unique constraint violation
        case 'P2002':
            throw service_exception_util_1.ServiceException.conflict(`A ${resource} with this ${describeTarget(error.meta?.target)} already exists.`, { field: error.meta?.target });
        // Foreign key constraint violation
        case 'P2003':
            throw service_exception_util_1.ServiceException.badRequest('A referenced record does not exist.', { field: error.meta?.field_name });
        // Constraint failed (check constraints, etc.)
        case 'P2004':
            throw service_exception_util_1.ServiceException.badRequest('A database constraint rejected this value.');
        // Required relation violation
        case 'P2014':
            throw service_exception_util_1.ServiceException.badRequest('This change would break a required relationship between records.');
        // Record not found (update/delete on a missing row)
        case 'P2025':
            throw service_exception_util_1.ServiceException.notFound(`The ${resource} was not found.`);
        // Invalid value for a field
        case 'P2000':
            throw service_exception_util_1.ServiceException.badRequest('A value was too long for its field.');
        default:
            throw service_exception_util_1.ServiceException.internal('A database error occurred.');
    }
}
