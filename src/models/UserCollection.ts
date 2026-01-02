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

    marketValue: {
        current: { type: Number },
        currency: { type: String, default: 'EUR' },
        lastUpdated: { type: Date, default: Date.now },
        history: [{
            date: { type: Date, required: true },
            value: { type: Number, required: true }
        }]
    },

    // Timeline / Activity Feed
    events: [{
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ['acquisition', 'maintenance', 'status_change', 'market_value', 'performance', 'note'], required: true },
        title: { type: String, required: true },
        description: { type: String }
    }],

    deletedAt: { type: Date },

    // Loan Tracker
    loan: {
        active: { type: Boolean, default: false },
        loanee: { type: String },
        date: { type: Date },
        expectedReturn: { type: Date },
        notes: { type: String }
    },
    // Personal images/docs separate from the master instrument images
    images: [{
        url: { type: String },
        provider: { type: String }, // cloudinary, drive, etc.
        path: { type: String }, // Internal path in provider
        type: { type: String }, // front, back, invoice
        uploadedAt: { type: Date, default: Date.now },
        isPrimary: { type: Boolean, default: false }
    }],

    documents: [{
        url: { type: String },
        type: { type: String } // invoice, manual, warranty
    }],

    maintenanceHistory: [{
        date: { type: Date, required: true },
        type: { type: String, required: true }, // 'repair', 'modification', 'cleaning', 'setup'
        description: { type: String, required: true },
        cost: { type: Number },
        technician: { type: String },
        documents: [{ url: String, title: String }]
    }],

    // Proactive Maintenance
    nextMaintenanceDate: { type: Date },
    maintenanceInterval: { type: String }, // e.g., '3m', '6m', '1y'
    maintenanceNotes: { type: String },

    // Custom tags for flexible organization
    tags: [{ type: String, trim: true, lowercase: true }]

}, { timestamps: true });

// Index for quick lookup of a user's collection
UserCollectionSchema.index({ userId: 1, status: 1 });

const UserCollection = models?.UserCollection || model('UserCollection', UserCollectionSchema);

export default UserCollection;
