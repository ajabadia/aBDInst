import { Schema, model, models } from 'mongoose';

export interface ICatalogMetadata {
    type: 'brand' | 'decade' | 'type';
    key: string; // The specific brand name (e.g., "Roland"), decade ("1980"), or type ("Synthesizer")
    label: string; // Display name
    assetUrl?: string; // URL to logo or icon
    description?: string;
    order?: number; // Manual ordering if needed
}

const CatalogMetadataSchema = new Schema<ICatalogMetadata>({
    type: {
        type: String,
        required: true,
        enum: ['brand', 'decade', 'type'],
        index: true
    },
    key: { type: String, required: true },
    label: { type: String, required: true },
    assetUrl: { type: String },
    description: { type: String },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Compound index to ensure unique metadata for each type+key combo
CatalogMetadataSchema.index({ type: 1, key: 1 }, { unique: true });

const CatalogMetadata = models.CatalogMetadata || model('CatalogMetadata', CatalogMetadataSchema);

export default CatalogMetadata;
