import { Schema, model, models } from 'mongoose';

const PushSubscriptionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userAgent: { type: String }, // To identify device (Chrome Windows, Safari iOS, etc.)
    subscription: {
        endpoint: { type: String, required: true },
        expirationTime: { type: Number, default: null },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true }
        }
    }
}, {
    timestamps: true
});

// Avoid duplicates for same endpoint
PushSubscriptionSchema.index({ 'subscription.endpoint': 1 }, { unique: true });
PushSubscriptionSchema.index({ userId: 1 });

const PushSubscription = models.PushSubscription || model('PushSubscription', PushSubscriptionSchema);

export default PushSubscription;
