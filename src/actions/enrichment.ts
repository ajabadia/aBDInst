
'use server';

import { reverbService } from '@/lib/api/reverb';
import { synthVintageScraper } from '@/lib/api/synthvintage';
import { synthSpecsService } from '@/lib/api/synth-specs';

// Helper to strip HTML tags
function stripHtml(html: string) {
    if (!html) return '';
    return html
        .replace(/<[^>]*>?/gm, '') // Remove tags
        .replace(/&nbsp;/g, ' ')   // Replace common entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
}

export async function getDeepEnrichment(brand: string, model: string) {
    let cleanBrand = brand.trim();
    let cleanModel = model.trim();

    // Specific cleaning for common discrepancies
    if (cleanBrand.toLowerCase() === 'akai' && cleanModel.toLowerCase().startsWith('professional ')) {
        cleanModel = cleanModel.substring(13);
    }

    let query = `${cleanBrand} ${cleanModel}`.trim();
    const isUrl = query.startsWith('http') && query.includes('reverb.com');
    const originalUrl = isUrl ? query : '';

    console.log(`[Enrichment] Iniciando búsqueda profunda para: ${query} (Original: ${brand} ${model})`);

    let urlListingData = null;
    if (isUrl) {
        const match = query.match(/item\/(\d+)/);
        const listingId = match ? match[1] : null;
        if (listingId) {
            console.log(`[Enrichment] Extracting data from Reverb ID: ${listingId}`);
            urlListingData = await reverbService.getListingById(listingId);
            if (urlListingData) {
                cleanBrand = urlListingData.make;
                // Clean messy models like "MPC Studio [Music production...]"
                cleanModel = urlListingData.model.split('[')[0].split('(')[0].trim();
                query = `${cleanBrand} ${cleanModel}`.trim();
            } else {
                // Fallback: try to guess brand/model from the URL slug
                const slugMatch = query.match(/item\/\d+-([^/?]+)/);
                if (slugMatch) {
                    const slug = slugMatch[1].replace(/-/g, ' ');
                    const parts = slug.split(' ');
                    cleanBrand = parts[0];
                    cleanModel = parts.slice(1).join(' ');
                    query = slug;
                    console.log(`[Enrichment] Fallback slug extraction: ${cleanBrand} / ${cleanModel}`);
                }
            }
        }
    }

    try {
        // 1. Run all enrichment sources in parallel with smart retries for naming variations
        const [reverbProduct, synthVintage, synthApi, reverbGuide] = await Promise.allSettled([
            reverbService.getProductData(query),
            // Try variations for VintageSynth (e.g. MS20 -> MS-20 or vice versa)
            synthVintageScraper.findSpecs(cleanBrand, cleanModel).then(async (res) => {
                if (res) return res;
                const hyphenated = cleanModel.includes('-') ? cleanModel.replace('-', '') : `${cleanModel.slice(0, 2)}-${cleanModel.slice(2)}`;
                const res2 = await synthVintageScraper.findSpecs(cleanBrand, hyphenated);
                if (res2) return res2;
                // Last ditch: try without brand prefix if model is unique
                return await synthVintageScraper.findSpecs(cleanBrand, `${cleanBrand} ${cleanModel}`);
            }),
            synthSpecsService.findSynthSpecs(cleanBrand, cleanModel),
            reverbService.getPriceGuide(query)
        ]);

        const results: any = {
            success: true,
            sources: [],
            data: {
                brand: cleanBrand,
                model: cleanModel,
                type: 'Synthesizer', // Default fallback
                description: '',
                year: '',
                specs: [] as any[],
                images: [] as string[],
                productionYears: '',
                marketValue: null as any,
                reverbUrl: originalUrl
            }
        };

        // If we have specific URL data, pre-populate from it
        if (urlListingData) {
            results.sources.push('reverb-direct');
            // Use the full listing description if available, otherwise title
            results.data.description = stripHtml(urlListingData.description || urlListingData.title);

            if (urlListingData.photos?.[0]?._links?.large_crop?.href) {
                results.data.images.push(urlListingData.photos[0]._links.large_crop.href);
            }
            results.data.marketValue = {
                estimatedPrice: parseFloat(urlListingData.price.amount),
                currency: urlListingData.price.currency,
                priceRange: {
                    min: parseFloat(urlListingData.price.amount) * 0.9,
                    max: parseFloat(urlListingData.price.amount) * 1.1
                }
            };

            // 1. Map product_specifications (usually the most accurate technical data)
            if (urlListingData.product_specifications) {
                urlListingData.product_specifications.forEach(spec => {
                    if (!results.data.specs.some((s: any) => s.label === spec.display_name)) {
                        results.data.specs.push({
                            category: 'Technical',
                            label: spec.display_name,
                            value: stripHtml(spec.value)
                        });
                    }
                });
            }

            // 2. Map structured attributes
            if (urlListingData.attributes) {
                Object.entries(urlListingData.attributes).forEach(([key, val]) => {
                    const cleanKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                    if (!results.data.specs.some((s: any) => s.label === cleanKey)) {
                        results.data.specs.push({
                            category: 'Reverb Attributes',
                            label: cleanKey,
                            value: stripHtml(String(val))
                        });
                    }
                });
            }

            // 3. Follow associated product link for deep metadata if specs are still sparse
            if (urlListingData._links?.product?.href && results.data.specs.length < 5) {
                try {
                    const productData = await reverbService.getByUrl(urlListingData._links.product.href);
                    if (productData && productData.product_specifications) {
                        productData.product_specifications.forEach((spec: any) => {
                            if (!results.data.specs.some((s: any) => s.label === spec.display_name)) {
                                results.data.specs.push({
                                    category: 'Technical',
                                    label: spec.display_name,
                                    value: stripHtml(spec.value)
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.warn('[Enrichment] Failed to follow product link:', e);
                }
            }
        }

        // Process Synth-API (Synthesizer-API)
        if (synthApi.status === 'fulfilled' && synthApi.value) {
            results.sources.push('synthesizer-api');
            const apiSpecs = synthSpecsService.mapToInstrumentSpecs(synthApi.value);
            results.data.specs.push(...apiSpecs);
            if (synthApi.value.yearProduced) {
                results.data.year = String(synthApi.value.yearProduced);
            }
        }

        // Process Reverb
        if (reverbProduct.status === 'fulfilled' && reverbProduct.value) {
            results.sources.push('reverb');
            // Prefer the most detailed description
            if (reverbProduct.value.description && (!results.data.description || reverbProduct.value.description.length > results.data.description.length)) {
                results.data.description = reverbProduct.value.description;
            }
            if (reverbProduct.value.productionYears) {
                results.data.productionYears = reverbProduct.value.productionYears;
                results.data.year = reverbProduct.value.productionYears;
            }
            if (reverbProduct.value.imageUrl) {
                results.data.images.push(reverbProduct.value.imageUrl);
            }
            if (reverbProduct.value.specs) {
                // Reverb specs are often key-value pairs
                Object.entries(reverbProduct.value.specs).forEach(([key, val]) => {
                    results.data.specs.push({ category: 'Technical', label: key, value: String(val) });
                });
            }
        }

        // Process SynthVintage (Vintage Synth Explorer)
        if (synthVintage.status === 'fulfilled' && synthVintage.value) {
            results.sources.push('vintagesynth');
            // Prefer VS description if it's more detailed or if Reverb is missing it
            if (!results.data.description || synthVintage.value.description.length > results.data.description.length) {
                results.data.description = stripHtml(synthVintage.value.description);
            }
            if (synthVintage.value.imageUrl) {
                results.data.images.push(synthVintage.value.imageUrl);
            }

            // Map VS specs
            synthVintage.value.specs.forEach(s => {
                results.data.specs.push({ category: 'Vintage Synth', label: s.label, value: s.value });
            });
        }

        // Deduplicate specs by label (case insensitive)
        const seenLabels = new Set();
        results.data.specs = results.data.specs.filter((s: any) => {
            const key = `${s.category}:${s.label}`.toLowerCase();
            if (seenLabels.has(key)) return false;
            seenLabels.add(key);
            return true;
        });

        // Process Price Guide
        if (reverbGuide.status === 'fulfilled' && reverbGuide.value && reverbGuide.value.min > 0) {
            results.data.marketValue = {
                estimatedPrice: Math.round((reverbGuide.value.min + reverbGuide.value.max) / 2),
                currency: reverbGuide.value.currency,
                priceRange: {
                    min: reverbGuide.value.min,
                    max: reverbGuide.value.max
                }
            };
        }

        // Infer type if possible from descriptions or specs
        const fullContent = `${results.data.description} ${results.data.specs.map((s: any) => s.value).join(' ')}`.toLowerCase();
        if (fullContent.includes('drum machine') || fullContent.includes('ritmos') || fullContent.includes('mpc')) results.data.type = 'Drum Machine';
        else if (fullContent.includes('modular') || fullContent.includes('eurorack')) results.data.type = 'Modular';
        else if (fullContent.includes('guitar') || fullContent.includes('guitarra')) results.data.type = 'Guitar';
        else if (fullContent.includes('effect') || fullContent.includes('pedal')) results.data.type = 'Effect';
        else if (fullContent.includes('controller') || fullContent.includes('controlador')) results.data.type = 'Controller';

        // FINAL STEP: If results are thin, use Gemini to "organize" and "expand" the technical data
        if (results.data.specs.length < 3) {
            try {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                // Combine all structured technical data for Gemini context
                let technicalContext = '';
                if (urlListingData) {
                    if (urlListingData.product_specifications) {
                        technicalContext += urlListingData.product_specifications
                            .map(s => `${s.display_name}: ${stripHtml(s.value)}`)
                            .join('\n');
                    }
                    if (urlListingData.attributes) {
                        technicalContext += (technicalContext ? '\n' : '') +
                            Object.entries(urlListingData.attributes)
                                .map(([k, v]) => `${k}: ${stripHtml(String(v))}`)
                                .join('\n');
                    }
                }

                const prompt = `Eres un experto en instrumentos musicales y tecnología de audio (tasador técnico).
                Analiza el instrumento: "${query}" (Marca: ${results.data.brand}, Modelo: ${results.data.model}).

                ${results.data.description ? `DESCRIPCIÓN DEL ANUNCIO (Texto Libre):\n${results.data.description}\n` : ''}
                ${technicalContext ? `ESPECIFICACIONES TÉCNICAS DETECTADAS (Usa esto como base):\n${technicalContext}\n` : ''}

                Devuelve un JSON PURO (sin markdown, solo las llaves) con esta estructura exacta:
                {
                  "brand": "Marca Limpia (ej: Akai)",
                  "model": "Modelo Limpio (ej: MPC Studio)",
                  "type": "Synthesizer" | "Drum Machine" | "Sampler" | "Effect" | "Modular" | "Controller",
                  "year": "YYYY",
                  "description": "Una descripción NARRATIVA de al menos 3 párrafos cubriendo historia y carácter. NO incluyas listas de specs aquí.",
                  "specs": [
                    { "category": "Conectividad" | "Hardware" | "Arquitectura" | "Secuenciador", "label": "Nombre Spec", "value": "Valor" }
                  ],
                  "marketValue": {
                    "estimatedPrice": 850,
                    "currency": "EUR",
                    "priceRange": { "min": 750, "max": 1100 }
                  }
                }
                INSTRUCCIONES CRÍTICAS:
                1. EXTRAE Y TRANSFORMA los datos técnicos del anuncio a la lista de "specs".
                2. Si el anuncio menciona "16 pads", "USB MIDI", "MIDI In/Out", o cualquier detalle técnico, DEBEN ir en la lista "specs" con labels claros.
                3. NO pongas datos técnicos como listas dentro del campo "description". La "description" debe ser un texto fluido y narrativo.
                4. LA DESCRIPCIÓN DEBE SER TEXTO PLANO O MARKDOWN LIGERO. PROHIBIDO usar etiquetas HTML (como <p>, <b>, <strong>).
                5. Si es un controlador o sampler, usa categorías como "Interfaz", "Pads", "Control MIDI".
                6. Sé muy detallado con las especificaciones técnicas (genera al menos 10 campos de specs combinando el anuncio con tu conocimiento técnico).
                7. En 'brand' y 'model', extrae solo el nombre oficial limpio.`;

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                // Clean markdown artifacts
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiData = JSON.parse(jsonStr);

                if (aiData) {
                    results.sources.push('gemini-enrich');
                    if (aiData.brand) results.data.brand = aiData.brand;
                    if (aiData.model) results.data.model = aiData.model;
                    if (!results.data.year) results.data.year = aiData.year;
                    if (!results.data.description || results.data.description.length < 50) results.data.description = stripHtml(aiData.description);
                    if (aiData.type) results.data.type = aiData.type;

                    // Add specs from AI, avoiding duplicates
                    if (aiData.specs && Array.isArray(aiData.specs)) {
                        aiData.specs.forEach((s: any) => {
                            if (!results.data.specs.some((existing: any) => existing.label.toLowerCase() === s.label.toLowerCase())) {
                                results.data.specs.push(s);
                            }
                        });
                    }
                    if (!results.data.marketValue && aiData.marketValue) {
                        results.data.marketValue = aiData.marketValue;
                    }
                }
            } catch (aiError) {
                console.warn('[Enrichment] Gemini Fallback failed:', aiError);
            }
        }

        return results;

    } catch (error) {
        console.error('Deep Enrichment Error:', error);
        return { success: false, error: 'Failed to aggregate enrichment data' };
    }
}
