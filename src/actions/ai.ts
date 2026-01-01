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
        const systemPrompt = await getSystemConfig('ai_system_prompt');
        const modelName = await getSystemConfig('ai_model_name') || 'gemini-1.5-flash';

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
        const systemPrompt = await getSystemConfig('ai_system_prompt');
        const modelName = await getSystemConfig('ai_model_name') || 'gemini-1.5-flash';

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
