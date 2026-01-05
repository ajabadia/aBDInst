import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'io.instrument.collector',
    appName: 'Instrument Collector',
    webDir: 'public',
    server: {
        url: 'https://instrument-collector.vercel.app', // Placeholder - User should update
        cleartext: true,
        androidScheme: 'https'
    }
};

export default config;
