import { Schema, model, models } from 'mongoose';

const ExhibitionSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    description: { type: String },
    bannerImage: { type: String },

    // Lifecycle
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Optional: null = indefinite

    status: {
        type: String,
        enum: ['draft', 'upcoming', 'active', 'ended', 'archived'],
        default: 'draft'
    },

    // Configuration
    type: {
        type: String,
        enum: ['showcase', 'contest'],
        default: 'showcase'
    },

    // Rules / Participation
    participationType: {
        type: String,
        enum: ['open', 'invite'],
        default: 'open'
    },

    // For contests
    votingEnabled: { type: Boolean, default: false },

    // Curated Content (if not user-submitted)
    featuredInstruments: [{ type: Schema.Types.ObjectId, ref: 'Instrument' }],

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Index for finding active exhibitions
ExhibitionSchema.index({ status: 1, startDate: 1, endDate: 1 });

const Exhibition = models?.Exhibition || model('Exhibition', ExhibitionSchema);
export default Exhibition;
