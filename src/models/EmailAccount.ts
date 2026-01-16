import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailAccount extends Document {
    name: string;
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    fromEmail: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EmailAccountSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    host: {
        type: String,
        required: true,
        trim: true
    },
    port: {
        type: Number,
        required: true,
        default: 587
    },
    user: {
        type: String,
        required: true,
        trim: true
    },
    pass: {
        type: String,
        required: true
    },
    secure: {
        type: Boolean,
        default: false
    },
    fromEmail: {
        type: String,
        required: true,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure only one default account
EmailAccountSchema.pre('save', async function (next) {
    if (this.isDefault) {
        await mongoose.models.EmailAccount.updateMany(
            { _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }
    next();
});

export default mongoose.models.EmailAccount || mongoose.model<IEmailAccount>('EmailAccount', EmailAccountSchema);
