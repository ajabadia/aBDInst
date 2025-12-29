import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
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

const User = models?.User || model('User', UserSchema);

export default User;
