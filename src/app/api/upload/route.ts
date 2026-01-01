
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary
const cloudConfig = {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
};

cloudinary.config(cloudConfig);

export async function POST(request: Request) {
    console.log('📡 Upload API called');
    console.log('🔧 Cloud Config Check:', {
        cloud_name: cloudConfig.cloud_name ? 'Presente' : 'MISSING',
        api_key: cloudConfig.api_key ? 'Presente' : 'MISSING',
        api_secret: cloudConfig.api_secret ? 'Presente' : 'MISSING (!!!)'
    });

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('❌ No file in FormData');
            return NextResponse.json({ success: false, error: 'No file received' }, { status: 400 });
        }

        console.log(`📂 File received: ${file.name} (${file.size} bytes)`);

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log('🚀 Starting Cloudinary upload...');

        // Upload to Cloudinary via stream
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'instrument-collector/instruments',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('✅ Cloudinary success:', result?.secure_url);
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: (result as any).secure_url
        });

    } catch (error: any) {
        console.error('🔥 Upload API Fatal Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
