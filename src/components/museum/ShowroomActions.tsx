'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import SubmissionModal from './SubmissionModal';

export default function ShowroomActions({ exhibitionId }: { exhibitionId: string }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Button
                size="lg"
                className="rounded-full px-8 bg-ios-blue hover:scale-105 transition-transform shadow-lg shadow-ios-blue/20"
                onClick={() => setShowModal(true)}
            >
                Participar
            </Button>

            <SubmissionModal
                exhibitionId={exhibitionId}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    );
}
