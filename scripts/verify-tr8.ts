import { analyzeInstrumentText } from '../src/actions/ai';
import dbConnect from '../src/lib/db';
import Config from '../src/models/Config';

const TR8_DATA = `Roland TR-8  User Drum Kits16User Patterns16Steps per 1 measure1 – 16 steps x 2 (Variation A/B)Tempo40 – 300Instruments & ControlsBASS DRUM: LEVEL, TUNE, ATTACK, COMP, DECAY, INST SELECT
SNARE DRUM: LEVEL, TUNE, SNAPPY, COMP, DECAY, INST SELECT
LOW TOM, MID TOM, HIGH TOM, RIM SHOT, HAND CLAP, CLOSED HIHAT, OPEN HIHAT, CRASH CYMBAL, RIDE CYMBAL: LEVEL, TUNE, DECAY, INST SELECTEffects and ControlsACCENT: LEVEL, STEP
REVERB: LEVEL, TIME, GATE, STEP
DELAY: LEVEL, TIME, FEEDBACK, STEP
EXTERNAL IN: LEVEL, SIDE CHAIN, STEPModeTR-REC, PATTERN SELECT, INST PLAY, INST REC, DRUM KIT SEL, DRUM INST SELControllersVOLUME knob
SCATTER knob
TEMPO knob
FINE knob
SHUFFLE knob
PADS: 16
MODE buttons: 6
CLEAR button
VARIATION buttons: A, B
SCALE button
LAST STEP button
START/STOP button
SCATTER ON button
SCATTER DEPTH button
TAP button
Power Switch (Rear)Display7 segments, 4 characters (LED)EffectsREVERB, DELAY, SIDE CHAINScatterTypes: 10Nominal Input Level-10 dBuInput Impedance100 k ohmsNominal Output Level-10/+4 dBu (Selectable)Output ImpedanceMIX OUT, ASSIGNABLE OUT: 1 k ohm
PHONES: 130 ohmsConnectorsPHONES jack: 1/4-inch stereo phone type
MIX OUT (L/MONO, R) jacks: 1/4-inch phone type
ASSIGNABLE OUT (A, B) jacks: 1/4-inch phone type
EXTERNAL IN (L, R) jacks: 1/4-inch phone type
USB port: USB type B (Audio, MIDI)
DC IN jackUSBAudio, MIDIPower SupplyAC adaptorCurrent Draw1,000 mAAccessoriesOwner's manual
Leaflet "USING THE UNIT SAFELY"
AC adaptorSize and WeightWidth400 mm
15-3/4 inchesDepth260 mm
10-1/4 inchesHeight65 mm
2-9/16 inchesWeight1.9 kg
4 lbs. 4 oz.`;

async function main() {
    console.log('--- Verifying TR-8 Import with New Categories ---');
    try {
        await dbConnect();

        // Ensure the DB prompt is updated to include new categories
        const newPrompt = `Analyze this image of a musical instrument. Extract its details into a JSON object.
Format:
{
    "brand": "string",
    "model": "string",
    "type": "string (One of: Synthesizer, Drum Machine, Guitar, Modular, Eurorack Module, Groovebox, Effect, Mixer, Drum Kit)",
    "subtype": "string",
    "description": "short visual description",
    "year": "string (e.g. 1984, or 1980-1985)",
    "specs": [ { "category": "string (Use: Información Básica, Arquitectura y Voces, Sección de Osciladores, Sección de Percusión / Voces, Filtros y Amplificador, Envolturas y Modulación, Parámetros de Efectos, Interfaz y Controladores, Efectos y Conectividad, Especificaciones Técnicas)", "label": "string", "value": "string" } ]
}`;
        await Config.findOneAndUpdate({ key: 'ai_system_prompt' }, { value: newPrompt }, { upsert: true });
        console.log('✅ AI System Prompt updated in DB.');

        const result = await analyzeInstrumentText(TR8_DATA);

        if (result.success) {
            console.log('✅ Analysis Successful!');
            console.log(JSON.stringify(result.data, null, 2));
        } else {
            console.error('❌ Analysis Failed:', result.error);
        }
    } catch (e) {
        console.error('❌ Script Error:', e);
    }
}

main();
