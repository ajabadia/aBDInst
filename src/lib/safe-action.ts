import { auth } from "@/auth";
import { z } from "zod";
import { AppError, ValidationError, AuthError } from "./errors";
import { logEvent, generateCorrelationId } from "./logger";

/**
 * Standard response format for all Server Actions
 */
export type ActionResponse<T> = {
    data?: T;
    error?: string;
    code?: string;
    success: boolean;
};

/**
 * A wrapper to handle authentication, validation, and error management consistently.
 */
export function createSafeAction<TInput, TOutput>(
    schema: z.ZodSchema<TInput>,
    action: (data: TInput, userId: string, role: string, correlationId: string) => Promise<TOutput>,
    options: { protected?: boolean; allowedRoles?: string[]; name?: string } = { protected: true }
): (data: TInput) => Promise<ActionResponse<TOutput>> {
    const actionName = options.name || 'ANONYMOUS_ACTION';

    return async (input: TInput): Promise<ActionResponse<TOutput>> => {
        const correlationId = generateCorrelationId();
        const start = Date.now();

        try {
            // 1. Validation FIRST
            const validatedInput = schema.parse(input);

            // 2. Authentication Check
            let userId = "";
            let userRole = "normal";

            if (options.protected !== false) {
                const session = await auth();
                if (!session?.user?.id) {
                    throw new AuthError("Inicia sesión para continuar");
                }
                userId = session.user.id;
                userRole = (session.user as any).role || "normal";

                // 3. Role Authorization
                if (options.allowedRoles && !options.allowedRoles.includes(userRole)) {
                    throw new AuthError("Privilegios insuficientes");
                }
            }

            // 4. Log Execution Start
            await logEvent({
                nivel: 'INFO',
                origen: 'SAFE_ACTION',
                accion: actionName,
                mensaje: `Iniciando ejecución`,
                correlacion_id: correlationId,
                detalles: { userId, userRole }
            });

            // 5. Execute Action
            const result = await action(validatedInput, userId, userRole, correlationId);

            const duration = Date.now() - start;
            await logEvent({
                nivel: 'INFO',
                origen: 'SAFE_ACTION',
                accion: `${actionName}_SUCCESS`,
                mensaje: `Completado exitosamente en ${duration}ms`,
                correlacion_id: correlationId,
                detalles: { duration_ms: duration }
            });

            return { success: true, data: result };

        } catch (error: any) {
            const duration = Date.now() - start;
            let errorMessage = error.message || "Error interno del servidor";
            let errorCode = "INTERNAL_ERROR";
            let statusCode = 500;

            if (error instanceof z.ZodError) {
                errorMessage = `Error de validación: ${error.issues.map(e => e.message).join(", ")}`;
                errorCode = 'VALIDATION_ERROR';
                statusCode = 400;
            } else if (error instanceof AppError) {
                errorMessage = error.message;
                errorCode = error.code;
                statusCode = error.statusCode;
            }

            await logEvent({
                nivel: statusCode >= 500 ? 'ERROR' : 'WARN',
                origen: 'SAFE_ACTION',
                accion: `${actionName}_FAIL`,
                mensaje: errorMessage,
                correlacion_id: correlationId,
                detalles: {
                    duration_ms: duration,
                    code: errorCode,
                    status: statusCode,
                    details: error.details
                },
                stack: statusCode >= 500 ? error.stack : undefined
            });

            return {
                success: false,
                error: errorMessage,
                code: errorCode
            };
        }
    };
}
