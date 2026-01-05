'use server';

import dbConnect from '@/lib/db';
import UserCollection from '@/models/UserCollection';
import User from '@/models/User';
import Instrument from '@/models/Instrument';

export async function getPublicProfile(userId: string) {
    try {
        await dbConnect();

        // Ensure models
        await Instrument.init();
        await User.init();

        // 1. Get User Info
        const user = await User.findById(userId).select('name image email').lean();
        if (!user) return null;

        // 2. Get Collection
        const collection = await UserCollection.find({
            userId: userId,
            status: { $in: ['active', 'loaned', 'repair'] }, // Hide sold/wishlist
            deletedAt: null
        })
            .populate('instrumentId')
            .sort({ createdAt: -1 })
            .lean();

        // 3. Sanitize Data
        const sanitizedData = {
            user: {
                name: (user as any).name,
                image: (user as any).image,
                id: (user as any)._id.toString()
            },
            collection: collection.map((doc: any) => ({
                _id: doc._id.toString(),
                status: doc.status,
                condition: doc.condition,
                images: doc.images || [],
                instrumentId: {
                    _id: doc.instrumentId._id.toString(),
                    brand: doc.instrumentId.brand,
                    model: doc.instrumentId.model,
                    type: doc.instrumentId.type,
                    genericImages: doc.instrumentId.genericImages || [],
                    specs: doc.instrumentId.specs
                },
                loan: doc.loan?.active ? { active: true } : undefined
            }))
        };

        return JSON.parse(JSON.stringify(sanitizedData));

    } catch (error) {
        console.error('Get Public Profile Error:', error);
        return null;
    }
}
