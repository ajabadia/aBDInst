import { Schema, model, models, type Document } from 'mongoose';

export interface IContactMessage {
    content: string;
    senderType: 'user' | 'admin';
    senderId?: Schema.Types.ObjectId; // If user or admin
    createdAt: Date;
}

export interface IContactRequest extends Document {
    subject: string;
    status: 'open' | 'replied' | 'closed';
    sender: {
        name: string;
        email: string;
        userId?: Schema.Types.ObjectId; // Only if registered
    };
    closedAt?: Date;
    closedBy?: {
        userId: Schema.Types.ObjectId;
        role: string;
        name: string;
    };
    thread: IContactMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const ContactRequestSchema = new Schema<IContactRequest>(
    {
        subject: {
            type: String,
            required: true,
            maxlength: 200
        },
        status: {
            type: String,
            enum: ['open', 'replied', 'closed'],
            default: 'open',
            index: true
        },
        sender: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            userId: { type: Schema.Types.ObjectId, ref: 'User' }
        },
        closedAt: { type: Date },
        closedBy: {
            userId: { type: Schema.Types.ObjectId },
            role: { type: String },
            name: { type: String }
        },
        thread: [{
            content: { type: String, required: true },
            senderType: { type: String, enum: ['user', 'admin'], required: true },
            senderId: { type: Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    {
        timestamps: true
    }
);

// Index for efficient admin listing and user history
ContactRequestSchema.index({ 'sender.userId': 1 });
ContactRequestSchema.index({ createdAt: -1 });

const ContactRequest = models?.ContactRequest || model<IContactRequest>('ContactRequest', ContactRequestSchema);

export default ContactRequest;
