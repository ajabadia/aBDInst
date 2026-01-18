'use server';

import { InstrumentSchema } from '@/lib/schemas';
// import { Instrument } from '@/types/instrument';

export async function generateInstrumentPrompt(
    description: string,
    specs: string,
    urls: string,
    imageUrls: string
) {
    const prompt = `
You are an expert musical instrument archivist and appraiser.
I need you to extract structured data for a specific instrument based on the rough notes and links provided below.

INPUT DATA:
Description/Notes: "${description}"
Technical Specs/Details: "${specs}"
Reference URLs: "${urls}"
Image URLs: "${imageUrls}"

TASK:
Analyze the input data. If specific details are missing, use your internal knowledge base to infer accurate technical specifications for the identified instrument model.

CRITICAL JSON FORMAT RULES:
1. Return ONLY valid JSON - no markdown formatting, no code fences, no extra text
2. Use DOUBLE QUOTES for all property names and string values
3. Do NOT use trailing commas
4. Ensure all brackets and braces are properly closed

OUTPUT SCHEMA:
{
    "brand": "string (Required, e.g., Roland)",
    "model": "string (Required, e.g., Juno-106)",
    "type": "string (Required, e.g., Synthesizer)",
    "subtype": "string (Optional, e.g., Analog Polyphonic)",
    "years": ["string"], 
    "description": "string (A comprehensive, professional description, 2-3 paragraphs)",
    "specs": [
        { "category": "string", "label": "string", "value": "string" }
    ],
    "websites": [
        { "url": "string", "isPrimary": true }
    ],
    "marketValue": {
        "original": { "price": 0, "currency": "USD", "year": 0 },
        "current": { "value": 0, "min": 0, "max": 0, "currency": "EUR" }
    }
}
`;

    return { success: true, prompt: prompt.trim() };
}

export async function validateInstrumentJSON(jsonString: string) {
    try {
        // 1. Clean markdown fences (```json or ```)
        let cleanString = jsonString.trim();
        if (cleanString.startsWith('```json')) {
            cleanString = cleanString.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleanString.startsWith('```')) {
            cleanString = cleanString.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }

        // 2. Try to fix common AI output issues
        // Remove trailing commas before closing braces/brackets
        cleanString = cleanString.replace(/,(\s*[}\]])/g, '$1');

        // Replace single quotes with double quotes (common AI mistake)
        // This is a simple heuristic - won't work for all cases but helps
        cleanString = cleanString.replace(/'/g, '"');

        // 3. Attempt to parse
        const parsed = JSON.parse(cleanString);

        // 4. Validate essential fields
        const errors = [];
        if (!parsed.brand) errors.push("Missing 'brand'");
        if (!parsed.model) errors.push("Missing 'model'");
        if (!parsed.type) errors.push("Missing 'type'");

        if (errors.length > 0) {
            return { success: false, error: "Validation Failed: " + errors.join(', ') };
        }

        // 5. Normalize structure
        if (!Array.isArray(parsed.specs)) parsed.specs = [];
        if (!Array.isArray(parsed.years)) {
            parsed.years = parsed.years ? [parsed.years.toString()] : [];
        }
        if (!Array.isArray(parsed.websites)) parsed.websites = [];

        // 6. Return sanitized object
        return { success: true, data: parsed };

    } catch (e: any) {
        // Provide helpful error message
        const errorMsg = e.message || "Unknown error";
        return {
            success: false,
            error: `Invalid JSON format: ${errorMsg}. Tip: Ensure all property names use double quotes and remove trailing commas.`
        };
    }
}
