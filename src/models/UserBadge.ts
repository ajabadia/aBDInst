
import { Schema, model, models } from 'mongoose';

const UserBadgeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badgeCode: { type: String, required: true }, // Referencing Badge.code (e.g. 'CONTRIB_1')
    badgeId: { type: Schema.Types.ObjectId, ref: 'Badge' }, // Optional direct link
    awardedAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed } // e.g. { instrumentId: '...' }
}, { timestamps: true });

// Compound index to prevent duplicate badges of same type per user
UserBadgeSchema.index({ userId: 1, badgeCode: 1 }, { unique: true });

const UserBadge = models?.UserBadge || model('UserBadge', UserBadgeSchema);

export default UserBadge;
