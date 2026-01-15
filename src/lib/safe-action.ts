import { auth } from "@/auth";
import { z } from "zod";

/**
 * Standard response format for all Server Actions
 */
export type ActionResponse<T> = {
    data?: T;
    error?: string;
    success: boolean;
};

/**
 * A wrapper to handle authentication, validation, and error management consistently.
 */
export async function createSafeAction<TInput, TOutput>(
    schema: z.ZodSchema<TInput>,
    action: (data: TInput, userId: string, role: string) => Promise<TOutput>,
    options: { protected?: boolean; allowedRoles?: string[] } = { protected: true }
): Promise<(data: TInput) => Promise<ActionResponse<TOutput>>> {
    return async (input: TInput): Promise<ActionResponse<TOutput>> => {
        try {
            // 1. Validation
            const validatedInput = schema.parse(input);

            // 2. Authentication Check
            let userId = "";
            let userRole = "normal";

            if (options.protected !== false) {
                const session = await auth();
                if (!session?.user?.id) {
                    return { success: false, error: "No autorizado: Inicia sesión para continuar" };
                }
                userId = session.user.id;
                userRole = (session.user as any).role || "normal";

                // 3. Role Authorization
                if (options.allowedRoles && !options.allowedRoles.includes(userRole)) {
                    return { success: false, error: "Acceso denegado: Privilegios insuficientes" };
                }
            }

            // 4. Execute Action
            const result = await action(validatedInput, userId, userRole);
            return { success: true, data: result };

        } catch (error: any) {
            console.error("Action Error:", error);
            
            if (error instanceof z.ZodError) {
                return { success: false, error: `Error de validación: ${error.issues.map(e => e.message).join(", ")}` };
            }

            return { success: false, error: error.message || "Error interno del servidor" };
        }
    };
}
