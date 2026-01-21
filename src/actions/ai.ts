import { createSafeAction } from '@/lib/safe-action';
import { z } from 'zod';
import { AppError, AuthError, ValidationError, ExternalServiceError } from '@/lib/errors';
import { logEvent } from '@/lib/logger';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { extractFromUrl } from '@/lib/scraper-mapping';

// Prompt Templates
const BADGE_PROMPT_TEMPLATE = `
Design a premium, 3D glassmorphism style icon for a gamification badge.
Concept: {{NAME}}
Description: {{DESCRIPTION}}
Visual Elements: Simple, elegant, abstract, colorful.
Background: Solid distinct color (E.g. #1e1e1e or similar) for easy removal.
Style: Apple App Icon style, high gloss, soft shadows.
`;

export const getAISystemPrompt = createSafeAction(
    z.any().optional(),
    async (_, userId, role, correlationId) => {
        try {
            const { getSystemConfig } = await import('./admin');
            const prompt = await getSystemConfig('ai_system_prompt') || "Default prompt...";
            return { prompt };
        } catch (error: any) {
            throw new AppError(error.message, 500, 'AI_CONFIG_ERROR');
        }
    },
    { allowedRoles: ['admin'] }
);

export async function generateBadgePrompt(name: string, description: string) {
    return BADGE_PROMPT_TEMPLATE
        .replace('{{NAME}}', name)
        .replace('{{DESCRIPTION}}', description);
}

// Placeholder for Image Generation (Since we might not have Imagen/DALL-E configured yet)
export const generateBadgeImage = createSafeAction(
    z.string(),
    async (prompt, userId, role, correlationId) => {
        // Simulate AI Work
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Return a random "premium" abstract 3d icon from Unsplash for demo
        const mockImages = [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1633511090164-b43840ea1607?q=80&w=2564&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop"
        ];

        const url = mockImages[Math.floor(Math.random() * mockImages.length)];

        await logEvent({
            nivel: 'INFO',
            origen: 'AI_ACTION',
            accion: 'GENERATE_BADGE_IMAGE',
            mensaje: `Imagen de insignia generada para el usuario ${userId}`,
            correlacion_id: correlationId,
            detalles: { prompt: prompt.slice(0, 50) }
        });

        return {
            url,
            note: "Simulated AI Generation (Connect Imagen API to enable real generation)"
        };
    },
    { protected: true }
);

// analyzeInstrumentImage and analyzeInstrumentText

export const analyzeInstrumentImage = createSafeAction(
    z.any(),
    async (formData: FormData, userId, role, correlationId) => {
        const imageFile = formData.get('image') as File;
        if (!imageFile) {
            throw new ValidationError('No se proporcionó ninguna imagen');
        }

        // Convert file to base64
        const buffer = await imageFile.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return {
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
            };
        }

        try {
            const { getSystemConfig } = await import('./admin');
            const systemPrompt = await getSystemConfig('ai_system_prompt') || "You are an expert instrument appraiser. Analyze the provided image/text and return a JSON object with brand, model, type, year, description, specs (array of category/label/value), originalPrice (price/currency/year), and marketValue (estimatedPrice/currency/priceRange). IMPORTANT: Escape all double quotes within string values (e.g. \"text with \\\"quotes\\\"\"). Output valid JSON only.";
            const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';

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

            if (response.status === 429) {
                throw new AppError('Cuota de IA agotada. Por favor, cambia el modelo en el Panel Admin o espera unos minutos.', 429, 'AI_RATE_LIMIT');
            }

            if (!response.ok) {
                throw new ExternalServiceError('Gemini', `API Error: ${response.status}`);
            }

            const json = await response.json();
            const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textContent) throw new ExternalServiceError('Gemini', 'No content generated');

            await logEvent({
                nivel: 'INFO',
                origen: 'AI_ACTION',
                accion: 'ANALYZE_IMAGE',
                mensaje: `Imagen analizada por IA para el usuario ${userId}`,
                correlacion_id: correlationId,
                detalles: { modelName }
            });

            return JSON.parse(textContent);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message, 500, 'AI_ANALYSIS_ERROR');
        }
    },
    { protected: true }
);

