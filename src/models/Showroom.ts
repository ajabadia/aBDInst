import mongoose, { Schema, Document, Model } from 'mongoose';

// Showroom V3: Slide Engine
export interface ISlide {
    _id?: string; // auto-generated
    type: 'image' | 'text';
    url?: string;     // For images
    text?: string;    // For text/placard
    caption?: string;
    layout?: 'cover' | 'contain' | 'split'; // For future layout control
}

export interface IShowroomItem {
    collectionId: mongoose.Types.ObjectId;
    publicNote?: string; // Legacy/Fallback
    placardText?: string; // Legacy/Fallback
    displayOrder: number;
    slides: ISlide[];
}

export interface IShowroom extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    coverImage?: string;
    description?: string;
    items: IShowroomItem[];
    theme: 'minimal' | 'dark' | 'glass' | 'boutique';
    isPublic: boolean; // Deprecated
    status: 'draft' | 'published' | 'archived';
    visibility: 'public' | 'private' | 'unlisted';
    kioskEnabled: boolean;
    privacy: {
        showPrices: boolean;
        showSerialNumbers: boolean;
        showAcquisitionDate: boolean;
        showStatus: boolean;
    };
    stats: {
        views: number;
        likes: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const SlideSchema = new Schema({
    type: { type: String, enum: ['image', 'text'], required: true },
    url: { type: String },
    text: { type: String },
    caption: { type: String },
    layout: { type: String, default: 'cover' }
});

const ShowroomSchema = new Schema<IShowroom>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    coverImage: { type: String },
    description: { type: String },
    items: [{
        collectionId: { type: Schema.Types.ObjectId, ref: 'UserCollection', required: true },
        publicNote: String,
        placardText: String,
        displayOrder: { type: Number, default: 0 },
        slides: { type: [SlideSchema], default: [] }
    }],
    theme: { type: String, enum: ['minimal', 'dark', 'glass', 'boutique'], default: 'minimal' },
    // Deprecated: isPublic (kept for migration, mapped to visibility)
    isPublic: { type: Boolean, default: true },

    // New V2 Fields
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'unlisted'],
        default: 'public'
    },
    kioskEnabled: { type: Boolean, default: true },

    privacy: {
        showPrices: { type: Boolean, default: false },
        showSerialNumbers: { type: Boolean, default: false },
        showAcquisitionDate: { type: Boolean, default: false },
        showStatus: { type: Boolean, default: false }
    },
    stats: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Prevent compiling model multiple times in dev
const Showroom: Model<IShowroom> = mongoose.models.Showroom || mongoose.model<IShowroom>('Showroom', ShowroomSchema);

export default Showroom;
