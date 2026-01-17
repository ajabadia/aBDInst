import { Schema, model, models } from 'mongoose';

const ExhibitionVoteSchema = new Schema({
    exhibition: { type: Schema.Types.ObjectId, ref: 'Exhibition', required: true },
    submission: { type: Schema.Types.ObjectId, ref: 'ExhibitionSubmission', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Ensure unique vote per submission by user (Can vote for multiple items? usually yes in these contests, or limited. Let's assume 1 vote per submission, but can vote for multiple submissions)
// Optimization: If we want "One vote per Exhibition", we index { exhibition: 1, user: 1 }.
// For now, let's allow voting for multiple entries (Like/Heart style).
ExhibitionVoteSchema.index({ submission: 1, user: 1 }, { unique: true });

const ExhibitionVote = models?.ExhibitionVote || model('ExhibitionVote', ExhibitionVoteSchema);
export default ExhibitionVote;
