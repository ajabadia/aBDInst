/**
 * Script to update AI system prompt with artist/album detection
 * Creates a new version in the database without overwriting the current one
 * 
 * Run with: npx tsx scripts/update-ai-prompt.ts
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://triaje_app:n5xPD0qsuhYDSTdj@triaje-traumatologia.wqogpoz.mongodb.net/instrument-collector?retryWrites=true&w=majority';

// Define SystemConfig schema
const SystemConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    version: { type: Number, default: 1 },
    history: [{
        value: mongoose.Schema.Types.Mixed,
        version: Number,
        timestamp: Date
    }]
}, { timestamps: true });

const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
}


if (!currentConfig) {
    console.log('❌ No existing ai_system_prompt found in database');
    console.log('Creating new one with artist/album detection...');
} else {
    console.log('✅ Current prompt found');
    console.log('📝 Current version:', currentConfig.version || 1);
    console.log('📅 Last updated:', currentConfig.updatedAt);
    console.log('\n--- Current Prompt ---');
    console.log(currentConfig.value);
    console.log('--- End Current Prompt ---\n');
}

const newPrompt = `You are an expert instrument appraiser and music historian. Analyze the provided image/text and return a JSON object with the following structure:

{
  "brand": "string",
  "model": "string",
  "type": "string",
  "subtype": "string (optional)",
  "year": "string or number",
  "description": "string",
  "specs": [
    {
      "category": "string",
      "label": "string",
      "value": "string"
    }
  ],
  "originalPrice": {
    "price": number,
    "currency": "string",
    "year": number
  },
  "marketValue": {
    "estimatedPrice": number,
    "currency": "string",
    "priceRange": "string"
  },
  "artists": [
    {
      "name": "string (artist/band name)",
      "key": "string (lowercase slug, e.g., 'kraftwerk', 'pink-floyd')",
      "yearsUsed": "string (e.g., '1974-1982' or 'early 80s')",
      "notes": "string (optional context about usage)"
    }
  ],
  "albums": [
    {
      "title": "string (album name)",
      "artist": "string (artist name)",
      "year": number,
      "notes": "string (optional, e.g., 'used on track X')"
    }
  ]
}

IMPORTANT INSTRUCTIONS FOR ARTISTS AND ALBUMS:
- Only include artists/albums if you have RELIABLE information about this specific instrument model being used by them
- For "key", convert artist name to lowercase slug (e.g., "Kraftwerk" → "kraftwerk", "Pink Floyd" → "pink-floyd")
- Be conservative: if you're not confident, leave the arrays empty
- Focus on FAMOUS/NOTABLE uses that are well-documented
- For vintage/iconic instruments, research their historical significance

Examples:
- Minimoog Model D → artists: [{"name": "Kraftwerk", "key": "kraftwerk", "yearsUsed": "1970s"}]
- Fender Precision Bass → artists: [{"name": "James Jamerson", "key": "james-jamerson"}]
- Roland TB-303 → albums: [{"title": "Acid Tracks", "artist": "Phuture", "year": 1987}]`;

// Create new version
const newVersion = (currentConfig?.version || 0) + 1;

const updated = await SystemConfig.findOneAndUpdate(
    { key: 'ai_system_prompt' },
    {
        $set: {
            value: newPrompt,
            version: newVersion,
            updatedAt: new Date()
        },
        $push: {
            history: {
                value: currentConfig?.value || 'Initial version',
                version: currentConfig?.version || 1,
                timestamp: currentConfig?.updatedAt || new Date()
            }
        }
    },
    { upsert: true, new: true }
);

console.log('\n✅ Prompt updated successfully!');
console.log('📝 New version:', updated.version);
console.log('📅 Updated at:', updated.updatedAt);
console.log('\n--- New Prompt ---');
console.log(updated.value);
console.log('--- End New Prompt ---\n');

console.log('🎯 The AI will now detect:');
console.log('   - Artists/bands that used this instrument');
console.log('   - Albums where this instrument was featured');
console.log('\n📋 JSON fields added:');
console.log('   - artists: [{ name, key, yearsUsed, notes }]');
console.log('   - albums: [{ title, artist, year, notes }]');
}

updateAIPrompt()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
