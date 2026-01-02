import { Schema, model, models, type Document } from 'mongoose';

export interface IComment extends Document {
    instrumentId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    content: string;
    parentId?: Schema.Types.ObjectId;
    status: 'visible' | 'hidden';
    reports: { userId: Schema.Types.ObjectId; reason: string; date: Date }[];
    reportCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        instrumentId: {
            type: Schema.Types.ObjectId,
            ref: 'Instrument',
            required: true,
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxLength: 1000,
            trim: true
        },
        parentId: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
            index: true
        },
        status: {
            type: String,
            enum: ['visible', 'hidden'],
            default: 'visible',
            index: true
        },
        reports: [{
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            reason: { type: String },
            date: { type: Date, default: Date.now }
        }],
        reportCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Indexes for common queries
CommentSchema.index({ instrumentId: 1, status: 1, createdAt: -1 }); // Get comments for instrument
CommentSchema.index({ reportCount: -1 }); // Moderation queue

const Comment = models?.Comment || model<IComment>('Comment', CommentSchema);

export default Comment;
