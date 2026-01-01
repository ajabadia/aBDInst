'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ImageUploader from '@/components/gallery/ImageUploader';
import ImageGallery from '@/components/gallery/ImageGallery';
import { deleteCollectionImage, setPrimaryImage } from '@/actions/gallery';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PersonalGallerySectionProps {
    collectionId: string;
    images: any[];
}

export default function PersonalGallerySection({ collectionId, images }: PersonalGallerySectionProps) {
    const router = useRouter();
    const [showUploader, setShowUploader] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleUploadComplete = () => {
        toast.success('Fotos subidas correctamente');
        router.refresh();
    };

    const handleDelete = async (imageId: string) => {
        if (!confirm('¿Eliminar esta foto?')) return;

        setDeleting(true);
        const result = await deleteCollectionImage(collectionId, imageId);

        if (result.success) {
            toast.success('Foto eliminada');
            router.refresh();
        } else {
            toast.error(result.error || 'Error al eliminar');
        }
        setDeleting(false);
    };

    const handleSetPrimary = async (imageId: string) => {
        const result = await setPrimaryImage(collectionId, imageId);

        if (result.success) {
            toast.success('Foto principal actualizada');
            router.refresh();
        } else {
            toast.error(result.error || 'Error al actualizar');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Mis Fotos</h3>
                <Button
                    variant="primary"
                    icon={Upload}
                    onClick={() => setShowUploader(true)}
                >
                    Añadir Fotos
                </Button>
            </div>

            <ImageGallery
                images={images}
                collectionId={collectionId}
                onDelete={handleDelete}
                onSetPrimary={handleSetPrimary}
            />

            {showUploader && (
                <ImageUploader
                    collectionId={collectionId}
                    onUploadComplete={handleUploadComplete}
                    onClose={() => setShowUploader(false)}
                />
            )}
        </div>
    );
}
