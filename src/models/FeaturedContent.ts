import { Schema, model, models } from 'mongoose';

const FeaturedContentSchema = new Schema({
    type: {
        type: String,
        enum: ['article', 'instrument'],
        required: true
    },
    title: { type: String, required: true }, // Snapshot of title for history

    // Polymorphic reference
    referenceId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'modelType'
    },
    modelType: {
        type: String,
        required: true,
        enum: ['Article', 'Instrument']
    },

    slot: {
        type: String,
        enum: ['hero_article', 'instrument_spotlight'],
        required: true
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Optional: If null, runs until replaced or manually stopped? Actually user said "fecha de lanzamiento y de fin". Let's assume mandatory or "forever" if null.

    active: { type: Boolean, default: true }, // Manual override to kill it early

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Index for efficient querying of active items
FeaturedContentSchema.index({ slot: 1, startDate: 1, endDate: 1, active: 1 });

const FeaturedContent = models?.FeaturedContent || model('FeaturedContent', FeaturedContentSchema);
export default FeaturedContent;
