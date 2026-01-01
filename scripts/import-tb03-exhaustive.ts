import mongoose from 'mongoose';

const InstrumentSchema = new mongoose.Schema({
    brand: String,
    model: String,
    type: String,
    subtype: String,
    description: String,
    years: [String],
    specs: [{ category: String, label: String, value: String }]
});

const Instrument = mongoose.models.Instrument || mongoose.model('Instrument', InstrumentSchema);

async function run() {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://ajabala:hH3Smsv1m218fP6E@cluster0.zps3p.mongodb.net/instrument-collector?retryWrites=true&w=majority&appName=Cluster0';
    console.log('--- Connecting to MongoDB ---');

    try {
        await mongoose.connect(uri);
        console.log('Connected.');

        const tb03Data = {
            brand: 'Roland',
            model: 'TB-03',
            type: 'Synthesizer',
            subtype: 'Bass Line (Boutique)',
            years: ['2016'],
            description: 'Recreación digital ACB de la legendaria TB-303. Incluye efectos de overdrive y delay, secuenciador avanzado y conectividad CV/Gate.',
            specs: [
                { category: 'Sitio Web Oficial', label: 'Página del Producto', value: 'https://www.roland.com/es-es/products/tb-03/' },
                { category: 'Información Básica', label: 'Serie', value: 'Roland Boutique' },
                { category: 'Secuenciador y Memoria', label: 'Patrones', value: '96 (4 grupos x 3 secciones x 8 patrones)' },
                { category: 'Secuenciador y Memoria', label: 'Pistas (Tracks)', value: '7' },
                { category: 'Sección de Osciladores', label: 'Formas de Onda', value: 'SAW, SQUARE' },

                // PANEL CONTROLS (KNOBS)
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob VOLUME', value: 'Control de volumen maestro' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob TUNING', value: 'Afinación del oscilador' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob CUT OFF FREQ', value: 'Frecuencia de corte del filtro' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob RESONANCE', value: 'Resonancia del filtro' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob ENV MOD', value: 'Modulación de envolvente' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob DECAY', value: 'Decaimiento de la envolvente' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob ACCENT', value: 'Intensidad del acento' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob OVERDRIVE', value: 'Nivel de saturación' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob DELAY TIME', value: 'Tiempo del eco' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob DELAY FEEDBACK', value: 'Retroalimentación del eco' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Knob VALUE', value: 'Navegación y edición de valores' },

                // PANEL CONTROLS (SWITCHES/SELECTORS)
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Switch WAVE FORM', value: 'Selección SAW o SQUARE' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Selector TRACK PATT. GROUP', value: 'Selección de grupo' },
                { category: 'Controles de Panel (Knobs/Faders)', label: 'Selector MODE', value: 'Selección de modo de operación' },

                // SYSTEM BUTTONS
                { category: 'Botones de Sistema / Funciones', label: 'Botón TEMPO', value: 'Ajuste de velocidad' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón PATTERN CLEAR', value: 'Borrado de patrones' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón RUN/STOP', value: 'Inicio/Parada secuenciador' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón PITCH MODE', value: 'Modo edición de tono' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón FUNCTION', value: 'Acceso a funciones secundarias' },
                { category: 'Botones de Sistema / Funciones', label: 'Botones de Teclado', value: '13 notas (C a C)' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón TIME MODE', value: 'Modo edición de tiempo' },
                { category: 'Botones de Sistema / Funciones', label: 'Botones TRANSPOSE UP/DOWN', value: 'Transporte de octava' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón ACCENT', value: 'Inserción de acento' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón SLIDE', value: 'Inserción de deslizamiento' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón BACK', value: 'Atrás en navegación' },
                { category: 'Botones de Sistema / Funciones', label: 'Botón TAP', value: 'Entrada de ritmo manual' },

                // EFFECTS
                { category: 'Parámetros de Efectos', label: 'OVERDRIVE', value: 'Overdrive/Distorsión' },
                { category: 'Parámetros de Efectos', label: 'DELAY', value: 'Tape Echo/Digital Delay/Reverb' },

                // INDICATORS
                { category: 'Pantalla e Indicadores', label: 'Display Principal', value: '7 segmentos, 4 caracteres (LED)' },
                { category: 'Pantalla e Indicadores', label: 'PITCH MODE LED', value: 'Indicador modo tono' },
                { category: 'Pantalla e Indicadores', label: 'NORMAL MODE LED', value: 'Indicador modo normal' },
                { category: 'Pantalla e Indicadores', label: 'TIME MODE LED', value: 'Indicador modo tiempo' },

                // CV/GATE
                { category: 'CV / Gate y Sincronización', label: 'TRIGGER IN', value: 'Mono miniature phone' },
                { category: 'CV / Gate y Sincronización', label: 'CV OUTPUT', value: 'Mono miniature phone' },
                { category: 'CV / Gate y Sincronización', label: 'GATE OUTPUT', value: 'Mono miniature phone' },

                // CONNECTIVITY
                { category: 'Efectos y Conectividad', label: 'Salida Auriculares', value: 'Stereo miniature phone' },
                { category: 'Efectos y Conectividad', label: 'Salida OUTPUT', value: 'Stereo miniature phone' },
                { category: 'Efectos y Conectividad', label: 'Entrada MIX IN', value: 'Stereo miniature phone' },
                { category: 'Efectos y Conectividad', label: 'MIDI IN/OUT', value: '5-pin DIN' },
                { category: 'Efectos y Conectividad', label: 'Puerto USB', value: 'Micro-B type (Audio, MIDI)' },

                // POWER
                { category: 'Alimentación y Energía', label: 'Baterías', value: '4 x AA (Rechargeable Ni-MH o Alkaline)' },
                { category: 'Alimentación y Energía', label: 'USB Power', value: 'USB bus power' },
                { category: 'Alimentación y Energía', label: 'Consumo', value: '500 mA' },
                { category: 'Alimentación y Energía', label: 'Vida de Batería', value: 'Aprox. 5 horas (Ni-MH)' },

                // TECH SPECS
                { category: 'Especificaciones Técnicas', label: 'Dimensiones', value: '308 x 130 x 52 mm' },
                { category: 'Especificaciones Técnicas', label: 'Peso', value: '940 g' }
            ]
        };

        console.log('Upserting Roland TB-03 with EXHAUSTIVE specs and WEBSITE...');
        const result = await Instrument.findOneAndUpdate(
            { model: 'TB-03', brand: 'Roland' },
            { $set: tb03Data },
            { upsert: true, new: true }
        );

        if (result) {
            console.log('✅ DATABASE UPDATED SUCCESSFULLY (EXHAUSTIVE + WEBSITE)');
        }

    } catch (err) {
        console.error('❌ DB ERROR:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

run();
