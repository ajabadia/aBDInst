import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'io.instrument.collector',
    appName: 'Instrument Collector',
    // When loading a remote URL, the `webDir` property is not used.
    // The app will be loaded directly from your Vercel deployment.
    // webDir: 'out',
    server: {
        url: 'https://a-bd-inst.vercel.app/',
        cleartext: true,
        androidScheme: 'https'
    }
};

export default config;
