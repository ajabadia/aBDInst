import mongoose from 'mongoose';

const InstrumentSchema = new mongoose.Schema({
    brand: String,
    model: String,
    type: String,
    subtype: String,
    description: String,
    year: String,
    years: [String],
    specs: [{ category: String, label: String, value: String }]
});

const Instrument = mongoose.models.Instrument || mongoose.model('Instrument', InstrumentSchema);

async function run() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/instrument-collector';
    await mongoose.connect(uri);

    const tb03Data = {
        brand: 'Roland',
        model: 'TB-03',
        type: 'Synthesizer',
        subtype: 'Bass Line (Boutique)',
        year: '2016',
        years: ['2016'],
        description: 'Una recreación moderna de la legendaria TB-303, utilizando tecnología ACB para capturar el sonido ácido clásico con mejoras en la interfaz y efectos.',
        specs: [
            { category: 'Secuenciador y Memoria', label: 'Memoria de Patrones', value: '96 (4 grupos x 3 secciones x 8 patrones)' },
            { category: 'Secuenciador y Memoria', label: 'Pistas (Tracks)', value: '7' },
            { category: 'Sección de Osciladores', label: 'Formas de Onda', value: 'SAW, SQUARE' },
            { category: 'Interfaz y Controladores', label: 'Controles de Sonido', value: 'Tuning, Cutoff, Resonance, Env Mod, Decay, Accent' },
            { category: 'Interfaz y Controladores', label: 'Controles de Efectos', value: 'Overdrive, Delay Time, Delay Feedback' },
            { category: 'Interfaz y Controladores', label: 'Teclado', value: '13 botones (C a C) + Transpose' },
            { category: 'Parámetros de Efectos', label: 'Saturación', value: 'Overdrive (Overdrive/Distortion)' },
            { category: 'Parámetros de Efectos', label: 'Eco/Reverberación', value: 'Delay (Tape Echo/Digital Delay/Reverb)' },
            { category: 'Pantalla e Indicadores', label: 'Display Principal', value: '7 segmentos, 4 caracteres (LED)' },
            { category: 'Pantalla e Indicadores', label: 'Indicadores LED', value: 'Pitch Mode, Normal Mode, Time Mode' },
            { category: 'CV / Gate y Sincronización', label: 'Entrada Trigger', value: 'Trigger In (Miniature phone)' },
            { category: 'CV / Gate y Sincronización', label: 'Salida CV/Gate', value: 'CV Output, Gate Output (Miniature phone)' },
            { category: 'Efectos y Conectividad', label: 'USB', value: 'Micro-B type (Audio, MIDI)' },
            { category: 'Efectos y Conectividad', label: 'Entradas/Salidas', value: 'Phones, Output, Mix In, MIDI IN/OUT' },
            { category: 'Especificaciones Técnicas', label: 'Alimentación', value: 'Baterías Ni-MH/Alcalinas (AA) x4 o USB Bus Power' },
            { category: 'Especificaciones Técnicas', label: 'Consumo', value: '500 mA' },
            { category: 'Especificaciones Técnicas', label: 'Dimensiones', value: '308 x 130 x 52 mm' },
            { category: 'Especificaciones Técnicas', label: 'Peso', value: '940 g' }
        ]
    };

    console.log('Upserting Roland TB-03...');
    const result = await Instrument.findOneAndUpdate(
        { model: 'TB-03', brand: 'Roland' },
        { $set: tb03Data },
        { upsert: true, new: true }
    );

    if (result) {
        console.log('✅ Roland TB-03 Updated Successfully with ID:', result._id);
    } else {
        console.log('❌ Failed to update TB-03');
    }

    await mongoose.connection.close();
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
