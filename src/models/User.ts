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
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    role: {
        type: String,
        enum: ['admin', 'editor', 'normal'],
        default: 'normal'
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    strikes: {
        type: Number,
        default: 0
    },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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
    dashboardLayout: {
        type: [{
            id: { type: String, required: true },
            visible: { type: Boolean, default: true },
            order: { type: Number, required: true }
        }],
        default: [] // Empty means use default layout
    }
}, { timestamps: true });

const User = models?.User || model('User', UserSchema);

export default User;
