import { auth } from '@/auth';
import { getCollectionItemById, deleteCollectionItem } from '@/actions/collection';
import { notFound, redirect } from 'next/navigation';
import EditCollectionItemForm from '@/components/EditCollectionItemForm';
import MaintenanceHistory from '@/components/MaintenanceHistory';
import { Tabs, Tab } from '@/components/Tabs';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import PersonalGallerySection from '@/components/gallery/PersonalGallerySection';
import { getResources } from '@/actions/resource';
import ResourceSection from '@/components/resources/ResourceSection';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
    ArrowLeft,
    Settings,
    Wrench,
    Archive,
    QrCode,
    ShieldCheck,
    Clock,
    Coins,
    Calendar,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function EditItemPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const item = await getCollectionItemById(id);
    const resources = await getResources({ collectionItemId: id });

    if (!item) notFound();

    const instrument = item.instrumentId;
    const statusColors: Record<string, string> = {
        active: 'bg-ios-green/10 text-ios-green border-ios-green/20',
        sold: 'bg-gray-100 text-gray-500 border-gray-200',
        wishlist: 'bg-ios-pink/10 text-ios-pink border-ios-pink/20',
        repair: 'bg-ios-orange/10 text-ios-orange border-ios-orange/20',
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">

            {/* Header: Action Bar & Identity */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard" className="flex items-center text-sm font-semibold text-ios-blue hover:underline group mb-2">
                        <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                        Volver al Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {instrument.brand} <span className="text-gray-400 font-medium">{instrument.model}</span>
                        </h1>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            statusColors[item.status] || statusColors.active
                        )}>
                            {item.status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Button variant="secondary" size="sm" icon={QrCode}>Etiqueta</Button>
                    <Button variant="secondary" size="sm" icon={Archive}>Archivar</Button>
                    <Link href={`/instruments/${instrument._id || instrument.id}`}>
                        <Button variant="ghost" size="sm" icon={ArrowLeft}>Ver en Catálogo</Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Visuals & Personal Data */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Primary Instrument Reference */}
                    <div className="apple-card p-6 bg-white dark:bg-white/5 relative overflow-hidden group">
                        <div className="aspect-video rounded-xl overflow-hidden bg-black/5 mb-4 border border-black/5 dark:border-white/5">
                            {instrument.genericImages?.[0] ? (
                                <img src={instrument.genericImages[0]} className="w-full h-full object-contain" alt={instrument.model} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Archive size={40} /></div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-ios-blue uppercase tracking-widest">Referencia de Catálogo</p>
                            <p className="text-sm font-bold truncate">{instrument.brand} {instrument.model}</p>
                        </div>
                    </div>

                    {/* Acquisition Info Summary */}
                    <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-apple-sm">
                        <h3 className="apple-label">Resumen de Propiedad</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1.5"><Calendar size={10} /> Adquirido</p>
                                <p className="text-sm font-bold">{item.acquisition?.date || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1.5"><Coins size={10} /> Precio</p>
                                <p className="text-sm font-bold text-ios-green">{item.acquisition?.price || 0} {item.acquisition?.currency || 'EUR'}</p>
                            </div>
                        </div>
                        <div className="pt-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Número de Serie</p>
                            <p className="text-sm font-mono font-bold bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg inline-block">{item.serialNumber || 'No registrado'}</p>
                        </div>
                    </div>

                    {/* Personal Gallery */}
                    <section>
                        <h3 className="apple-label mb-4">Fotos de mi Unidad</h3>
                        <PersonalGallerySection
                            collectionId={item._id}
                            images={item.images || []}
                        />
                    </section>

                    {/* QR Management */}
                    <div className="apple-card p-6 text-center border-dashed border-2 bg-transparent">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Etiqueta de Inventario</p>
                        <div className="flex justify-center mb-4">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                <QRCodeGenerator
                                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/collection/${id}`}
                                    label={`ID: ${item.inventorySerial || id.slice(-6)}`}
                                />
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full">Descargar para Imprimir</Button>
                    </div>
                </div>

                {/* Right Column: Management Tabs */}
                <div className="lg:col-span-8">
                    <div className="apple-card bg-white dark:bg-black/40 min-h-[600px] overflow-hidden">
                        <Tabs className="px-6 pt-6 border-b border-black/5 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
                            <Tab label="Información" icon={Settings}>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-8 text-ios-blue">
                                        <ShieldCheck size={20} />
                                        <h3 className="text-lg font-bold">Detalles de la Unidad</h3>
                                    </div>
                                    <EditCollectionItemForm item={item} />
                                </div>
                            </Tab>
                            <Tab label="Mantenimiento" icon={Wrench}>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-8 text-ios-orange">
                                        <Clock size={20} />
                                        <h3 className="text-lg font-bold">Historial de Servicio</h3>
                                    </div>
                                    <MaintenanceHistory
                                        collectionId={item._id}
                                        history={item.maintenanceHistory || []}
                                        nextMaintenanceDate={item.nextMaintenanceDate}
                                        maintenanceInterval={item.maintenanceInterval}
                                        maintenanceNotes={item.maintenanceNotes}
                                        instrumentName={`${instrument.brand} ${instrument.model}`}
                                    />
                                </div>
                            </Tab>
                            <Tab label="Archivos" icon={FileText}>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-8 text-ios-indigo">
                                        <Archive size={20} />
                                        <h3 className="text-lg font-bold">Documentos y Recursos</h3>
                                    </div>
                                    <ResourceSection
                                        collectionItemId={item._id}
                                        resources={resources}
                                        canEdit={true}
                                    />
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
