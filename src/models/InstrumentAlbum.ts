import mongoose, { Schema, Document, Model } from 'mongoose';

// Instrument <-> Album relationship
export interface IInstrumentAlbum extends Document {
    instrumentId: mongoose.Types.ObjectId;
    albumId: mongoose.Types.ObjectId;
    notes?: string;
    tracks?: string[]; // Specific tracks where this instrument was used
    isVerified: boolean;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const InstrumentAlbumSchema = new Schema<IInstrumentAlbum>({
    instrumentId: { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },
    albumId: { type: Schema.Types.ObjectId, ref: 'MusicAlbum', required: true },
    notes: { type: String },
    tracks: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Unique constraint
InstrumentAlbumSchema.index({ instrumentId: 1, albumId: 1 }, { unique: true });

const InstrumentAlbum: Model<IInstrumentAlbum> = mongoose.models.InstrumentAlbum || mongoose.model<IInstrumentAlbum>('InstrumentAlbum', InstrumentAlbumSchema);

export default InstrumentAlbum;
