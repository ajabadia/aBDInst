import dbConnect from '../src/lib/db';
import MusicAlbum from '../src/models/MusicAlbum';
import { getDiscogsRelease, getDiscogsMaster } from '../src/lib/music/discogs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
    console.log('🚀 Starting MusicAlbum hierarchy migration...');
    await dbConnect();

    const legacyAlbums = await MusicAlbum.find({
        isMaster: false,
        parentId: { $exists: false },
        discogsId: { $exists: true }
    });

    console.log(`Found ${legacyAlbums.length} legacy Discogs albums to process.`);

    for (const album of legacyAlbums) {
        try {
            console.log(`Processing: ${album.title} (${album.discogsId})`);

            const release = await getDiscogsRelease(album.discogsId!);
            if (release && release.master_id) {
                const masterId = release.master_id.toString();

                // Find or create master
                let masterRecord = await MusicAlbum.findOne({ masterId, isMaster: true });

                if (!masterRecord) {
                    const masterData = await getDiscogsMaster(masterId);
                    if (masterData) {
                        masterRecord = await MusicAlbum.create({
                            artist: masterData.artists?.map((a: any) => a.name).join(', ') || release.artists?.[0]?.name,
                            title: masterData.title,
                            year: masterData.year,
                            genres: masterData.genres,
                            styles: masterData.styles,
                            masterId: masterId,
                            isMaster: true,
                            coverImage: masterData.images?.[0]?.resource_url || release.thumb,
                            description: masterData.notes
                        });
                        console.log(`  ✅ Created Master: ${masterRecord.title}`);
                    }
                }

                if (masterRecord) {
                    album.parentId = masterRecord._id;
                    album.masterId = masterId;
                    await album.save();
                    console.log(`  🔗 Linked to Master: ${masterRecord.title}`);
                }
            } else {
                console.log(`  ℹ️ No Master ID found for this release.`);
            }

            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`  ❌ Error processing ${album.title}:`, error);
        }
    }

    console.log('🏁 Migration complete.');
    process.exit(0);
}

migrate();
