
export const SPEC_CATEGORIES = {
    BASIC: 'Información Básica',
    ARCH_VOICE: 'Arquitectura y Voces',
    OSC: 'Sección de Osciladores',
    FILTER_AMP: 'Filtros y Amplificador',
    ENV_MOD: 'Envolturas y Modulación',
    CONTROLS: 'Controles y Rendimiento',
    EFFECTS_CONN: 'Efectos y Conectividad',
    TECH_SPECS: 'Especificaciones Técnicas',
} as const;

export const PREDEFINED_SPECS: Record<string, string[]> = {
    [SPEC_CATEGORIES.BASIC]: [
        'Formato', // Teclado, Módulo...
        'Tipo de Síntesis',
    ],
    [SPEC_CATEGORIES.ARCH_VOICE]: [
        'Número de Voces (Polifonía)',
        'Tipo de Síntesis',
        'Multitimbralidad',
        'Arquitectura', // Digital, Híbrido...
        // Workstation/Groovebox
        'Partes Multitimbrales',
        'Motores de Síntesis',
        'Memoria Waveforms',
        'Sampler Specs',
        'Kit Slots',
        // Drum Synths
        'Capas por Voz (Layers)',
        'Round Robin',
    ],
    [SPEC_CATEGORIES.OSC]: [
        'Osciladores por Voz',
        'Número de VCOs',
        'Formas de Onda',
        'Rango de Octavas',
        'Sync',
        'FM',
        'Ruido',
        // Wavetable
        'Número de Wavetables',
        'Frames por Wavetable',
        'Posición WT (Morphing)',
        'Warp Modes',
        'Editor de Wavetables',
        'Aliasing / Legacy Mode',
        // FM
        'Operadores FM',
        'Algoritmos FM',
        'Ratios',
        'Feedback FM',
        // Granular
        'Tamaño de Grano',
        'Densidad de Granos',
        'Cloud Spray',
        'Forma de Ventana',
        // Additive
        'Parciales',
        'Editor FFT',
        'Máscara Armónica',
        // Physical Modeling
        'Excitador (Strike/Pluck)',
        'Resonador',
        'Tamaño del Cuerpo (Body)',
        'Cuerdas Simpáticas',
        // Sampling
        'Puntos de Loop',
        'Time-Stretch',
        'Slices',
        'Rango de Pitch',
        'Sample Rate',
        'Bit Depth',
        'Mono/Stereo',
        'Duración (ms)',
        'Tamaño Memoria',
        'Modo de Loop', // Forward, Ping-Pong...
        'Crossfade Loop',
        'Formant Shift',
        'Key Zones',
        'Velocity Layers',
        'Root Key',
    ],
    [SPEC_CATEGORIES.FILTER_AMP]: [
        'Tipo de Filtro',
        'Pendiente (Slope)', // 12dB/24dB
        'Resonancia',
        'Overdrive/Distorsión',
        'VCA',
        'Modélado de Filtro', // Ladder, Sallen-Key
    ],
    [SPEC_CATEGORIES.ENV_MOD]: [
        'Envolturas (ADSR)',
        'LFOs',
        'Matriz de Modulación',
        'Mod Wheel',
        'Velocity / Aftertouch',
        'Motion Sequences', // Wavetable/Digital
        'Envoltura Vectorial',
    ],
    [SPEC_CATEGORIES.CONTROLS]: [
        'Teclado',
        'Secuenciador',
        'Arpegiador',
        'Pitch / Mod Wheels',
        'Keyboard Tracking',
        'Niveles CV', // Eurorack
        'Número de Pistas',
        'Steps por Patrón',
        'Resolución de Step',
        'Pattern Chain Length',
        'Tempo Range',
        'Song/Pattern Mode',
        'Secuenciador Interno',
        'Pads',
        // Vector / Controllers
        'Joystick Vectorial (XY)',
        'Eje Z',
        'Pads RGB',
        'Encoders Infinitos',
        'Faders Motorizados',
        'Controles de Transporte',
        'MPE (5D Expression)',
        'Grid (8x8/16x8)',
        'Sensores Capacitivos',
    ],
    [SPEC_CATEGORIES.EFFECTS_CONN]: [
        'Efectos Integrados',
        'Salidas de Audio',
        'Entradas Externas',
        'MIDI',
        'CV/Gate',
        'Almacenamiento',
        'Entradas/Salidas (Jacks)', // Eurorack
        'Efectos Multi',
        'Integración DAW',
        'Patchbay (Semi-Modular)',
        'Salidas Múltiples',
    ],

    [SPEC_CATEGORIES.TECH_SPECS]: [
        'Alimentación',
        'Consumo',
        'Dimensiones',
        'Peso',
        'Año de Lanzamiento',
        // Eurorack Specific
        'Ancho HP',
        'Profundidad (mm)',
        'Consumo +12V',
        'Consumo -12V',
        'Consumo +5V',
        'Requisitos de Alimentación',
    ],
};
