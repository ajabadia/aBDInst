import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShowroomItem {
    collectionId: mongoose.Types.ObjectId;
    publicNote?: string;
    displayOrder: number;
}

export interface IShowroom extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    items: IShowroomItem[];
    theme: 'minimal' | 'dark' | 'glass' | 'boutique';
    isPublic: boolean;
    privacy: {
        showPrices: boolean;
        showSerialNumbers: boolean;
        showAcquisitionDate: boolean;
    };
    stats: {
        views: number;
        likes: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ShowroomSchema = new Schema<IShowroom>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    items: [{
        collectionId: { type: Schema.Types.ObjectId, ref: 'UserCollection', required: true },
        publicNote: String,
        displayOrder: { type: Number, default: 0 }
    }],
    theme: { type: String, enum: ['minimal', 'dark', 'glass', 'boutique'], default: 'minimal' },
    isPublic: { type: Boolean, default: true },
    privacy: {
        showPrices: { type: Boolean, default: false },
        showSerialNumbers: { type: Boolean, default: false },
        showAcquisitionDate: { type: Boolean, default: false }
    },
    stats: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Prevent compiling model multiple times in dev
const Showroom: Model<IShowroom> = mongoose.models.Showroom || mongoose.model<IShowroom>('Showroom', ShowroomSchema);

export default Showroom;
