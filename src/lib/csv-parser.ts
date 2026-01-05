export async function parseCSV(file: File): Promise<any[]> {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

    // Map common CSV headers to our schema keys
    const headerMap: Record<string, string> = {
        'make': 'brand',
        'marca': 'brand',
        'model': 'model',
        'modelo': 'model',
        'year': 'year',
        'anio': 'year',
        'año': 'year',
        'finish': 'finish',
        'acabado': 'finish',
        'serial': 'serialNumber',
        'sn': 'serialNumber',
        'price': 'price',
        'precio': 'price',
        'cost': 'price',
        'coste': 'price',
        'description': 'description',
        'descripción': 'description',
        'condicion': 'condition',
        'condition': 'condition',
        'state': 'condition',
        'estado': 'condition'
    };

    const normalizeHeader = (h: string) => headerMap[h] || h;

    return lines.slice(1).map(line => {
        // Handle quotes in CSV (basic implementation)
        const values: string[] = [];
        let inQuotes = false;
        let currentValue = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim().replace(/^"|"$/g, ''));
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim().replace(/^"|"$/g, ''));

        const obj: any = {};
        headers.forEach((h, i) => {
            const key = normalizeHeader(h);
            if (values[i]) {
                const val = values[i];
                // basic type coercion
                if (key === 'year' || key === 'price') {
                    const num = parseFloat(val.replace(/[^0-9.]/g, '')); // Strip currency symbols
                    if (!isNaN(num)) obj[key] = num;
                } else {
                    obj[key] = val;
                }
            }
        });
        return obj;
    });
}
