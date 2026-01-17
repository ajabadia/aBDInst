"use client";

import { Button } from "@/components/ui/Button";
import { Copy, Bot } from "lucide-react";
import { toast } from "sonner";

export default function JsonPromptHelper() {
    const prompt = `Actúa como un experto en sintetizadores de música electrónica.
Tu tarea es generar un JSON válido para importar instrumentos en una base de datos.
Extrae o genera la información para el instrumento solicitado completando este esquema exacto:

[
  {
    "brand": "Roland",
    "model": "Juno-106",
    "type": "Synthesizer",
    "subtype": "Analog Polyphonic",
    "years": ["1984"],
    "description": "Una descripción detallada y técnica en español.",
    "specs": [
       { "category": "Oscillators", "label": "DCOs", "value": "6 (1 per voice)" },
       { "category": "Filter", "label": "VCF", "value": "Analog Low Pass 24dB/oct" }
    ],
    "genericImages": ["url_imagen_1", "url_imagen_2"]
  }
]

Reglas:
1. El formato debe ser un ARRAY de objetos JSON.
2. "specs" debe ser una lista de características clave.
3. "description" debe ser rica y en español.
4. Si no tienes datos exactos, usa tu mejor estimación experta.
5. Solo devuelve el bloque de código JSON, sin texto adicional.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        toast.success("Prompt copiado al portapapeles", {
            description: "Pégalo en ChatGPT/Claude para generar el JSON."
        });
    };

    return (
        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 mb-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                    <div className="p-2 bg-ios-blue/10 text-ios-blue rounded-lg mt-0.5">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Asistente de Importación AI</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            ¿No tienes el JSON? Copia este prompt maestro y pídeselo a tu IA favorita (ChatGPT, Claude, Gemini).
                        </p>
                    </div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleCopy} className="shrink-0 gap-2 h-8 text-xs font-medium">
                    <Copy size={12} /> Copiar Prompt
                </Button>
            </div>
        </div>
    );
}
