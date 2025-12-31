import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function cleanData(data: any): any {
    if (!data) return data;
    return JSON.parse(JSON.stringify(data));
}
