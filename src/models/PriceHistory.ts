import { Schema, model, models } from 'mongoose';

const PriceHistorySchema = new Schema({
    instrument: { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },
    platform: {
        type: String,
        enum: ['reverb', 'ebay', 'wallapop', 'mercadolibre'],
        required: true
    },
    minPrice: { type: Number },
    maxPrice: { type: Number },
    avgPrice: { type: Number },
    currency: { type: String, default: 'EUR' },
    listingCount: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

// Index for efficient trend queries
PriceHistorySchema.index({ instrument: 1, timestamp: -1 });

const PriceHistory = models?.PriceHistory || model('PriceHistory', PriceHistorySchema);
export default PriceHistory;
