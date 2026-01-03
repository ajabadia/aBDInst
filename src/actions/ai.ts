'use server';

import { auth } from '@/auth';

export async function analyzeInstrumentImage(formData: FormData) {
    const session = await auth();
    if (!session) {
        return { success: false, error: 'No autorizado' };
    }

    const imageFile = formData.get('image') as File;

    if (!imageFile) {
        return { success: false, error: 'No image provided' };
    }

    // Convert file to base64
    const buffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            success: true,
            data: {
                brand: 'Roland',
                model: 'Juno-106',
                type: 'Synthesizer',
                subtype: 'Analog Polyphonic',
                year: '1984',
                description: '[MOCK] Detected a classic Roland Juno-106.',
                specs: [
                    { category: 'Arquitectura y Voces', label: 'Polifonía', value: '6 voces' },
                    { category: 'Filtros y Amplificador', label: 'Tipo de Filtro', value: 'Analog Low Pass' }
                ]
            }
        };
    }

    try {
        const { getSystemConfig } = await import('./admin');
        const systemPrompt = await getSystemConfig('ai_system_prompt') || "You are an expert instrument appraiser. Analyze the provided image/text and return a JSON object with brand, model, type, year, description, specs (array of category/label/value), originalPrice (price/currency/year), and marketValue (estimatedPrice/currency/priceRange)."; // Fallback
        const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';

        console.log('--- GEMINI IMAGE ANALYSIS START ---');
        console.log(`Model: ${modelName}`);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { inline_data: { mime_type: imageFile.type || 'image/jpeg', data: base64Image } }
                    ]
                }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        console.log('Gemini Response Status:', response.status);

        if (response.status === 429) {
            throw new Error('Cuota de IA agotada. Por favor, cambia el modelo en el Panel Admin o espera unos minutos.');
        }

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini Error Body:', errText);
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const json = await response.json();
        const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textContent) throw new Error('No content generated from Gemini');

        return { success: true, data: JSON.parse(textContent) };
    } catch (error: any) {
        console.error('Gemini Image Analysis Error:', error);
        return { success: false, error: error.message };
    }
}

export async function analyzeInstrumentText(query: string, contextUrls?: string[]) {
    const session = await auth();
    if (!session) return { success: false, error: 'No autorizado' };

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            success: true,
            data: {
                brand: query.split(' ')[0] || 'Desconocido',
                model: query.split(' ').slice(1).join(' ') || 'Modelo',
                type: 'Synthesizer',
                description: `Información recuperada para "${query}"`,
                year: '1990',
                specs: [{ category: 'Arquitectura y Voces', label: 'Nota', value: 'Datos de prueba (Mock)' }]
            }
        };
    }

    try {
        const { getSystemConfig } = await import('./admin');
        const systemPrompt = await getSystemConfig('ai_system_prompt') || "You are an expert instrument appraiser. Analyze the provided image/text and return a JSON object with brand, model, type, year, description, specs (array of category/label/value), originalPrice (price/currency/year), and marketValue (estimatedPrice/currency/priceRange).";
        const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';

        console.log('--- GEMINI TEXT ANALYSIS START ---');
        console.log('Query:', query);
        if (contextUrls && contextUrls.length > 0) {
            console.log('Context URLs:', contextUrls);
        }
        console.log(`Model: ${modelName}`);

        const contextString = contextUrls && contextUrls.length > 0
            ? `\n\nReference Sources (Prioritize these links for technical data): \n${contextUrls.join('\n')}`
            : '';

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { text: `Target instrument to analyze: ${query}${contextString}` }
                    ]
                }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        console.log('Gemini Response Status:', response.status);

        if (response.status === 429) {
            throw new Error('Cuota de IA agotada. Por favor, cambia el modelo en el Panel Admin o espera unos minutos.');
        }

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini Error Body:', errText);
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const json = await response.json();
        const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textContent) throw new Error('No content generated from Gemini');

        return { success: true, data: JSON.parse(textContent) };
    } catch (error: any) {
        console.error('Gemini Text Analysis Error:', error);
        return { success: false, error: error.message };
    }
}

export async function analyzeBulkList(textList: string) {
    const session = await auth();
    if (!session) return { success: false, error: 'No autorizado' };

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Mock response for quick dev without API key cost/latency
        return {
            success: true,
            data: [
                { brand: 'Fender', model: 'Stratocaster', year: '1954', type: 'Electric Guitar' },
                { brand: 'Gibson', model: 'Les Paul Standard', year: '1959', type: 'Electric Guitar' },
                { brand: 'Roland', model: 'Jupiter-8', year: '1981', type: 'Synthesizer' }
            ]
        };
    }

    try {
        const { getSystemConfig } = await import('./admin');
        const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';
        const bulkPrompt = await getSystemConfig('ai_bulk_prompt');

        const prompt = bulkPrompt ? `${bulkPrompt}\n\nRAW LIST:\n${textList}` : `
        You are an expert instrument appraiser. I will give you a raw list of instruments. 
        Please parse them into a JSON ARRAY of objects.
        Each object must have: brand, model, type, year (if estimable), and valid description.
        If a line is garbage, ignore it.
        
        RAW LIST:
        ${textList}
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);

        const json = await response.json();
        const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textContent) throw new Error('No content');

        return { success: true, data: JSON.parse(textContent) };
    } catch (error: any) {
        console.error('Gemini Bulk Analysis Error:', error);
        return { success: false, error: error.message };
    }
}
