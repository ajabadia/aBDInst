
import dbConnect from '../src/lib/db';
import CatalogMetadata from '../src/models/CatalogMetadata';

async function test() {
    try {
        await dbConnect();
        console.log('Connected to DB');

        const testArtist = {
            type: 'artist', // This triggers the validation error if enum is wrong
            key: 'test-kraftwerk',
            label: 'Test Kraftwerk',
            images: [{ url: 'https://example.com/k.jpg', isPrimary: true }]
        };

        // Attempt upsert
        const result = await CatalogMetadata.findOneAndUpdate(
            { type: testArtist.type, key: testArtist.key },
            { $set: testArtist },
            { upsert: true, new: true, runValidators: true }
        );

        console.log('SUCCESS: Created artist:', result.toObject());

        // Cleanup
        await CatalogMetadata.deleteOne({ key: 'test-kraftwerk' });
        console.log('Cleanup done');
        process.exit(0);
    } catch (error: any) {
        console.error('FAILURE:', error.message);
        process.exit(1);
    }
}

test();
