'use server';

import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const email = (formData.get('email') as string)?.toLowerCase();
        const password = formData.get('password') as string;

        if (!name || !email || !password) {
            return { success: false, error: 'Todos los campos son obligatorios' };
        }

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
            role: 'normal',
        });

        return { success: true };

    } catch (error: any) {
        console.error('Registration error:', error);
        return { success: false, error: error.message || 'Error al registrar usuario' };
    }
}
