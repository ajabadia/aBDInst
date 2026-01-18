
import { Schema, model, models } from 'mongoose';

const BadgeSchema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String }, // Cloudinary URL
    icon: { type: String }, // Lucide icon name (fallback)
    category: {
        type: String,
        enum: ['milestone', 'community', 'special', 'instrument'],
        default: 'milestone'
    },
    criteria: { type: Schema.Types.Mixed }, // Flexible criteria for auto-award
    active: { type: Boolean, default: true }
}, { timestamps: true });

const Badge = models?.Badge || model('Badge', BadgeSchema);

export default Badge;
