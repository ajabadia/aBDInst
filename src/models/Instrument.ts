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
    genericImages: [{ type: String }], // URLs to images

    // Documentation
    documents: [{
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String } // 'pdf', 'manual', 'patch_list', etc.
    }],

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
    // ensure unique combination of brand + model + version? 
    // Let's enforce it to prevent duplicates
});

// Compound index for uniqueness
InstrumentSchema.index({ brand: 1, model: 1, version: 1 }, { unique: true });

const Instrument = models?.Instrument || model('Instrument', InstrumentSchema);

export default Instrument;
