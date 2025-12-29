import mongoose from 'mongoose';
import User from '../models/User';
import dbConnect from '../lib/db';
import bcrypt from 'bcryptjs';

async function seed() {
    await dbConnect();

    const email = 'admin@example.com';
    const password = 'admin';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        console.log('Admin user already exists.');
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        name: 'Admin User',
        email,
        password: hashedPassword,
        role: 'admin',
    });

    console.log('Admin user created successfully.');
    console.log('Email: admin@example.com');
    console.log('Password: admin');
}

seed()
    .then(() => {
        console.log('Seeding complete.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
