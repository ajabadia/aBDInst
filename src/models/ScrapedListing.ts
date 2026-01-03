import mongoose, { Schema, Document } from 'mongoose';

export interface IScrapedListing extends Document {
    source: string; // 'reverb', 'ebay'
    externalId: string;
    title: string;
    price: number;
    currency: string;
    url: string;
    imageUrl?: string;
    condition?: string;
    location?: string;
    date: Date;
    query: string;
    isSold: boolean;
    createdAt: Date;
}

const ScrapedListingSchema: Schema = new Schema({
    source: { type: String, required: true },
    externalId: { type: String, required: true }, // Unique ID from the platform
    title: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    url: { type: String, required: true },
    imageUrl: { type: String },
    condition: { type: String },
    location: { type: String },
    date: { type: Date, default: Date.now },
    query: { type: String, required: true }, // The search term used to find this
    isSold: { type: Boolean, default: false },
}, {
    timestamps: true
});

// Compound index to avoid duplicates per source/id
ScrapedListingSchema.index({ source: 1, externalId: 1 }, { unique: true });
// TTL index to auto-delete old cache (e.g., 7 days)
ScrapedListingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export default mongoose.models.ScrapedListing || mongoose.model<IScrapedListing>('ScrapedListing', ScrapedListingSchema);
