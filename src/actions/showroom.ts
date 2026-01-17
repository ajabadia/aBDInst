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

export async function submitToExhibition(data: { exhibitionId: string, instrumentId: string, notes: string }) {
    const session = await (await import('@/auth')).auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        await dbConnect();

        // Validation: Check if strictly valid... for now trust UI + unique index

        await ExhibitionSubmission.create({
            exhibition: data.exhibitionId,
            instrument: data.instrumentId,
            user: session.user.id,
            notes: data.notes,
            status: 'approved' // Auto-approve for now (or pending if logic required)
        });

        // Gamification: Award Badge
        const { awardBadge } = await import('@/actions/gamification');
        await awardBadge(session.user.id, 'EXHIBITOR');

        // Revalidate
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/showrooms/[slug]', 'page'); // Generic revalidation might need specific slug
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message }; // Duplicate error handled here
    }
}

export async function voteForSubmission(submissionId: string) {
    const session = await (await import('@/auth')).auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        await dbConnect();
        const ExhibitionVote = (await import('@/models/ExhibitionVote')).default;

        // Optimize: Fetch submission to get exhibition ID first
        const submission = await ExhibitionSubmission.findById(submissionId).select('exhibition');
        if (!submission) return { success: false, error: 'Submission not found' };

        // Check if exhibition allows voting (optional check, for now assuming if it's visible effectively yes)

        // Transaction-like logic
        await ExhibitionVote.create({
            exhibition: submission.exhibition,
            submission: submissionId,
            user: session.user.id
        });

        await ExhibitionSubmission.findByIdAndUpdate(submissionId, { $inc: { votes: 1 } });

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/showrooms/[slug]', 'page');
        return { success: true };

    } catch (error: any) {
        if (error.code === 11000) return { success: false, error: 'Already voted' };
        return { success: false, error: error.message };
    }
}



/* =========================================
   USER SHOWROOMS (Shareable Collections)
   Phase 3 Feature
   ========================================= */
import Showroom from '@/models/Showroom';

export async function getUserShowrooms() {
    const session = await (await import('@/auth')).auth();
    if (!session) return [];

    await dbConnect();
    const showrooms = await Showroom.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .populate({
            path: 'items.collectionId',
            populate: { path: 'instrumentId' }
        })
        .lean();

    return JSON.parse(JSON.stringify(showrooms));
}

export async function createShowroom(formData: FormData) {
    const session = await (await import('@/auth')).auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) return { success: false, error: 'Name is required' };

    await dbConnect();

    // Simple slug gen
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    try {
        await Showroom.create({
            userId: session.user.id,
            name,
            description,
            slug,
            items: [], // Start empty
            theme: 'minimal',
            isPublic: true
        });

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/dashboard/showrooms');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteShowroom(id: string) {
    const session = await (await import('@/auth')).auth();
    if (!session) return { success: false, error: 'Unauthorized' };

    await dbConnect();
    await Showroom.findOneAndDelete({ _id: id, userId: session.user.id });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/showrooms');
    return { success: true };
}
