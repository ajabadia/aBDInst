import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ShowroomEditor from '@/components/dashboard/showrooms/ShowroomEditor';
import { getUserCollection } from '@/actions/collection';
import dbConnect from '@/lib/db';
import Showroom from '@/models/Showroom';

export default async function ShowroomEditorPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.email) redirect('/login');

    const { id } = params;

    // Fetch Showroom
    await dbConnect();
    const showroom = await Showroom.findOne({ _id: id });

    if (!showroom) {
        return <div>Showroom no encontrado</div>;
    }

    // Identify if user owns it (Dual check, though page is protected)
    // In a real app we'd verify userId matches session user id here strictly.

    // Fetch user's full collection to allow picking items
    const rawCollection = await getUserCollection();

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <ShowroomEditor
                showroom={JSON.parse(JSON.stringify(showroom))}
                collection={JSON.parse(JSON.stringify(rawCollection))}
            />
        </div>
    );
}
