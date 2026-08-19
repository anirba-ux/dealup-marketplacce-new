import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { MongoClient } from "mongodb";

async function testDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);

    await client.connect();

    console.log("✅ Connected");

    const db = client.db("dealup");

    console.log("Database:", db.databaseName);

    const collections = await db.listCollections().toArray();

    console.log("Collections:");
    console.log(collections);

    const products = await db.collection("products").find({}).toArray();

    console.log("");
    console.log("Products:");
    console.log(products);

    console.log("");
    console.log("Total Products:", products.length);

    await client.close();
  } catch (error) {
    console.error(error);
  }
}

testDB();