
export interface SynthApiSpecs {
    id: number;
    name: string;
    img: string;
    manufacturer: string;
    yearProduced: number;
    memory: string;
    oscillators: string;
    filter: string;
    lfo: string;
    effects: string;
}

export class SynthesizerSpecsService {
    private apiKey: string;
    private baseUrl = 'https://api.synthesizer-api.com';

    constructor() {
        this.apiKey = process.env.SYNTHESIZER_API_KEY || '';
    }

    private async fetch(endpoint: string, params: Record<string, any> = {}) {
        if (!this.apiKey) {
            console.warn('⚠️ [SynthesizerSpecsService] Missing SYNTHESIZER_API_KEY in .env.local. Deep technical enrichment will be limited.');
            return null;
        }

        const queryParams = new URLSearchParams({
            key: this.apiKey,
            ...params
        });

        const url = `${this.baseUrl}${endpoint}?${queryParams}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Synthesizer-API error: ${response.status} - ${error}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching from Synthesizer-API:', error);
            return null;
        }
    }

    /**
     * Search for a synthesizer by manufacturer and model/name
     */
    async findSynthSpecs(manufacturer: string, model: string): Promise<SynthApiSpecs | null> {
        const data = await this.fetch('/synths', {
            manufacturer,
            name: model // The API uses 'name' for the model record
        });

        if (data && data.synths && data.synths.length > 0) {
            // Find most exact match or return the first one
            return data.synths[0];
        }

        return null;
    }

    /**
     * Map API response to our Instrument model specs format
     */
    mapToInstrumentSpecs(apiData: SynthApiSpecs) {
        const specs = [];

        if (apiData.yearProduced) {
            specs.push({ category: 'General', label: 'Year', value: apiData.yearProduced.toString() });
        }
        if (apiData.oscillators) {
            specs.push({ category: 'Engine', label: 'Oscillators', value: apiData.oscillators });
        }
        if (apiData.filter) {
            specs.push({ category: 'Engine', label: 'Filter', value: apiData.filter });
        }
        if (apiData.lfo) {
            specs.push({ category: 'Engine', label: 'LFO', value: apiData.lfo });
        }
        if (apiData.memory) {
            specs.push({ category: 'Engine', label: 'Memory', value: apiData.memory });
        }
        if (apiData.effects) {
            specs.push({ category: 'Engine', label: 'Effects', value: apiData.effects });
        }

        return specs;
    }
}

export const synthSpecsService = new SynthesizerSpecsService();