export const analyzeInstrumentText = createSafeAction(
    z.object({
        query: z.string(),
        contextUrls: z.array(z.string()).optional()
    }),
    async ({ query, contextUrls }, userId, role, correlationId) => {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return {
                brand: query.split(' ')[0] || 'Desconocido',
                model: query.split(' ').slice(1).join(' ') || 'Modelo',
                type: 'Synthesizer',
                description: `Información recuperada para "${query}"`,
                year: '1990',
                specs: [{ category: 'Arquitectura y Voces', label: 'Nota', value: 'Datos de prueba (Mock)' }]
            };
        }

        try {
            const { getSystemConfig } = await import('./admin');
            const systemPrompt = await getSystemConfig('ai_system_prompt') || "You are an expert instrument appraiser. Analyze the provided image/text and return a JSON object with brand, model, type, year, description, specs (array of category/label/value), originalPrice (price/currency/year), and marketValue (estimatedPrice/currency/priceRange).";
            const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';

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

            if (response.status === 429) {
                throw new AppError('Cuota de IA agotada.', 429, 'AI_RATE_LIMIT');
            }

            if (!response.ok) {
                throw new ExternalServiceError('Gemini', `API Error: ${response.status}`);
            }

            const json = await response.json();
            const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textContent) throw new ExternalServiceError('Gemini', 'No content generated');

            await logEvent({
                nivel: 'INFO',
                origen: 'AI_ACTION',
                accion: 'ANALYZE_TEXT',
                mensaje: `Texto analizado por IA: "${query}"`,
                correlacion_id: correlationId,
                detalles: { query, modelName }
            });

            return JSON.parse(textContent);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message, 500, 'AI_ANALYSIS_ERROR');
        }
    },
    { protected: true }
);

export const analyzeInstrumentUrl = createSafeAction(
    z.string().url(),
    async (url, userId, role, correlationId) => {
        try {
            // 1. Try Site-Specific Scraper
            const scrapedData = await extractFromUrl(url);
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey && scrapedData) {
                return scrapedData;
            }

            // 2. Fetch HTML for AI analysis
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                },
                next: { revalidate: 3600 }
            });

            if (!response.ok) {
                if (scrapedData) return scrapedData;

                if ([403, 401, 429].includes(response.status)) {
                    if (!apiKey) {
                        throw new AppError(`El sitio bloqueó el acceso (${response.status}). Configura la API Key para intentar inferir datos del enlace.`, 403, 'SCRAPER_BLOCKED');
                    }

                    const { getSystemConfig } = await import('./admin');
                    const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';
                    const fallbackPrompt = await getSystemConfig('ai_scraper_fallback_prompt') || `
                        You are an expert instrument appraiser. I cannot access the website content due to privacy protection.
                        ANALYZE ONLY THIS URL: "${url}"
                        Extract or Infer the likely Brand, Model, Type, and Year from the URL slug itself.
                        Return a valid JSON object.
                    `;

                    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: fallbackPrompt }] }],
                            generationConfig: { response_mime_type: "application/json" }
                        })
                    });

                    if (!geminiResponse.ok) throw new ExternalServiceError('Gemini Fallback', `Error: ${geminiResponse.status}`);
                    const json = await geminiResponse.json();
                    const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

                    return JSON.parse(textContent);
                }

                throw new ExternalServiceError('Scraper', `HTTP Error: ${response.status}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            $('script, style, nav, footer, header, .ads, #footer, #header').remove();
            const pageTitle = $('title').text();
            const mainText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000);

            if (!apiKey) {
                return scrapedData || {
                    brand: 'AI Scrape',
                    model: 'Mock Result',
                    description: `Contenido extraído de ${url}. Configura la API Key para análisis real.`
                };
            }

            const { getSystemConfig } = await import('./admin');
            const systemPrompt = await getSystemConfig('ai_system_prompt') || "You are an expert instrument appraiser. Extract brand, model, type, specs, description, and price from the provided raw page text.";
            const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';

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
                if (scrapedData) return scrapedData;
                throw new ExternalServiceError('Gemini', `API Error: ${geminiResponse.status}`);
            }

            const json = await geminiResponse.json();
            const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

            await logEvent({
                nivel: 'INFO',
                origen: 'AI_ACTION',
                accion: 'ANALYZE_URL',
                mensaje: `URL analizada por IA: ${url}`,
                correlacion_id: correlationId,
                detalles: { url, modelName }
            });

            return JSON.parse(textContent);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message, 500, 'AI_URL_ANALYSIS_ERROR');
        }
    },
    { protected: true }
);

export const analyzeBulkList = createSafeAction(
    z.string(),
    async (textList, userId, role, correlationId) => {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return [
                { brand: 'Fender', model: 'Stratocaster', year: '1954', type: 'Electric Guitar' },
                { brand: 'Gibson', model: 'Les Paul Standard', year: '1959', type: 'Electric Guitar' },
                { brand: 'Roland', model: 'Jupiter-8', year: '1981', type: 'Synthesizer' }
            ];
        }

        try {
            const { getSystemConfig } = await import('./admin');
            const modelName = await getSystemConfig('ai_model_name') || 'gemini-3-flash-preview';
            const bulkPrompt = await getSystemConfig('ai_bulk_prompt');

            const prompt = bulkPrompt ? `${bulkPrompt}\n\nRAW LIST:\n${textList}` : `
                You are an expert instrument appraiser. I will give you a raw list of instruments. 
                Please parse them into a JSON ARRAY of objects.
                Each object must have: brand, model, type, year (if estimable), and valid description.
                RAW LIST:
                ${textList}
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            });

            if (!response.ok) throw new ExternalServiceError('Gemini', `API Error: ${response.status}`);

            const json = await response.json();
            const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textContent) throw new ExternalServiceError('Gemini', 'No content');

            await logEvent({
                nivel: 'INFO',
                origen: 'AI_ACTION',
                accion: 'ANALYZE_BULK',
                mensaje: `Lista masiva analizada por IA para el usuario ${userId}`,
                correlacion_id: correlationId,
                detalles: { listLength: textList.length }
            });

            return JSON.parse(textContent);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message, 500, 'AI_BULK_ANALYSIS_ERROR');
        }
    },
    { protected: true }
);


