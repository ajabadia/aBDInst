import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedia extends Document {
    userId: mongoose.Types.ObjectId;
    url: string;
    filename: string;
    type: 'image' | 'video' | 'audio' | 'document';
    category: 'instrument' | 'collection' | 'showroom' | 'profile' | 'kiosk';
    tags: string[];
    size: number;
    createdAt: Date;
    updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'audio', 'document'], default: 'image' },
    category: { type: String, default: 'collection' },
    tags: [String],
    size: Number,
}, { timestamps: true });

// Prevent compiling model multiple times in dev
const Media: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);

export default Media;
