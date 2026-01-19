'use server';

import { InstrumentSchema } from '@/lib/schemas';
// import { Instrument } from '@/types/instrument';

import { getSystemConfig } from '@/actions/admin';

export async function generateInstrumentPrompt(
    name: string,
    description: string,
    specs: string,
    urls: string,
    imageUrls: string
) {
    const defaultPrompt = `
You are an expert musical instrument archivist and appraiser.
I need you to extract structured data for a specific instrument: "${name}".

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

    const configPrompt = await getSystemConfig('ai_user_import_prompt');

    // Inject variables if using custom prompt, or use default which already has them interpolated
    let finalPrompt = '';

    if (configPrompt) {
        // Simple variable replacement for custom prompts (using {{var}} style or just appending if simple)
        // For robustness, let's assume the admin will write a prompt that expects these inputs.
        // But to pass pass variables safely we usually inject them.
        // Let's adopt a standard: replace {{description}}, {{specs}}, etc.
        finalPrompt = configPrompt
            .replace('{{description}}', description)
            .replace('{{specs}}', specs)
            .replace('{{urls}}', urls)
            .replace('{{imageUrls}}', imageUrls);

        // Fallback if no placeholders found (legacy/bad config protection): Append data at end? 
        // Or just trust the admin knows? Let's safeguard by checking if placeholders exist.
        if (!configPrompt.includes('{{description}}')) {
            finalPrompt = configPrompt + `\n\nINPUT DATA:\nDesc: ${description}\nSpecs: ${specs}\nURLs: ${urls}\nImages: ${imageUrls}`;
        }
    } else {
        finalPrompt = defaultPrompt;
    }

    return { success: true, prompt: finalPrompt.trim() };
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
        if (!Array.isArray(parsed.specs)) {
            parsed.specs = [];
        } else {
            // Fix spec items to match Zod schema: { category, label, value }
            parsed.specs = parsed.specs.map((item: any) => {
                // Map common AI variations to 'label'
                const label = item.label || item.name || item.key || item.field || "Feature";
                // Map 'category' or default
                const category = item.category || item.group || item.section || "General";
                // Map 'value' or stringify
                let value = item.value;
                if (value === undefined || value === null) value = "Yes"; // Boolean flags often come as true/null
                if (typeof value !== 'string') value = String(value);

                return { category, label, value };
            }).filter((item: any) => item.label && item.value); // Filter out garbage
        }

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
