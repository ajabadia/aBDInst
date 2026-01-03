import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemConfig extends Document {
    key: string;
    value: any;
    description?: string;
    updatedAt: Date;
}

const SystemConfigSchema: Schema = new Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    value: {
        type: Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

export default mongoose.models.SystemConfig || mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
