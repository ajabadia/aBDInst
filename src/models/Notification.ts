import { Schema, model, models, type Document } from 'mongoose';

export interface INotification extends Document {
    userId: Schema.Types.ObjectId;
    type: 'follow' | 'comment' | 'reply' | 'like' | 'system' | 'maintenance' | 'price_alert' | 'wishlist_match' | 'contact_request' | 'contact_reply' | 'metadata_alert';
    data: any; // Dynamic: { actorId, actorName, instrumentId, instrumentName, etc. }
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ['follow', 'comment', 'reply', 'like', 'system', 'maintenance', 'price_alert', 'wishlist_match', 'contact_request', 'contact_reply', 'metadata_alert'],
            required: true
        },
        data: {
            type: Schema.Types.Mixed,
            default: {}
        },
        read: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

// Index for efficiently fetching unread notifications
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = models?.Notification || model<INotification>('Notification', NotificationSchema);

export default Notification;
