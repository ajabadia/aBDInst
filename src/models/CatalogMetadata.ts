import { Schema, model, models } from 'mongoose';

export interface ICatalogMetadata {
    _id: any;
    type: 'brand' | 'decade' | 'type' | 'artist';
    key: string;
    label: string;
    assetUrl?: string; // High-level primary asset (active logo/image)
    images?: {
        url: string;
        isPrimary: boolean;
        source?: 'manual' | 'discogs' | 'spotify';
        externalId?: string;
    }[];
    description?: string;
    order?: number;
}

const CatalogMetadataSchema = new Schema<ICatalogMetadata>({
    type: {
        type: String,
        required: true,
        enum: ['brand', 'decade', 'type', 'artist'],
        index: true
    },
    key: { type: String, required: true },
    label: { type: String, required: true },
    assetUrl: { type: String },
    images: [{
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        source: { type: String, enum: ['manual', 'discogs', 'spotify'], default: 'manual' },
        externalId: { type: String }
    }],
    description: { type: String },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Compound index to ensure unique metadata for each type+key combo
CatalogMetadataSchema.index({ type: 1, key: 1 }, { unique: true });

const CatalogMetadata = models.CatalogMetadata || model('CatalogMetadata', CatalogMetadataSchema);

export default CatalogMetadata;
