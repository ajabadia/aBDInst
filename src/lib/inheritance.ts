import { Document } from 'mongoose';

interface SpecItem {
    category: string;
    label: string;
    value: string;
}

interface InstrumentData {
    _id?: any;
    id?: string;
    parentId?: any;
    description?: string;
    websites?: { url: string; isPrimary?: boolean }[];
    specs?: SpecItem[];
    genericImages?: string[];
    excludedImages?: string[];
    variantLabel?: string;
    [key: string]: any;
}

export function mergeInstruments(child: InstrumentData, parent: InstrumentData): InstrumentData {
    // 1. Description: Child wins if not empty
    const description = child.description?.trim() ? child.description : parent.description;

    // 2. Websites: Merge unique by URL
    const websiteMap = new Map();
    parent.websites?.forEach(w => websiteMap.set(w.url, w));
    child.websites?.forEach(w => websiteMap.set(w.url, w));
    const websites = Array.from(websiteMap.values());

    // 3. Specs: Child overrides parent if category + label match
    const specMap = new Map();
    parent.specs?.forEach(s => specMap.set(`${s.category}:${s.label}`, s));
    child.specs?.forEach(s => specMap.set(`${s.category}:${s.label}`, s));
    const specs = Array.from(specMap.values());

    // 4. Images: Child images + (Parent images - Excluded)
    const excluded = new Set(child.excludedImages || []);
    const parentImages = (parent.genericImages || []).filter(img => !excluded.has(img));
    const genericImages = [...(child.genericImages || []), ...parentImages];

    return {
        ...parent, // Base fields (type, brand, model, years, etc.)
        ...child,  // Override with child fields
        description,
        websites,
        specs,
        genericImages,
        _id: child._id || parent._id,
        id: (child._id || parent._id)?.toString(),
    };
}
