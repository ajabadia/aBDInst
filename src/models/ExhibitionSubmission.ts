import { Schema, model, models } from 'mongoose';

const ExhibitionSubmissionSchema = new Schema({
    exhibition: { type: Schema.Types.ObjectId, ref: 'Exhibition', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instrument: { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },

    // Custom content for this submission (why it fits the theme)
    notes: { type: String },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'winner'],
        default: 'pending'
    },

    // For contests
    votes: { type: Number, default: 0 },

    // Admin feedback
    adminFeedback: { type: String }

}, { timestamps: true });

// Prevent double submission of same instrument to same expo
ExhibitionSubmissionSchema.index({ exhibition: 1, instrument: 1 }, { unique: true });

const ExhibitionSubmission = models?.ExhibitionSubmission || model('ExhibitionSubmission', ExhibitionSubmissionSchema);
export default ExhibitionSubmission;
