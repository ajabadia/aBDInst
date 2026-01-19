import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArtist extends Document {
    name: string;
    slug: string;
    type: 'band' | 'solo' | 'group' | 'collective';
    bio?: string;
    image?: string;
    foundedYear?: number;
    disbandedYear?: number;
    genres: string[];
    country?: string;
    website?: string;
    socialLinks?: {
        spotify?: string;
        discogs?: string;
        wikipedia?: string;
        instagram?: string;
        youtube?: string;
    };
    isVerified: boolean;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ArtistSchema = new Schema<IArtist>({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: {
        type: String,
        enum: ['band', 'solo', 'group', 'collective'],
        default: 'band'
    },
    bio: { type: String },
    image: { type: String },
    foundedYear: { type: Number, min: 1900, max: new Date().getFullYear() },
    disbandedYear: { type: Number, min: 1900, max: new Date().getFullYear() + 10 },
    genres: [{ type: String }],
    country: { type: String },
    website: { type: String },
    socialLinks: {
        spotify: String,
        discogs: String,
        wikipedia: String,
        instagram: String,
        youtube: String
    },
    isVerified: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
ArtistSchema.index({ name: 'text', bio: 'text' });
ArtistSchema.index({ genres: 1 });
ArtistSchema.index({ foundedYear: 1 });

// Prevent model recompilation in dev
const Artist: Model<IArtist> = mongoose.models.Artist || mongoose.model<IArtist>('Artist', ArtistSchema);

export default Artist;
