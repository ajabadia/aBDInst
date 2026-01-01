import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, select: false },
    image: { type: String },
    bio: { type: String, maxLength: 500 },
    location: { type: String },
    website: { type: String },
    phone: { type: String },
    emailVerified: { type: Date, default: null },
    role: {
        type: String,
        enum: ['admin', 'editor', 'normal'],
        default: 'normal'
    },
    storageProvider: {
        type: {
            type: String,
            enum: ['cloudinary', 'google-drive', 'dropbox', 'terabox', 'none'],
            default: 'none'
        },
        credentials: {
            type: String, // Encrypted JSON
            select: false
        },
        config: {
            type: Schema.Types.Mixed // Public config (e.g., cloudName)
        },
        status: {
            type: String,
            enum: ['not_configured', 'configured', 'error'],
            default: 'not_configured'
        },
        lastTested: { type: Date }
    },
}, { timestamps: true });

const User = models?.User || model('User', UserSchema);

export default User;
