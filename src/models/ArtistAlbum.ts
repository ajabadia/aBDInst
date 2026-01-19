import mongoose, { Schema, Document, Model } from 'mongoose';

// Artist <-> Album relationship
export interface IArtistAlbum extends Document {
    artistId: mongoose.Types.ObjectId;
    albumId: mongoose.Types.ObjectId;
    role: 'main' | 'featured' | 'producer' | 'session' | 'composer';
    notes?: string;
    isVerified: boolean;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ArtistAlbumSchema = new Schema<IArtistAlbum>({
    artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
    albumId: { type: Schema.Types.ObjectId, ref: 'MusicAlbum', required: true },
    role: {
        type: String,
        enum: ['main', 'featured', 'producer', 'session', 'composer'],
        default: 'main'
    },
    notes: { type: String },
    isVerified: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Unique constraint (but allow multiple roles per artist-album)
ArtistAlbumSchema.index({ artistId: 1, albumId: 1, role: 1 }, { unique: true });

const ArtistAlbum: Model<IArtistAlbum> = mongoose.models.ArtistAlbum || mongoose.model<IArtistAlbum>('ArtistAlbum', ArtistAlbumSchema);

export default ArtistAlbum;
