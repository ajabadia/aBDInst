import { Schema, model, models } from 'mongoose';

const InstrumentSchema = new Schema({
    type: { type: String, required: true }, // e.g., 'synthesizer', 'drum_machine'
    subtype: { type: String }, // e.g., 'analog', 'digital', 'eurorack'
    brand: { type: String, required: true },
    model: { type: String, required: true },
    version: { type: String },
    years: [{ type: String }], // Array of strings to support ranges or multiple years

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

    relatedTo: { type: Schema.Types.ObjectId, ref: 'Instrument' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
    // ensure unique combination of brand + model + version? 
    // Let's enforce it to prevent duplicates
});

// Compound index for uniqueness
InstrumentSchema.index({ brand: 1, model: 1, version: 1 }, { unique: true });

// Hotfix for Next.js dev mode: reload model if schema changed
if (models.Instrument && !models.Instrument.schema.paths.websites) {
    console.log('Detected outdated Instrument model (missing websites). Clearing cache...');
    delete (models as any).Instrument;
}

const Instrument = models?.Instrument || model('Instrument', InstrumentSchema);

export default Instrument;
