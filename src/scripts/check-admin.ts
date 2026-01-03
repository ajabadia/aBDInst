
import mongoose from 'mongoose';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Simple inline schema to avoid import issues
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: { type: String, default: 'user' },
    isBanned: Boolean
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found');
        return;
    }
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'admin@instrumentcollector.com';
    const user = await User.findOne({ email });
    if (user) {
        console.log(`User found: ${user.name}`);
        console.log(`Role: ${user.role}`);
    } else {
        console.log('User not found');
    }
    await mongoose.disconnect();
}
main();
