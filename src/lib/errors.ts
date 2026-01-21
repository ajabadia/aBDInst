/**
 * Base class for all application errors.
 * Includes HTTP status code and machine-readable error codes.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: any;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Thrown when Zod validation fails.
 */
export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

/**
 * Thrown for authentication or session issues.
 */
export class AuthError extends AppError {
    constructor(message: string = 'No autorizado') {
        super(message, 401, 'AUTH_ERROR');
    }
}

/**
 * Thrown for database-related failures.
 */
export class DatabaseError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 500, 'DATABASE_ERROR', details);
    }
}

/**
 * Thrown when an external API (Discogs, Spotify, Reverb) fails.
 */
export class ExternalServiceError extends AppError {
    constructor(service: string, message: string, details?: any) {
        super(`Error en servicio externo (${service}): ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', details);
    }
}

/**
 * Thrown when a resource is not found.
 */
export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} no encontrado`, 404, 'NOT_FOUND');
    }
}
