import { Schema, model, models } from 'mongoose';

const InstrumentSchema = new Schema({
    type: { type: String, required: true }, // e.g., 'synthesizer', 'drum_machine'
    subtype: { type: String }, // e.g., 'analog', 'digital', 'eurorack'
    brand: { type: String, required: true },
    model: { type: String, required: true },
    version: { type: String },
    years: [{ type: String }], // Array of strings to support ranges or multiple years

    // Flexible specifications block
    specs: {
        polyphony: { type: Number },
        oscillators: { type: Number },
        filters: [{
            type: { type: String }, // e.g., 'LPF', 'HPF'
            cutoff: { type: Number }
        }],
        sequencer: { type: Boolean, default: false },
        inputs: { type: Number },
        outputs: { type: Number },
        midi: { type: Boolean, default: false },
        dimensions: { type: String },
        weight: { type: Number },
        // Allow other arbitrary fields in specs
    },

    description: { type: String },
    genericImages: [{ type: String }], // URLs to images

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
