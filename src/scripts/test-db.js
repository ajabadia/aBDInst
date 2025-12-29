const mongoose = require('mongoose');

const uri = "mongodb://root:example@127.0.0.1:27017/?authSource=admin";

async function run() {
    try {
        await mongoose.connect(uri);
        console.log("Connected successfully to MongoDB");
        await mongoose.disconnect();
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
}

run();
