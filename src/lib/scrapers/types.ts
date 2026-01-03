export interface ScrapedItem {
    id: string; // Unique ID from source
    title: string;
    price: number;
    currency: string;
    url: string;
    imageUrl?: string;
    condition?: string;
    location?: string;
    date: Date;
    source: string;
    isSold?: boolean;
}

export interface PriceSource {
    name: string;
    isEnabled: boolean;
    search(query: string): Promise<ScrapedItem[]>;
}

export interface ScraperConfig {
    userAgent: string;
    proxies?: string[];
}
