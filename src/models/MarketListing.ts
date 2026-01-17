import { Schema, model, models } from 'mongoose';

const MarketListingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instrument: { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },
    collectionItem: { type: Schema.Types.ObjectId, ref: 'UserCollection', required: true }, // The specific item instance

    // Listing Details
    price: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    condition: {
        type: String,
        enum: ['mint', 'excellent', 'good', 'fair', 'poor'],
        required: true
    },
    description: { type: String, required: true },

    // Status
    status: {
        type: String,
        enum: ['active', 'sold', 'reserved', 'paused'],
        default: 'active'
    },

    // Analytics
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },

}, { timestamps: true });

// Indexes for search performance
MarketListingSchema.index({ status: 1, price: 1 });
MarketListingSchema.index({ user: 1 });

const MarketListing = models?.MarketListing || model('MarketListing', MarketListingSchema);
export default MarketListing;
