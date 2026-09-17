import { ServiceException } from './service-exception.util';

/**
 * Translates Prisma's known request errors into a ServiceException with a
 * meaningful status and message.
 *
 * Without this, a duplicate email surfaces as a 500 with driver internals in
 * the body. Raw database errors must never reach the client.
 */
const FIELD_LABELS: Record<string, string> = {
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

interface PrismaKnownError {
  code: string;
  meta?: { target?: string[] | string; field_name?: string; cause?: string };
  message: string;
}

function isPrismaKnownError(error: unknown): error is PrismaKnownError {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as PrismaKnownError).code === 'string' &&
    /^P\d{4}$/.test((error as PrismaKnownError).code)
  );
}

function describeTarget(target: string[] | string | undefined): string {
  if (!target) return 'value';

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
export function translatePrismaError(error: unknown, resource = 'record'): never {
  if (!isPrismaKnownError(error)) {
    throw error;
  }

  switch (error.code) {
    // Unique constraint violation
    case 'P2002':
      throw ServiceException.conflict(
        `A ${resource} with this ${describeTarget(error.meta?.target)} already exists.`,
        { field: error.meta?.target },
      );

    // Foreign key constraint violation
    case 'P2003':
      throw ServiceException.badRequest(
        'A referenced record does not exist.',
        { field: error.meta?.field_name },
      );

    // Constraint failed (check constraints, etc.)
    case 'P2004':
      throw ServiceException.badRequest('A database constraint rejected this value.');

    // Required relation violation
    case 'P2014':
      throw ServiceException.badRequest(
        'This change would break a required relationship between records.',
      );

    // Record not found (update/delete on a missing row)
    case 'P2025':
      throw ServiceException.notFound(`The ${resource} was not found.`);

    // Invalid value for a field
    case 'P2000':
      throw ServiceException.badRequest('A value was too long for its field.');

    default:
      throw ServiceException.internal('A database error occurred.');
  }
}
