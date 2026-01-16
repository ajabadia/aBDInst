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
        const { getAndRenderEmail } = await import('@/lib/email-templates');

        const emailContent = await getAndRenderEmail('WELCOME_USER', {
            name,
            link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        });

        await sendEmail({
            to: email,
            ...emailContent
        });

        return { success: true };

    } catch (error: any) {
        console.error('Registration error:', error);
        return { success: false, error: error.message || 'Error al registrar usuario' };
    }
}
