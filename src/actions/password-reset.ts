'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function requestPasswordReset(email: string) {
    try {
        await dbConnect();

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Security: Don't reveal if user exists. 
            // Return success even if user not found, but log it internally.
            // Or return a specific message if UX > Security for this app context.
            // For now, let's be opaque.
            return { success: true, message: 'Si el email existe, recibirás instrucciones.' };
        }

        // Generate Token
        // 32 bytes hex string
        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save hashed token or raw token? 
        // Typically safe to save raw token in DB if it's just for reset, 
        // as long as DB is secure. For extra security we could hash it.
        // Let's store raw for simplicity but mark field select: false (done in schema).

        user.resetPasswordToken = token;
        user.resetPasswordExpires = tokenExpiry;
        await user.save();

        // Send Email using centralized service
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
        const { getAndRenderEmail } = await import('@/lib/email-templates');
        const emailContent = await getAndRenderEmail('PASSWORD_RESET', {
            name: user.name || 'Usuario',
            link: resetUrl
        });

        const result = await sendEmail({
            to: user.email,
            ...emailContent
        });

        if (!result.success) {
            console.error('Email Send Error inside requestPasswordReset:', result.error);
            return { success: true, message: 'Error enviando correo, contacta soporte.' };
        }

        return { success: true, message: 'Correo enviado correctamente' };
    } catch (error: any) {
        console.error('Password Reset Request Error:', error);
        return { success: false, error: 'Hubo un error al procesar tu solicitud.' };
    }
}

export async function resetPassword(token: string, password: string) {
    try {
        await dbConnect();

        // Find user with this token and ensure it hasn't expired
        // We need to query explicitly including the hidden fields if not using findOneAndUpdate with specific query
        // Actually, Mongoose findOne queries against the DB document even if select: false hides it in result, 
        // BUT we need to select it to check it? No, query filters work on DB fields.

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return { success: false, error: 'Token inválido o expirado' };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update User
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return { success: true, message: 'Contraseña actualizada correctamente' };

    } catch (error: any) {
        console.error('Password Reset Error:', error);
        return { success: false, error: 'No se pudo restablecer la contraseña.' };
    }
}
