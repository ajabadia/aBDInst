import { Schema, model, models } from 'mongoose';

const MusicAlbumSchema = new Schema({
    artist: { type: String, required: true },
    title: { type: String, required: true },
    year: { type: Number },
    label: { type: String },
    genres: [{ type: String }],
    styles: [{ type: String }],
    format: { type: String }, // e.g., 'Vinyl', 'CD', 'Digital'

    // External IDs
    discogsId: { type: String, unique: true, sparse: true },
    masterId: { type: String, sparse: true }, // Discogs Master Release ID
    spotifyId: { type: String, unique: true, sparse: true },

    // Hierarchy
    isMaster: { type: Boolean, default: false },
    parentId: { type: Schema.Types.ObjectId, ref: 'MusicAlbum' }, // Links version to Master

    coverImage: { type: String },

    tracklist: [{
        position: { type: String },
        title: { type: String },
        duration: { type: String }
    }],

    description: { type: String },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
});

// Indices
MusicAlbumSchema.index({ artist: 'text', title: 'text', genres: 'text' });
MusicAlbumSchema.index({ artist: 1, title: 1 });
MusicAlbumSchema.index({ masterId: 1 });
MusicAlbumSchema.index({ parentId: 1 });
MusicAlbumSchema.index({ isMaster: 1 });

if (process.env.NODE_ENV === 'development' && models.MusicAlbum) {
    delete (models as any).MusicAlbum;
}

const MusicAlbum = models?.MusicAlbum || model('MusicAlbum', MusicAlbumSchema);

export default MusicAlbum;
