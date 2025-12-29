import { Schema, model, models } from 'mongoose';

const UserCollectionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instrumentId: { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },

    status: {
        type: String,
        enum: ['active', 'sold', 'wishlist', 'repair'],
        default: 'active'
    },
    condition: {
        type: String,
        enum: ['new', 'excellent', 'good', 'fair', 'poor', 'for_parts'],
        default: 'good'
    },
    serialNumber: { type: String },

    acquisition: {
        date: { type: Date },
        price: { type: Number },
        currency: { type: String, default: 'EUR' },
        seller: { type: String },
        source: { type: String } // e.g. Reverb, eBay
    },

    sale: {
        date: { type: Date },
        price: { type: Number },
        buyer: { type: String }
    },

    customNotes: { type: String },

    // Personal images/docs separate from the master instrument images
    images: [{
        url: { type: String },
        provider: { type: String }, // cloudinary, drive, etc.
        type: { type: String } // front, back, invoice
    }],

    documents: [{
        url: { type: String },
        type: { type: String } // invoice, manual, warranty
    }]

}, { timestamps: true });

// Index for quick lookup of a user's collection
UserCollectionSchema.index({ userId: 1, status: 1 });

const UserCollection = models?.UserCollection || model('UserCollection', UserCollectionSchema);

export default UserCollection;
