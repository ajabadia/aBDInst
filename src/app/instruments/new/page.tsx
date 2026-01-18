import SubmissionWizard from '@/components/instruments/submission/SubmissionWizard';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function NewInstrumentPage() {
    const session = await auth();
    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black/20">
            <SubmissionWizard />
        </div>
    );
}
