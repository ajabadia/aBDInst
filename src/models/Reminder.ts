import { Schema, model, models, type Document } from 'mongoose';

export interface IReminder extends Document {
    userId: Schema.Types.ObjectId;
    instrumentId?: Schema.Types.ObjectId;
    title: string;
    description?: string;
    dueDate: Date;
    repeat: 'none' | 'weekly' | 'monthly' | 'yearly';
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        instrumentId: {
            type: Schema.Types.ObjectId,
            ref: 'Instrument'
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        dueDate: {
            type: Date,
            required: true,
            index: true
        },
        repeat: {
            type: String,
            enum: ['none', 'weekly', 'monthly', 'yearly'],
            default: 'none'
        },
        isCompleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Reminder = models?.Reminder || model<IReminder>('Reminder', ReminderSchema);

export default Reminder;
