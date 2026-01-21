import { Schema, model, models } from 'mongoose';

const InstrumentSchema = new Schema({
    type: { type: String, required: true }, // e.g., 'synthesizer', 'drum_machine'
    subtype: { type: String }, // e.g., 'analog', 'digital', 'eurorack'
    brand: { type: String, required: true },
    model: { type: String, required: true },
    version: { type: String },
    years: [{ type: String }], // Array of strings to support ranges or multiple years

    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'archived', 'rejected'],
        default: 'published'
    },
    statusHistory: [{
        status: String,
        changedBy: { type: String, ref: 'User' },
        date: { type: Date, default: Date.now },
        note: String
    }],

    // Dynamic specifications
    specs: [{
        category: { type: String, required: true },
        label: { type: String, required: true },
        value: { type: String, required: true }
    }],

    description: { type: String },
    websites: [{
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false }
    }],
    reverbUrl: { type: String },
    genericImages: [{ type: String }], // URLs to images

    // Documentation
    documents: [{
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String } // 'pdf', 'manual', 'patch_list', etc.
    }],

    // Unified Pricing & Market Value
    marketValue: {
        // Original Launch Price (Static)
        original: {
            price: { type: Number },
            currency: { type: String, default: 'USD' },
            year: { type: Number }
        },

        // Current Market Estimation (Snapshot)
        current: {
            value: { type: Number }, // Representative value (avg or specific)
            min: { type: Number },   // Low end of range
            max: { type: Number },   // High end of range
            currency: { type: String, default: 'EUR' },
            lastUpdated: { type: Date, default: Date.now },
            source: { type: String } // 'AI', 'User', 'Consensus'
        },

        // Historical Data Points
        history: [{
            date: { type: Date, required: true, default: Date.now },
            value: { type: Number, required: true },
            min: { type: Number }, // Optional range for this data point
            max: { type: Number }, // Optional range for this data point
            currency: { type: String, default: 'EUR' },
            source: { type: String }, // e.g. 'User', 'Reverb', 'AI'
            notes: { type: String }
        }]
    },

    relatedTo: [{ type: Schema.Types.ObjectId, ref: 'Instrument' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },

    // Inheritance & Variants
    parentId: { type: Schema.Types.ObjectId, ref: 'Instrument' },
    variantLabel: { type: String }, // e.g., "Indigo Edition"
    excludedImages: [{ type: String }], // URLs of parent images to hide
    isBaseModel: { type: Boolean, default: false },

    // Musical Context (for enrichment)
    artists: [{
        name: { type: String, required: true },
        key: { type: String }, // slug (e.g., "kraftwerk")
        yearsUsed: { type: String }, // e.g., "1974-1982" or "early 80s"
        notes: { type: String }
    }],
    albums: [{
        title: { type: String, required: true },
        artist: { type: String, required: true },
        year: { type: Number },
        notes: { type: String } // e.g., "used on track X"
    }],
}, {
    timestamps: true,
    // ensure unique combination of brand + model + version? 
    // Let's enforce it to prevent duplicates
});

// Compound index for uniqueness
InstrumentSchema.index({ brand: 1, model: 1, version: 1 }, { unique: true });

// Text indices for performant search
InstrumentSchema.index({ brand: 'text', model: 'text', description: 'text' });

// Single field indices for filtering and sorting
InstrumentSchema.index({ type: 1 });
InstrumentSchema.index({ 'marketValue.current.value': 1 });

// Generic hotfix for Next.js dev mode: reload model if schema changed
if (process.env.NODE_ENV === 'development' && models.Instrument) {
    delete (models as any).Instrument;
}

const Instrument = models?.Instrument || model('Instrument', InstrumentSchema);

export default Instrument;
