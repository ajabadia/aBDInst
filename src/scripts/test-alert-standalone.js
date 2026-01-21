
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Mock next/cache
require.cache[require.resolve('next/cache')] = {
    exports: { revalidatePath: () => { } }
};

async function testAlert() {
    console.log('--- Iniciando Test de Alerta de Mercado ---');

    // Conectar DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Cargar Servicios (usando require para evitar líos de ESM en script simple)
    // Nota: Esto asume que los archivos están compilados o usaremos ts-node/tsx con cuidado
    // Para simplificar al máximo, usaremos el marketIntelligenceService directamente si podemos

    const { marketIntelligence } = require('../lib/api/MarketIntelligenceService');
    const query = "Roland TB-03"; // Ejemplo real de tu colección

    console.log(`Buscando listados para: "${query}"...`);

    try {
        const results = await marketIntelligence.fetchAllListings(query);
        console.log(`¡Éxito! Encontrados ${results.length} listados.`);

        if (results.length > 0) {
            console.log('\nPrimeros 3 resultados:');
            results.slice(0, 3).forEach((r, i) => {
                console.log(`${i + 1}. [${r.source.toUpperCase()}] ${r.title} - ${r.price} ${r.currency}`);
            });

            const metrics = marketIntelligence.calculateMetrics(results);
            console.log('\nMétricas Generales:');
            console.log(JSON.stringify(metrics, null, 2));
        }
    } catch (e) {
        console.error('Error durante el test:', e);
    }

    await mongoose.disconnect();
    process.exit(0);
}

testAlert();
