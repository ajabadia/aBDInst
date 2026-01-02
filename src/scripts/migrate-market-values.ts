// Script to migrate market values from UserCollection to Instrument
// Run with: npx tsx src/scripts/migrate-market-values.ts

import dbConnect from '@/lib/db';
import Instrument from '@/models/Instrument';
import UserCollection from '@/models/UserCollection';

async function migrateMarketValues() {
    await dbConnect();

    console.log('Starting market value migration...');

    try {
        // Find TB-03 and Abacus instruments
        const tb03 = await Instrument.findOne({ brand: 'Behringer', model: /TB.*03/i });
        const abacus = await Instrument.findOne({ model: /Abacus/i });

        if (tb03) {
            console.log(`Found TB-03: ${tb03.brand} ${tb03.model}`);

            // Find collection items for TB-03 with market value
            const tb03Items = await UserCollection.find({
                instrumentId: tb03._id,
                'marketValue.current': { $exists: true, $ne: null }
            });

            if (tb03Items.length > 0) {
                // Calculate average market value
                const values = tb03Items
                    .map(item => item.marketValue?.current)
                    .filter((v): v is number => v !== undefined && v !== null);

                if (values.length > 0) {
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    const min = Math.min(...values);
                    const max = Math.max(...values);

                    tb03.marketValue = {
                        estimatedPrice: Math.round(avg),
                        currency: 'EUR',
                        lastUpdated: new Date(),
                        priceRange: { min, max }
                    };

                    await tb03.save();
                    console.log(`✅ Updated TB-03 market value: ${avg.toFixed(2)} EUR (${min}-${max})`);
                }
            }
        }

        if (abacus) {
            console.log(`Found Abacus: ${abacus.brand} ${abacus.model}`);

            // Find collection items for Abacus with market value
            const abacusItems = await UserCollection.find({
                instrumentId: abacus._id,
                'marketValue.current': { $exists: true, $ne: null }
            });

            if (abacusItems.length > 0) {
                // Calculate average market value
                const values = abacusItems
                    .map(item => item.marketValue?.current)
                    .filter((v): v is number => v !== undefined && v !== null);

                if (values.length > 0) {
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    const min = Math.min(...values);
                    const max = Math.max(...values);

                    abacus.marketValue = {
                        estimatedPrice: Math.round(avg),
                        currency: 'EUR',
                        lastUpdated: new Date(),
                        priceRange: { min, max }
                    };

                    await abacus.save();
                    console.log(`✅ Updated Abacus market value: ${avg.toFixed(2)} EUR (${min}-${max})`);
                }
            }
        }

        console.log('✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration
migrateMarketValues()
    .then(() => {
        console.log('Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
