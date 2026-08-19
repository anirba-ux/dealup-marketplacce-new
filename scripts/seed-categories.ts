import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { MongoClient } from "mongodb";

import { categories } from "@/data/categories";

const DATABASE_NAME = "dealup";
const COLLECTION_NAME = "categories";

async function seedCategories() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "❌ MONGODB_URI not found in .env.local"
    );
  }

  const client = new MongoClient(uri);

  try {
    console.log("");
    console.log("🚀 Connecting MongoDB...");

    await client.connect();

    console.log("✅ MongoDB Connected");
    console.log("");

    const collection = client
      .db(DATABASE_NAME)
      .collection(COLLECTION_NAME);

    console.log("🚀 Seeding Categories...");
    console.log("");

    for (const category of categories) {
      /* ==========================
         Parent Category
      ========================== */

      await collection.updateOne(
        {
          slug: category.slug,
        },
        {
          $set: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon: category.icon,
            image: "",
            parentId: null,
            level: 1,
            sortOrder: 1,
            status: "active",
            updatedAt: new Date(),
          },

          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        {
          upsert: true,
        }
      );

      const parent = await collection.findOne({
        slug: category.slug,
      });

      if (!parent) {
        console.log(
          `❌ Parent not found: ${category.name}`
        );

        continue;
      }

      console.log(`✅ ${category.name}`);

      /* ==========================
         Sub Categories
      ========================== */

      if (category.children?.length) {
        for (const child of category.children) {
          await collection.updateOne(
            {
              slug: child.slug,
            },
            {
              $set: {
                name: child.name,
                slug: child.slug,
                description: child.description,
                icon: child.icon,
                image: "",
                parentId: parent._id,
                level: 2,
                sortOrder: 1,
                status: "active",
                updatedAt: new Date(),
              },

              $setOnInsert: {
                createdAt: new Date(),
              },
            },
            {
              upsert: true,
            }
          );

          console.log(`   └── ${child.name}`);
        }
      }

      console.log("");
    }

    console.log("🎉 Categories Seeded Successfully");
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();

    console.log("");
    console.log("🔌 MongoDB Connection Closed");

    process.exit(0);
  }
}

seedCategories();