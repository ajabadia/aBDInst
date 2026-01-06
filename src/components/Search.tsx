'use client';

import { Search as SearchIcon } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from './ui/Input';

export default function Search({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams?.toString());
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return (
        <div className="relative w-full group">
            <Input
                placeholder={placeholder}
                defaultValue={searchParams?.get('query')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
                icon={SearchIcon}
                className="h-14 text-lg rounded-2xl"
            />
        </div>
    );
}
