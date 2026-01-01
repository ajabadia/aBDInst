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
});

export type InstrumentFormData = z.infer<typeof InstrumentSchema>;
