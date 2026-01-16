
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

async function setAdmin(email: string) {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();
        console.log(`User ${email} is now an ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

const email = process.argv[2];
if (!email) {
    console.error('Please provide an email address');
    process.exit(1);
}

setAdmin(email);