export const getMarketInsight = createSafeAction(
    z.object({
        stats: z.any(),
        query: z.string()
    }),
    async ({ stats, query }, userId, role, correlationId) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                insight: "El mercado muestra una tendencia estable. Considerando la rareza del ítem, es un buen momento para mantener.",
                sentiment: "neutral",
                recommendation: "hold"
            };
        }

        try {
            const { getSystemConfig } = await import('./admin');
            const modelName = await getSystemConfig('ai_model_name') || 'gemini-2.0-flash-exp';

            const prompt = `
                You are a financial advisor specializing in vintage musical instruments.
                Analyze the following market statistics for "${query}":
                ${JSON.stringify(stats, null, 2)}
                Provide a brief strategic insight and determine sentiment and recommendation.
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

            if (!response.ok) throw new ExternalServiceError('Gemini', `API Error: ${response.status}`);

            const json = await response.json();
            const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

            await logEvent({
                nivel: 'INFO',
                origen: 'AI_ACTION',
                accion: 'MARKET_INSIGHT',
                mensaje: `Insight de mercado generado para: ${query}`,
                correlacion_id: correlationId,
                detalles: { query }
            });

            return JSON.parse(textContent);
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message, 500, 'MARKET_INSIGHT_ERROR');
        }
    },
    { protected: true }
);

export const fetchAvailableModels = createSafeAction(
    z.any().optional(),
    async (_, userId, role, correlationId) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new AppError('API Key no configurada', 400, 'MISSING_API_KEY');

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (!response.ok) throw new ExternalServiceError('Gemini', `HTTP Error: ${response.status}`);

            const data = await response.json();
            const models = (data.models || [])
                .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
                .map((m: any) => ({
                    value: m.name.replace('models/', ''),
                    label: `${m.displayName} (${m.name.replace('models/', '')})`
                }));

            return { models };
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message, 500, 'FETCH_MODELS_ERROR');
        }
    },
    { allowedRoles: ['admin'] }
);

export const generateBlogContent = createSafeAction(
    z.object({
        prompt: z.string(),
        context: z.object({
            title: z.string().optional(),
            currentContent: z.string().optional(),
            linkedInstruments: z.array(z.any()).optional()
        })
    }),
    async ({ prompt, context }, userId, role, correlationId) => {
        try {
            await dbConnect();
            const user = await User.findById(userId).select('+aiConfig.apiKey');

            let apiKey = user?.aiConfig?.apiKey || process.env.GEMINI_API_KEY;
            let modelName = user?.aiConfig?.model || 'gemini-2.0-flash-exp';

            if (!apiKey) throw new AppError('No AI API Key configured. Please add one in your settings or ask Admin.', 400, 'MISSING_API_KEY');

            const contextString = `
                CONTEXT:
                Title: ${context.title || 'Untitled'}
                Current Draft: "${(context.currentContent || '').slice(-2000)}" 
                Linked Instruments: ${JSON.stringify(context.linkedInstruments || [], null, 2)}
            `;

            const { getSystemConfig } = await import('@/actions/admin');
            const systemPrompt = await getSystemConfig('ai_writer_prompt') || "You are an expert music journalist. Assist the user in writing a blog article.";

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: systemPrompt },
                            { text: `${prompt}\n\n${contextString}` }
                        ]
                    }],
                    generationConfig: { response_mime_type: "text/plain" }
                })
            });

            if (!response.ok) throw new ExternalServiceError('Gemini', `API Error: ${response.status}`);
            const json = await response.json();
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

            await logEvent({
                nivel: 'INFO',
                origen: 'AI_ACTION',
                accion: 'GENERATE_BLOG',
                mensaje: `Contenido de blog generado para el usuario ${userId}`,
                correlacion_id: correlationId,
                detalles: { modelName, promptPreview: prompt.slice(0, 50) }
            });

            return text;
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError(error.message, 500, 'BLOG_GENERATION_ERROR');
        }
    },
    { protected: true }
);

