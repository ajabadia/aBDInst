'use server';

import dbConnect from '@/lib/db';
import Exhibition from '@/models/Exhibition';
import ExhibitionSubmission from '@/models/ExhibitionSubmission';
import Instrument from '@/models/Instrument'; // Ensure model loaded
import User from '@/models/User'; // Ensure model loaded

export async function getExhibitionBySlug(slug: string) {
    await dbConnect();

    const exhibition = await Exhibition.findOne({ slug }).lean();
    if (!exhibition) return null;

    // Fetch submissions (Approved only for public view)
    const submissions = await ExhibitionSubmission.find({
        exhibition: exhibition._id,
        status: { $in: ['approved', 'winner'] }
    })
        .populate('instrument')
        .populate('user', 'name image') // Show who submitted it
        .sort({ votes: -1, createdAt: -1 })
        .lean();

    return {
        exhibition: JSON.parse(JSON.stringify(exhibition)),
        submissions: JSON.parse(JSON.stringify(submissions))
    };
}
