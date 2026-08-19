import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";
import { Category } from "@/lib/models/category";

const DATABASE_NAME = "dealup";
const COLLECTION_NAME = "categories";

async function getCollection() {
  const client = await clientPromise;

  return client
    .db(DATABASE_NAME)
    .collection<Category>(COLLECTION_NAME);
}

/* ==========================================
   Create Category
========================================== */

export async function createCategory(
  category: Category
) {
  const collection = await getCollection();

  return collection.insertOne(category);
}

/* ==========================================
   Main Categories
========================================== */

export async function findMainCategories() {
  const collection = await getCollection();

  return collection
    .find({
      parentId: null,
      status: "active",
    })
    .sort({
      sortOrder: 1,
    })
    .toArray();
}

/* ==========================================
   All Categories
========================================== */

export async function findCategories() {
  const collection = await getCollection();

  return collection
    .find({
      status: "active",
    })
    .sort({
      level: 1,
      sortOrder: 1,
    })
    .toArray();
}

/* ==========================================
   Category By Slug
========================================== */

export async function findCategoryBySlug(
  slug: string
) {
  const collection = await getCollection();

  return collection.findOne({
    slug,
  });
}

/* ==========================================
   Category By ID
========================================== */

export async function findCategoryById(
  id: string
) {
  const collection = await getCollection();

  return collection.findOne({
    _id: new ObjectId(id),
  });
}

/* ==========================================
   Sub Categories
========================================== */

export async function findSubCategories(
  parentId: string
) {
  const collection = await getCollection();

  return collection
    .find({
      parentId: new ObjectId(parentId),
      status: "active",
    })
    .sort({
      sortOrder: 1,
    })
    .toArray();
}

/* ==========================================
   Category Tree
========================================== */

export async function findCategoryTree() {
  const mains = await findMainCategories();

  const tree = await Promise.all(
    mains.map(async (category) => {
      const children =
        await findSubCategories(
          category._id!.toString()
        );

      return {
        ...category,
        children,
      };
    })
  );

  return tree;
}

/* ==========================================
   Update Category
========================================== */

export async function updateCategory(
  id: string,
  data: Partial<Category>
) {
  const collection = await getCollection();

  return collection.updateOne(
    {
      _id: new ObjectId(id),
    },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    }
  );
}

/* ==========================================
   Delete Category
========================================== */

export async function deleteCategory(
  id: string
) {
  const collection = await getCollection();

  return collection.deleteOne({
    _id: new ObjectId(id),
  });
}

