import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import SystemConfig from '../models/SystemConfig';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const NEW_PROMPT = `You are an expert instrument appraiser. Analyze the provided image/text and return a JSON object with brand, model, type, year, description, specs (array of category/label/value), originalPrice (price/currency/year), and marketValue (estimatedPrice/currency/priceRange).

IMPORTANT JSON FORMATTING RULES:
1. Output valid JSON only.
2. Escape all double quotes within string values using a backslash (e.g. "text with \\"quotes\\" inside").
3. Do not include markdown formatting like \`\`\`json.`;

async function updatePrompts() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Update or Upsert the prompt
        await SystemConfig.findOneAndUpdate(
            { key: 'ai_system_prompt' },
            {
                value: NEW_PROMPT,
                updatedAt: new Date(),
                $push: {
                    history: {
                        value: NEW_PROMPT,
                        updatedAt: new Date(),
                        updatedBy: 'script-v2'
                    }
                }
            },
            { upsert: true, new: true }
        );

        console.log('Successfully updated ai_system_prompt with escaping instructions.');

        process.exit(0);
    } catch (error) {
        console.error('Error updating prompts:', error);
        process.exit(1);
    }
}

updatePrompts();
