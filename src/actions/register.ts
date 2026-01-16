'use server';

import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/lib/schemas";

export async function registerUser(formData: FormData) {
    try {
        const rawData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            confirmPassword: formData.get('confirmPassword') as string,
        };

        // Validate with Zod
        const validated = RegisterSchema.safeParse(rawData);
        if (!validated.success) {
            return {
                success: false,
                error: validated.error.issues.map(i => i.message).join(", ")
            };
        }

        const { name, email, password } = validated.data;

        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { success: false, error: 'El email ya está registrado' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Send Welcome Email
        const { sendEmail } = await import('@/lib/email');
        await sendEmail({
            to: email,
            subject: '¡Bienvenido a Instrument Collector!',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #007AFF;">Bienvenido, ${name}</h1>
                    <p>Gracias por crear tu cuenta en Instrument Collector.</p>
                    <p>Ahora puedes comenzar a documentar tu colección, escanear identificadores y analizar tus instrumentos con nuestra IA.</p>
                    <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 10px;">
                        <h3 style="margin-top: 0;">Siguientes pasos:</h3>
                        <ul style="padding-left: 20px;">
                            <li>Completa tu perfil de usuario.</li>
                            <li>Añade tu primer instrumento manualmente o usando el "Magic Importer".</li>
                            <li>Explora el catálogo global.</li>
                        </ul>
                    </div>
                    <p style="text-align: center;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ir a mi Dashboard</a>
                    </p>
                </div>
            `,
            channel: 'general'
        });

        return { success: true };

    } catch (error: any) {
        console.error('Registration error:', error);
        return { success: false, error: error.message || 'Error al registrar usuario' };
    }
}
