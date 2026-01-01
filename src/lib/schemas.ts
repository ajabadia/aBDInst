import { z } from 'zod';

// Helper schema for Specifications using the dynamic key-value pair structure
const SpecItemSchema = z.object({
    category: z.string().min(1, "La categoría es obligatoria"),
    label: z.string().min(1, "La etiqueta es obligatoria"),
    value: z.string().min(1, "El valor es obligatorio"),
});

// Validation schema for creating/updating an Instrument
export const InstrumentSchema = z.object({
    brand: z.string().min(1, "La marca es obligatoria"),
    model: z.string().min(1, "El modelo es obligatorio"),
    type: z.string().min(1, "El tipo es obligatorio"),
    subtype: z.string().optional(),
    version: z.string().optional(),
    description: z.string().optional(),
    websites: z.array(z.object({
        url: z.string().min(1, "La URL es obligatoria"),
        isPrimary: z.boolean().default(false)
    })).optional(),
    years: z.array(z.string()).optional(),
    specs: z.array(SpecItemSchema).optional(),
    genericImages: z.array(z.string().url("URL de imagen inválida")).optional(),
    documents: z.array(
        z.object({
            title: z.string().min(1, "El título del documento es obligatorio"),
            url: z.string().url("URL del documento inválida"),
            type: z.string().optional(),
        })
    ).optional(),
    relatedTo: z.string().optional(),
});

export const RegisterSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido").toLowerCase(),
    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export const LoginSchema = z.object({
    email: z.string().email("Email inválido").toLowerCase(),
    password: z.string().min(1, "La contraseña es obligatoria"),
});

export const UserProfileSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
    bio: z.string().max(500, "La bio no puede exceder los 500 caracteres").optional(),
    location: z.string().optional(),
    website: z.string().url("URL inválida").optional().or(z.literal("")),
    phone: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: z.string()
        .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
});

export type InstrumentFormData = z.infer<typeof InstrumentSchema>;
