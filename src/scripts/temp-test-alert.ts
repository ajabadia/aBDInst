
import dbConnect from '../lib/db';
import PriceAlert from '../models/PriceAlert';
import { runScraperForAlert } from '../actions/scraping';

async function testAlerts() {
    await dbConnect();
    console.log('--- Buscando Alertas Activas ---');
    const alerts = await PriceAlert.find({ isActive: true }).limit(1);

    if (alerts.length === 0) {
        console.log('No se encontraron alertas activas para probar.');
        process.exit(0);
    }

    const alert = alerts[0];
    console.log(`Probando alerta para: "${alert.query}" (ID: ${alert._id})`);

    const result = await runScraperForAlert(alert._id.toString());
    console.log('Resultado del scraping:', JSON.stringify(result, null, 2));

    process.exit(0);
}

testAlerts().catch(err => {
    console.error('Error en el test:', err);
    process.exit(1);
});
