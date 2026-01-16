import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
    code: string;           // Unique ID: 'WELCOME_USER', 'PRICE_ALERT', etc.
    name: string;           // Human readable name: 'Bienvenida', 'Alerta de Precio'
    subject: string;        // E.g: "¡Hola {{name}}! Bienvenido"
    htmlBody: string;       // HTML with placeholders like {{link}}
    availableVariables: string[]; // ['name', 'link']
    emailAccountId?: string; // Reference to EmailAccount
    history: {
        subject: string;
        htmlBody: string;
        emailAccountId?: string;
        updatedAt: Date;
        updatedBy?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const EmailTemplateSchema = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    htmlBody: { type: String, required: true },
    availableVariables: [{ type: String }],
    emailAccountId: { type: String }, // Stored as ID string
    history: [{
        subject: String,
        htmlBody: String,
        emailAccountId: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: String
    }]
}, {
    timestamps: true
});

// Avoid model recompilation in Next.js dev mode
export default mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
