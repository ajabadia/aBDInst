import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceAlert extends Document {
    userId: mongoose.Types.ObjectId;
    instrumentId?: mongoose.Types.ObjectId; // Optional link to catalog item
    query: string;
    targetPrice?: number;
    currency: string;
    condition?: 'new' | 'used' | 'any';
    sources: string[]; // ['reverb', 'ebay', 'wallapop']
    isActive: boolean;
    lastChecked?: Date;
    triggerCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const PriceAlertSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instrumentId: { type: Schema.Types.ObjectId, ref: 'Instrument' },
    query: { type: String, required: true },
    targetPrice: { type: Number },
    currency: { type: String, default: 'EUR' },
    condition: { type: String, enum: ['new', 'used', 'any'], default: 'any' },
    sources: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastChecked: { type: Date },
    triggerCount: { type: Number, default: 0 },
}, {
    timestamps: true
});

export default mongoose.models.PriceAlert || mongoose.model<IPriceAlert>('PriceAlert', PriceAlertSchema);
