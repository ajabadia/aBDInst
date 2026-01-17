import { Schema, model, models } from 'mongoose';

const ArticleSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    excerpt: { type: String, maxlength: 300 },
    content: { type: String, required: true }, // Markdown/HTML
    coverImage: { type: String },

    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },

    // SEO & Metadata
    tags: [{ type: String }],

    // Integration
    relatedInstruments: [{
        type: Schema.Types.ObjectId,
        ref: 'Instrument'
    }],
    relatedCollections: [{
        type: Schema.Types.ObjectId,
        ref: 'UserCollection'
    }], // specific user items

    // AI
    aiGenerated: { type: Boolean, default: false },
    aiPromptUsed: { type: String }

}, { timestamps: true });

// Indexes
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ status: 1 });

const Article = models?.Article || model('Article', ArticleSchema);

export default Article;
