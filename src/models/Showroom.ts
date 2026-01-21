import mongoose, { Schema, Document, Model } from 'mongoose';

// Showroom V3: Slide Engine
export interface ISlide {
    _id?: string; // auto-generated
    type: 'image' | 'text' | 'poster';
    url?: string;     // For images
    text?: string;    // For text/placard
    caption?: string;
    layout?: string; // e.g. 'split', 'overlay', 'cover'
    duration?: number; // In seconds
    audioUrl?: string; // Voiceover or sound
    syncAudioDuration?: boolean; // If true, ignore duration and use audio length
    style?: {
        fontSize?: string; // e.g. 'text-2xl', 'text-5xl'
        fontWeight?: string; // e.g. 'font-normal', 'font-bold'
        fontFamily?: string; // e.g. 'font-sans', 'font-serif'
        textAlign?: string; // e.g. 'text-left', 'text-center'
        textColor?: string; // hex or tailwind class
    }
}

export interface IShowroomItem {
    collectionId: mongoose.Types.ObjectId;
    itemType: 'instrument' | 'music'; // Domain type
    collectionModel: 'UserCollection' | 'UserMusicCollection'; // For Mongoose refPath
    publicNote?: string; // Legacy/Fallback
    placardText?: string; // Legacy/Fallback
    attribution?: string; // e.g. "Prestado por Carlos R.", "Propiedad de ABD"
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
    type: { type: String, enum: ['image', 'text', 'poster'], required: true },
    url: { type: String },
    text: { type: String },
    caption: { type: String },
    layout: { type: String, default: 'cover' },
    duration: { type: Number, default: 10 },
    audioUrl: { type: String },
    syncAudioDuration: { type: Boolean, default: false },
    style: {
        fontSize: { type: String, default: 'text-2xl' },
        fontWeight: { type: String, default: 'font-normal' },
        fontFamily: { type: String, default: 'font-sans' },
        textAlign: { type: String, default: 'text-center' },
        textColor: { type: String }
    }
});

const ShowroomSchema = new Schema<IShowroom>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    coverImage: { type: String },
    description: { type: String },
    items: [{
        collectionId: { type: Schema.Types.ObjectId, required: true, refPath: 'items.collectionModel' },
        itemType: { type: String, enum: ['instrument', 'music'], default: 'instrument' },
        collectionModel: {
            type: String,
            required: true,
            enum: ['UserCollection', 'UserMusicCollection'],
            default: 'UserCollection'
        },
        publicNote: String,
        placardText: String,
        attribution: String,
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
