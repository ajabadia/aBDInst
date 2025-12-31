import { MongoClient } from "mongodb"

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
    clientPromise = Promise.reject(new Error('Invalid/Missing environment variable: "MONGODB_URI"'));
} else {
    const uri = process.env.MONGODB_URI;
    const options = {};

    if (process.env.NODE_ENV === "development") {
        let globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>
        }

        if (!globalWithMongo._mongoClientPromise) {
            client = new MongoClient(uri, options)
            globalWithMongo._mongoClientPromise = client.connect()
        }
        clientPromise = globalWithMongo._mongoClientPromise!
    } else {
        client = new MongoClient(uri, options)
        clientPromise = client.connect()
    }
}

export default clientPromise
