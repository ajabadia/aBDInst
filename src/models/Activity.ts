import { Schema, model, models, type Document } from 'mongoose';

export interface IActivity extends Document {
    userId: Schema.Types.ObjectId;
    type: 'add_collection' | 'add_wishlist' | 'comment' | 'follow' | 'review';
    data: any; // Dynamic data mostly (instrumentId, targetUserId, etc)
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ['add_collection', 'add_wishlist', 'comment', 'follow', 'review'],
            required: true
        },
        data: {
            type: Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false } // Only createdAt matters for a log
    }
);

// Index to efficiently query feed: Activities where userId is IN [following_list] sorted by date
ActivitySchema.index({ userId: 1, createdAt: -1 });

const Activity = models?.Activity || model<IActivity>('Activity', ActivitySchema);

export default Activity;
