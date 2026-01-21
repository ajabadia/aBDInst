import { v4 as uuidv4 } from 'uuid';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEvent {
    nivel: LogLevel;
    origen: string;
    accion: string;
    mensaje: string;
    correlacion_id?: string;
    detalles?: any;
    stack?: string;
}

/**
 * Structured logger for the application.
 * In production, this can be integrated with external services (Axiom, Datadog, etc.).
 */
export async function logEvent(event: LogEvent) {
    const timestamp = new Date().toISOString();
    const correlationId = event.correlacion_id || 'system';

    const logEntry = {
        timestamp,
        ...event,
        correlacion_id: correlationId,
    };

    // Standard structured output
    const color = event.nivel === 'ERROR' ? '\x1b[31m' : event.nivel === 'WARN' ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
        `${color}[${event.nivel}]${reset} [${event.origen}] [${event.accion}] [ID:${correlationId}] ${event.mensaje}`,
        event.detalles ? JSON.stringify(event.detalles) : ''
    );

    if (event.stack && event.nivel === 'ERROR') {
        console.error(event.stack);
    }

    // TODO: Send to external logging service in production
}

/**
 * Generates a unique correlation ID for a request/action chain.
 */
export function generateCorrelationId(): string {
    return uuidv4();
}

/**
 * Measures execution time of a promise and logs it.
 */
export async function measurePerformance<T>(
    origen: string,
    accion: string,
    operation: () => Promise<T>,
    correlationId?: string
): Promise<T> {
    const start = Date.now();
    try {
        const result = await operation();
        const duration = Date.now() - start;

        // Log if it exceeds a common SLA threshold (e.g. 1000ms for heavy tasks)
        if (duration > 1000) {
            await logEvent({
                nivel: 'WARN',
                origen,
                accion: `${accion}_PERF`,
                mensaje: `Operación lenta detectada: ${duration}ms`,
                correlacion_id: correlationId,
                detalles: { duration_ms: duration }
            });
        }

        return result;
    } catch (error: any) {
        const duration = Date.now() - start;
        await logEvent({
            nivel: 'ERROR',
            origen,
            accion: `${accion}_FAIL`,
            mensaje: error.message,
            correlacion_id: correlationId,
            detalles: { duration_ms: duration },
            stack: error.stack
        });
        throw error;
    }
}
