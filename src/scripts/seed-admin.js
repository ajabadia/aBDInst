const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Helper to define User model in CommonJS since we can't easily import the TS model without transpilation
const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, select: false },
    image: { type: String },
    emailVerified: { type: Date, default: null },
    role: {
        type: String,
        enum: ['admin', 'editor', 'normal'],
        default: 'normal'
    },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const uri = "mongodb://root:example@127.0.0.1:27017/?authSource=admin";

async function seed() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB for seeding...");

        const email = 'admin@instrumentcollector.com';
        const password = 'admin';

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Admin user already exists.');
            await mongoose.disconnect();
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
        console.log('Email:', email);
        console.log('Password:', password);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
