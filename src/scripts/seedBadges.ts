
import dotenv from 'dotenv';
import mongoose, { Schema } from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// -- Load Environment --
// Try to load from .env.local manually if standard loading fails
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../');

// Try standard load
dotenv.config({ path: join(projectRoot, '.env.local') });

// -- Inline Schema Definition --
const BadgeSchema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    icon: { type: String },
    category: {
        type: String,
        enum: ['milestone', 'community', 'special', 'instrument'],
        default: 'milestone'
    },
    criteria: { type: Schema.Types.Mixed },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const Badge = mongoose.models.Badge || mongoose.model('Badge', BadgeSchema);

// -- Badges Data --
const BADGES = [
    {
        code: 'EARLY_ADOPTER',
        name: 'Pionero',
        description: 'Usuario registrado durante la fase beta de la plataforma.',
        icon: 'Medal',
        category: 'special',
        criteria: { type: 'registration_date', before: '2024-06-01' }
    },
    {
        code: 'VERIFIED_USER',
        name: 'Coleccionista Verificado',
        description: 'Identidad y colección verificada por el equipo.',
        icon: 'ShieldCheck',
        category: 'special',
        criteria: { type: 'manual' }
    },
    {
        code: 'CONTRIB_1',
        name: 'Primer Aporte',
        description: 'Ha contribuido su primer instrumento al catálogo público.',
        icon: 'Upload',
        category: 'community',
        criteria: { type: 'contribution_count', count: 1 }
    },
    {
        code: 'CONTRIB_5',
        name: 'Colaborador Activo',
        description: 'Ha contribuido 5 instrumentos al catálogo.',
        icon: 'Award',
        category: 'community',
        criteria: { type: 'contribution_count', count: 5 }
    },
    {
        code: 'CONTRIB_10',
        name: 'Curador Maestro',
        description: 'Ha contribuido más de 10 instrumentos de alta calidad.',
        icon: 'Trophy',
        category: 'community',
        criteria: { type: 'contribution_count', count: 10 }
    },
    {
        code: 'SPOTLIGHT',
        name: 'Instrumento Destacado',
        description: 'Uno de sus instrumentos fue elegido "Instrumento del Mes".',
        icon: 'Star',
        category: 'milestone',
        criteria: { type: 'spotlight_win' }
    },
    {
        code: 'EXHIBITOR',
        name: 'Expositor',
        description: 'Ha participado en una exhibición virtual.',
        icon: 'Museum',
        category: 'community',
        criteria: { type: 'exhibition_join' }
    },
    {
        code: 'INFLUENCER',
        name: 'Referente',
        description: 'Sus instrumentos han recibido más de 50 likes.',
        icon: 'Heart',
        category: 'milestone',
        criteria: { type: 'likes_received', count: 50 }
    }
];

// -- Main --
async function seedBadges() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI missing in .env.local');

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(uri);

        console.log('🚀 Seeding badges...');

        for (const badge of BADGES) {
            await Badge.findOneAndUpdate(
                { code: badge.code },
                { ...badge, active: true },
                { upsert: true, new: true }
            );
            // console.log(`✅ Processed badge: ${badge.name}`);
        }

        console.log('🎉 Despliegue de trofeos completado exitosamente.');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding badges:', error);
        process.exit(1);
    }
}

seedBadges();
