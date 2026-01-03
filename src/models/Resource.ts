
import { Schema, model, models } from 'mongoose';

const ResourceSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        required: true,
        enum: ['patch', 'manual', 'audio', 'image', 'video', 'link', 'other']
    },
    subType: { type: String }, // e.g., 'syx', 'pdf', 'mp3', 'fxp'

    url: { type: String, required: true }, // Cloudinary URL or others
    publicId: { type: String }, // For deletion (Cloudinary public_id)
    sizeBytes: { type: Number },
    mimeType: { type: String },

    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Associations
    instrumentId: { type: Schema.Types.ObjectId, ref: 'Instrument' }, // If linked to Catalog Instrument (Public/Community)
    collectionItemId: { type: Schema.Types.ObjectId, ref: 'UserCollection' }, // If linked to private Collection Item

    visibility: {
        type: String,
        enum: ['private', 'public', 'followers'],
        default: 'private'
    },

    downloadCount: { type: Number, default: 0 },
}, { timestamps: true });

// Indexes for faster queries
ResourceSchema.index({ instrumentId: 1, visibility: 1 });
ResourceSchema.index({ collectionItemId: 1 });
ResourceSchema.index({ uploadedBy: 1 });

const Resource = models?.Resource || model('Resource', ResourceSchema);

export default Resource;
