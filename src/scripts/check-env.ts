
import fs from 'fs';
import path from 'path';

try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const hasCloudName = content.includes('CLOUDINARY_CLOUD_NAME=');
        const hasApiKey = content.includes('CLOUDINARY_API_KEY=');
        const hasApiSecret = content.includes('CLOUDINARY_API_SECRET=');

        console.log('Cloudinary Config Check:');
        console.log('CLOUD_NAME:', hasCloudName ? 'Present' : 'MISSING');
        console.log('API_KEY:', hasApiKey ? 'Present' : 'MISSING');
        console.log('API_SECRET:', hasApiSecret ? 'Present' : 'MISSING');
    } else {
        console.log('.env.local not found');
    }
} catch (e) {
    console.error(e);
}
