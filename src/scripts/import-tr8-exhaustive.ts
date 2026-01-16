import mongoose from 'mongoose';

const InstrumentSchema = new mongoose.Schema({
    brand: String,
    model: String,
    type: String,
    subtype: String,
    description: String,
    website: String,
    years: [String],
    specs: [{ category: String, label: String, value: String }]
});

const Instrument = mongoose.models.Instrument || mongoose.model('Instrument', InstrumentSchema);

async function run() {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://ajabala:hH3Smsv1m218fP6E@cluster0.zps3p.mongodb.net/instrument-collector?retryWrites=true&w=majority&appName=Cluster0';
    console.log('--- Connecting to MongoDB for TR-8 Exhaustive Import ---');

    try {
        await mongoose.connect(uri);
        console.log('Connected.');

        const tr8Data = {
            brand: 'Roland',
            model: 'TR-8',
            type: 'Drum Machine',
            subtype: 'Rhythm Performer (AIRA)',
            years: ['2014'],
            website: 'https://www.roland.com/es-es/products/tr-8/',
            description: 'Potente caja de ritmos que combina el sonido y uso legendarios de la TR-808 y TR-909 con tecnología ACB. Permite control total en tiempo real de cada instrumento.',
            specs: [
                { category: 'Información Básica', label: 'Serie', value: 'AIRA' },
                { category: 'Información Básica', label: 'Kits de Batería', value: '16' },
                { category: 'Secuenciador y Memoria', label: 'Patrones de Usuario', value: '16' },
                { category: 'Secuenciador y Memoria', label: 'Pasos por Medida', value: '1 – 16 pasos x 2 (Variación A/B)' },
                { category: 'Secuenciador y Memoria', label: 'Rango de Tempo', value: '40 – 300 BPM' },

                // PERCUSSION CONTROLS (DETAILED)
                { category: 'Sección de Percusión / Voces', label: 'BASS DRUM Params', value: 'LEVEL, TUNE, ATTACK, COMP, DECAY, INST SELECT' },
                { category: 'Sección de Percusión / Voces', label: 'SNARE DRUM Params', value: 'LEVEL, TUNE, SNAPPY, COMP, DECAY, INST SELECT' },
                { category: 'Sección de Percusión / Voces', label: 'LOW TOM Params', value: 'LEVEL, TUNE, DECAY, INST SELECT' },
                { category: 'Sección de Percusión / Voces', label: 'MID TOM Params', value: 'LEVEL, TUNE, DECAY, INST SELECT' },
                { category: 'Sección de Percusión / Voces', label: 'HIGH TOM Params', value: 'LEVEL, TUNE, DECAY, INST SELECT' },
                { category: 'Sección de Percusión / Voces', label: 'RIM SHOT Params', value: 'LEVEL, TUNE, DECAY, INST SELECT' },
                { category: 'Sección de Percusión / Voces', label: 'HAND CLAP Params', value: 'LEVEL, TUNE, DECAY, INST SELECT' },
                { category: 'Sección de Percusión / Voces', label: 'CLOSED HIHAT Params', value: 'LEVEL, TUNE, DECAY, INST SELECT' },
                { category: 'Sección de Percusión / Voces', label: 'OPEN HIHAT Params', value: 'LEVEL, TUNE, DECAY, INST SELECT' },
                { category: 'Sección de Percusión / Voces', label: 'CRASH CYMBAL Params', value: 'LEVEL, TUNE, DECAY, INST SELECT' },
                { category: 'Sección de Percusión / Voces', label: 'RIDE CYMBAL Params', value: 'LEVEL, TUNE, DECAY, INST SELECT' },

                // EFFECTS
                { category: 'Parámetros de Efectos', label: 'ACCENT', value: 'LEVEL, STEP' },
                { category: 'Parámetros de Efectos', label: 'REVERB', value: 'LEVEL, TIME, GATE, STEP' },
                { category: 'Parámetros de Efectos', label: 'DELAY', value: 'LEVEL, TIME, FEEDBACK, STEP' },
                { category: 'Parámetros de Efectos', label: 'EXTERNAL IN', value: 'LEVEL, SIDE CHAIN, STEP' },
                { category: 'Parámetros de Efectos', label: 'SCATTER Types', value: '10' },

                // MODES
                { category: 'Información Básica', label: 'Modos de Operación', value: 'TR-REC, PATTERN SELECT, INST PLAY, INST REC, DRUM KIT SEL, DRUM INST SEL' },

                // CONTROLS (KNOBS)
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob VOLUME', value: 'Volumen maestro' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob SCATTER', value: 'Control de variación Scatter' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob TEMPO', value: 'Ajuste de velocidad' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob FINE', value: 'Ajuste fino de tempo' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob SHUFFLE', value: 'Ajuste de swing' },

                // BUTTONS
                { category: 'Botones de Sistema / Funciones', label: 'PADS', value: '16 pads de disparo y secuenciación' },
                { category: 'Botones de Sistema / Funciones', label: 'Botones de MODO', value: '6 botones dedicados' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón CLEAR', value: 'Borrado de datos' },
                { category: 'Botones de Sistema / Funciones', label: 'Botones VARIATION', value: 'A, B' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón SCALE', value: 'Escala del secuenciador' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón LAST STEP', value: 'Definición de longitud de patrón' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón START/STOP', value: 'Control de transporte' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón SCATTER ON', value: 'Activación de efecto scatter' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón SCATTER DEPTH', value: 'Profundidad de scatter' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón TAP', value: 'Tap tempo' },

                // INDICATORS
                { category: 'Pantalla e Indicadores', label: 'Display Principal', value: '7 segmentos, 4 caracteres (LED)' },

                // CONNECTIVITY
                { category: 'Efectos y Conectividad', label: 'Salida de Auriculares', value: '1/4-inch stereo phone type' },
                { category: 'Efectos y Conectividad', label: 'Salidas MIX OUT', value: 'L/MONO, R (1/4-inch)' },
                { category: 'Efectos y Conectividad', label: 'Salidas ASSIGNABLE OUT', value: 'A, B (1/4-inch)' },
                { category: 'Efectos y Conectividad', label: 'Entradas EXTERNAL IN', value: 'L, R (1/4-inch)' },
                { category: 'Efectos y Conectividad', label: 'Puerto USB', value: 'Tipo B (Audio, MIDI)' },
                { category: 'Efectos y Conectividad', label: 'MIDI IN/OUT', value: 'Soportado' },

                // POWER
                { category: 'Alimentación y Energía', label: 'Alimentación', value: 'Adaptador AC (incluido)' },
                { category: 'Alimentación y Energía', label: 'Consumo', value: '1,000 mA' },

                // TECH SPECS
                { category: 'Especificaciones Técnicas', label: 'Dimensiones', value: '400 x 260 x 65 mm' },
                { category: 'Especificaciones Técnicas', label: 'Peso', value: '1.9 kg' },
                { category: 'Especificaciones Técnicas', label: 'Impedancia de Entrada', value: '100 k ohms' },
                { category: 'Especificaciones Técnicas', label: 'Nivel de Entrada Nominal', value: '-10 dBu' },
                { category: 'Especificaciones Técnicas', label: 'Nivel de Salida Nominal', value: '-10/+4 dBu (Seleccionable)' }
            ]
        };

        console.log('Upserting Roland TR-8 with EXHAUSTIVE specs...');
        const result = await Instrument.findOneAndUpdate(
            { model: 'TR-8', brand: 'Roland' },
            { $set: tr8Data },
            { upsert: true, new: true }
        );

        if (result) {
            console.log('✅ DATABASE UPDATED SUCCESSFULLY (TR-8 EXHAUSTIVE)');
        }

    } catch (err) {
        console.error('❌ DB ERROR:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

run();
