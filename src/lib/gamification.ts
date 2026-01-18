import { Trophy, Star, Zap, Crown, Award, Music, Camera, BookOpen } from 'lucide-react';

export interface BadgeDefinition {
    id: string;
    name: string;
    label: string;
    description: string;
    icon: any; // Lucide icon
    color: string; // Tailwind color class helper
    imageUrl?: string;
}

export const BADGES: Record<string, BadgeDefinition> = {
    // Inventory Milestones
    'FIRST_INSTRUMENT': { id: 'FIRST_INSTRUMENT', name: 'Coleccionista Iniciado', label: 'Coleccionista Iniciado', description: 'Tu primer instrumento registrado.', icon: Music, color: 'text-blue-500 bg-blue-100' },
    'INVENTORY_MASTER': { id: 'INVENTORY_MASTER', name: 'Museo Privado', label: 'Museo Privado', description: 'Más de 10 instrumentos en tu colección.', icon: Crown, color: 'text-amber-500 bg-amber-100' },

    // Social / Museum
    'EXHIBITOR': { id: 'EXHIBITOR', name: 'Expositor', label: 'Expositor', description: 'Participaste en una exposición pública.', icon: Camera, color: 'text-purple-500 bg-purple-100' },
    'CONTEST_WINNER': { id: 'CONTEST_WINNER', name: 'Premiado', label: 'Premiado', description: 'Ganador de un concurso de la comunidad.', icon: Trophy, color: 'text-yellow-600 bg-yellow-100' },

    // Platform
    'PIONEER': { id: 'PIONEER', name: 'Pionero', label: 'Pionero', description: 'Miembro fundador de la plataforma.', icon: Star, color: 'text-gray-800 bg-gray-200' },
    'CURATOR': { id: 'CURATOR', name: 'Curador', label: 'Curador', description: 'Creaste tu primer contenido editorial.', icon: BookOpen, color: 'text-pink-500 bg-pink-100' }
};

export const getBadge = (id: string) => BADGES[id];
