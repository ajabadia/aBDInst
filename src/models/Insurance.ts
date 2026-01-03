import mongoose, { Schema, Document } from 'mongoose';

export interface IInsurance extends Document {
    instrumentId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    premium: number;
    currency: string;
    startDate: Date;
    endDate: Date;
    type: 'Theft' | 'Damage' | 'All-Risk' | 'Other';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InsuranceSchema: Schema = new Schema({
    collectionItemId: {
        type: Schema.Types.ObjectId,
        ref: 'UserCollection',
        required: true
    },
    // instrumentId is redundant if we have collectionItemId, but maybe useful for fast lookup? 
    // Let's rely on population.
    userId: { // Link to user for easier querying
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: String,
        required: [true, 'El proveedor es obligatorio']
    },
    policyNumber: {
        type: String,
        required: [true, 'El número de póliza es obligatorio']
    },
    coverageAmount: {
        type: Number,
        required: true,
        min: 0
    },
    premium: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'EUR'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['Theft', 'Damage', 'All-Risk', 'Other'],
        default: 'All-Risk'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for finding active policies
InsuranceSchema.index({ userId: 1, endDate: 1 });
InsuranceSchema.index({ instrumentId: 1 });

export default mongoose.models.Insurance || mongoose.model<IInsurance>('Insurance', InsuranceSchema);
