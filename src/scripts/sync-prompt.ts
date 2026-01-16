import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    value: mongoose.Schema.Types.Mixed
});
const Config = mongoose.models.Config || mongoose.model('Config', ConfigSchema);

const newPrompt = `Analyze this image of a musical instrument. Extract its details into a JSON object.
IMPORTANT: All text fields (subtype, description, label, value) must be in Spanish (castellano).
Format:
{
    "brand": "string",
    "model": "string",
    "type": "string (One of: Synthesizer, Drum Machine, Guitar, Modular, Eurorack Module, Groovebox, Effect, Mixer, Drum Kit)",
    "subtype": "string in Spanish",
    "description": "short visual description in Spanish",
    "year": "string (e.g. 1984, or 1980-1985)",
    "specs": [ { "category": "string (Use: Información Básica, Arquitectura y Voces, Sección de Osciladores, Sección de Percusión / Voces, Filtros y Amplificador, Envolturas y Modulación, Parámetros de Efectos, Interfaz y Controladores, Efectos y Conectividad, Especificaciones Técnicas)", "label": "string in Spanish", "value": "string in Spanish" } ]
}`;

async function run() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/instrument-collector';
    console.log('--- Connecting to MongoDB ---');

    try {
        await mongoose.connect(uri);
        console.log('Connected.');

        console.log('Updating ai_system_prompt...');
        const result = await Config.findOneAndUpdate(
            { key: 'ai_system_prompt' },
            { value: newPrompt },
            { upsert: true, new: true }
        );

        if (result) {
            console.log('✅ DATABASE PROMPT UPDATED SUCCESSFULLY');
        } else {
            console.log('❌ FAILED TO UPDATE PROMPT');
        }

    } catch (err) {
        console.error('❌ DB ERROR:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    }
}

run();
