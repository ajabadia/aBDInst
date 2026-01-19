import { Schema, model, models } from 'mongoose';

const UserMusicCollectionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    albumId: { type: Schema.Types.ObjectId, ref: 'MusicAlbum', required: true },

    status: {
        type: String,
        enum: ['active', 'sold', 'wishlist'],
        default: 'active'
    },

    condition: {
        type: String,
        enum: ['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good', 'Fair', 'Poor'],
        default: 'Near Mint'
    },

    mediaFormat: { type: String }, // redundant with album but allows user specifics e.g. "Limited Edition Blue Vinyl"

    acquisition: {
        date: { type: Date },
        price: { type: Number },
        currency: { type: String, default: 'EUR' },
        seller: { type: String },
        notes: { type: String }
    },

    images: [{
        url: { type: String },
        type: { type: String }, // 'cover', 'back', 'disk', 'gatefold'
        uploadedAt: { type: Date, default: Date.now }
    }],

    notes: { type: String },
    tags: [{ type: String, trim: true, lowercase: true }]

}, {
    timestamps: true
});

// Index for quick lookup of a user's collection
UserMusicCollectionSchema.index({ userId: 1, status: 1 });

if (process.env.NODE_ENV === 'development' && models.UserMusicCollection) {
    delete (models as any).UserMusicCollection;
}

const UserMusicCollection = models?.UserMusicCollection || model('UserMusicCollection', UserMusicCollectionSchema);

export default UserMusicCollection;
