import { auth } from '@/auth';
import { getUserContactRequests } from '@/actions/contact';
import ContactForm from '@/components/ContactForm';

export default async function ContactPage() {
    const session = await auth();
    let hasRequests = false;

    if (session?.user) {
        const requests = await getUserContactRequests();
        hasRequests = requests.length > 0;
    }

    return (
        <ContactForm
            initialSession={session}
            hasRequests={hasRequests}
        />
    );
}
