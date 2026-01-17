'use server';

import { auth } from '@/auth';
import * as cheerio from 'cheerio';
import { extractFromUrl } from '@/lib/scraper-mapping';
import dbConnect from '@/lib/db';
import User from '@/models/User';

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

export async function analyzeInstrumentUrl(url: string) {
    const session = await auth();
    if (!session) return { success: false, error: 'No autorizado' };

    try {
        console.log(`--- SCRAPING URL: ${url} ---`);

        // 1. Try Site-Specific Scraper (Mapping for major sites)
        const scrapedData = await extractFromUrl(url);

        const apiKey = process.env.GEMINI_API_KEY;

        // If we have specific data and NO API Key, return what we have
        if (!apiKey && scrapedData) {
            return { success: true, data: scrapedData };
        }

        // 2. Fetch HTML for AI analysis (even if we have scrapedData, AI can help clean it or add context)
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            // If fetch fails but we have scrapedData, return it
            if (scrapedData) return { success: true, data: scrapedData };

            // NEW FALLBACK: If 403/Blocked, try to infer details from the URL string itself using AI
            if (response.status === 403 || response.status === 401 || response.status === 429) {
                console.warn(`[Blocked ${response.status}] Access denied to ${url}. Attempting AI URL inference.`);

                if (!apiKey) {
                    return { success: false, error: `El sitio bloqueó el acceso (${response.status}). Configura la API Key para intentar inferir datos del enlace.` };
                }

                const { getSystemConfig } = await import('./admin');
                const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';

                const fallbackPrompt = `
                    You are an expert instrument appraiser. I cannot access the website content due to privacy protection.
                    
                    ANALYZE ONLY THIS URL: "${url}"
                    
                    Extract or Infer the likely Brand, Model, Type, and Year from the URL slug itself.
                    The URL often contains the product name (e.g., /p/brand-model...).
                    
                    Return a valid JSON object with:
                    - brand (string)
                    - model (string)
                    - type (string)
                    - description (string): "Datos inferidos por IA desde el enlace (Sitio protegido)."
                    - specs (array of {category, label, value}): Generate likely specs for this model based on your training data.
                    
                    Be accurate with the model identification.
                `;

                const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: fallbackPrompt }] }],
                        generationConfig: { response_mime_type: "application/json" }
                    })
                });

                if (!geminiResponse.ok) throw new Error(`Fallback Analysis Error: ${geminiResponse.status}`);
                const json = await geminiResponse.json();
                const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

                return { success: true, data: JSON.parse(textContent) };
            }

            throw new Error(`HTTP Error: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove noise
        $('script, style, nav, footer, header, .ads, #footer, #header').remove();

        // Get main text content
        const pageTitle = $('title').text();
        const mainText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000);

        if (!apiKey) {
            return {
                success: true,
                data: scrapedData || {
                    brand: 'AI Scrape',
                    model: 'Mock Result',
                    description: `Contenido extraído de ${url}. Configura la API Key para análisis real.`
                }
            };
        }

        const { getSystemConfig } = await import('./admin');
        const systemPrompt = await getSystemConfig('ai_system_prompt') || "You are an expert instrument appraiser. Extract brand, model, type, specs, description, and price from the provided raw page text.";
        const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';

        // Provide scrapedData as context if available
        const contextString = scrapedData
            ? `\n\nPRE-SCRAPED DATA (Trust these values): ${JSON.stringify(scrapedData)}`
            : '';

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { text: `CONTEXT SOURCE: ${url}\nPAGE TITLE: ${pageTitle}${contextString}\n\nPAGE CONTENT:\n${mainText}` }
                    ]
                }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        if (!geminiResponse.ok) {
            if (scrapedData) return { success: true, data: scrapedData };
            throw new Error(`Gemini Error: ${geminiResponse.status}`);
        }

        const json = await geminiResponse.json();
        const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

        return { success: true, data: JSON.parse(textContent) };
    } catch (error: any) {
        console.error('URL Scrape & AI Analysis Error:', error);
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
        const modelName = await getSystemConfig('ai_model_name') || 'gemini-3-flash-preview';
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


export async function getMarketInsight(stats: any, query: string) {
    const session = await auth();
    if (!session) return { success: false, error: 'No autorizado' };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            data: {
                insight: "El mercado muestra una tendencia estable. Considerando la rareza del ítem, es un buen momento para mantener.",
                sentiment: "neutral",
                recommendation: "hold"
            }
        };
    }

    try {
        const { getSystemConfig } = await import('./admin');
        const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';

        const prompt = `
        You are a financial advisor specializing in vintage musical instruments.
        Analyze the following market statistics for "${query}":
        ${JSON.stringify(stats, null, 2)}

        Provide a brief, single-sentence strategic insight (under 20 words).
        Also determine the sentiment (bullish, bearish, neutral) and a recommendation (buy, sell, hold).

        Return JSON: { insight: string, sentiment: string, recommendation: string }
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);

        const json = await response.json();
        const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

        return { success: true, data: JSON.parse(textContent) };
    } catch (error: any) {
        console.error('Market Insight Error:', error);
        return { success: false, error: error.message };
    }
}

export async function fetchAvailableModels() {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
        return { success: false, error: 'No autorizado' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { success: false, error: 'API Key no configurada' };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) throw new Error(`Error fetching models: ${response.status}`);

        const data = await response.json();
        // Filter for generateContent support
        const models = (data.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => ({
                value: m.name.replace('models/', ''),
                label: `${m.displayName} (${m.name.replace('models/', '')})`
            }));

        return { success: true, models };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function generateBlogContent(prompt: string, context: { title?: string; currentContent?: string; linkedInstruments?: any[] }) {
    const session = await auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        await dbConnect();
        // Fetch user with secure field
        const user = await User.findById(session.user.id).select('+aiConfig.apiKey');

        let apiKey = user?.aiConfig?.apiKey || process.env.GEMINI_API_KEY;
        let modelName = user?.aiConfig?.model || 'gemini-2.0-flash-exp';

        if (!apiKey) throw new Error('No AI API Key configured. Please add one in your settings or ask Admin.');

        const contextString = `
        CONTEXT:
        Title: ${context.title || 'Untitled'}
        Current Draft: "${(context.currentContent || '').slice(-2000)}" 
        Linked Instruments: ${JSON.stringify(context.linkedInstruments || [], null, 2)}
        `;

        const systemPrompt = `
        You are an expert music journalist and instrument historian. 
        Assist the user in writing a blog article. 
        Tone: Professional, Passionate, Informative.
        Format: Markdown.
        
        Task: ${prompt}
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { text: contextString }
                    ]
                }],
                generationConfig: { response_mime_type: "text/plain" }
            })
        });

        if (!response.ok) throw new Error(`AI Error: ${response.status}`);
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

        return { success: true, data: text };

    } catch (error: any) {
        console.error('AI Blog Gen Error:', error);
        return { success: false, error: error.message };
    }
}

