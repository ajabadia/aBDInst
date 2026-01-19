import mongoose, { Schema, Document, Model } from 'mongoose';

// Instrument <-> Artist relationship
export interface IInstrumentArtist extends Document {
    instrumentId: mongoose.Types.ObjectId;
    artistId: mongoose.Types.ObjectId;
    notes?: string;
    yearsUsed?: string; // e.g., "1974-1982"
    isVerified: boolean;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const InstrumentArtistSchema = new Schema<IInstrumentArtist>({
    instrumentId: { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },
    artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
    notes: { type: String },
    yearsUsed: { type: String },
    isVerified: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Unique constraint: one relationship per instrument-artist pair
InstrumentArtistSchema.index({ instrumentId: 1, artistId: 1 }, { unique: true });

const InstrumentArtist: Model<IInstrumentArtist> = mongoose.models.InstrumentArtist || mongoose.model<IInstrumentArtist>('InstrumentArtist', InstrumentArtistSchema);

export default InstrumentArtist;
