
import dotenv from 'dotenv';
import path from 'path';

// Load env before imports
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Clean keys
for (const key in process.env) {
    if (process.env[key]?.startsWith('"') && process.env[key]?.endsWith('"')) {
        process.env[key] = process.env[key]!.slice(1, -1);
    }
}

async function run() {
    const { default: dbConnect } = await import('@/lib/db');
    const { default: Notification } = await import('@/models/Notification');
    const { default: User } = await import('@/models/User');

    await dbConnect();

    console.log('--- Last 5 Notifications ---');
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(5).lean();

    for (const notif of notifications) {
        let owner = 'Unknown';
        try {
            const user = await User.findById(notif.userId);
            if (user) owner = `${user.name} (${user.email}) - ${user.role}`;
        } catch (e) { }

        console.log(`Type: ${notif.type} | Read: ${notif.read} | To: ${owner}`);
        console.log(`Data:`, JSON.stringify(notif.data, null, 2));
        console.log('-------------------------');
    }

    console.log('\n--- Admin Users ---');
    const admins = await User.find({ role: 'admin' }).select('email name role');
    console.table(admins.map(a => ({ id: a._id.toString(), email: a.email, name: a.name })));
}

run().catch(console.error).finally(() => process.exit());
