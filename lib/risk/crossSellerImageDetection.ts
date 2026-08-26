import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Types
// =====================================================

export interface CrossSellerMatchedProduct {
  productId: string;

  sellerId: string;

  sellerName?: string;

  title?: string;

  imageUrl?: string;
}

export interface CrossSellerDuplicateMatch {
  imageHash: string;

  matchedProducts: CrossSellerMatchedProduct[];
}

export interface CrossSellerDuplicateResult {
  count: number;

  matches: CrossSellerDuplicateMatch[];
}

// =====================================================
// Find Cross-Seller Duplicate Images
//
// Rules:
//
// 1. Only imageHash is used for exact image matching.
// 2. Current seller is excluded.
// 3. Same seller's repeated image is NOT counted.
// 4. Each matching imageHash is counted once.
// 5. Old products without imageHash are ignored.
// 6. Evidence includes:
//    - product ID
//    - seller ID
//    - seller name
//    - product title
//    - matched image URL
// =====================================================

export async function findCrossSellerDuplicateImages(
  sellerId: string,
  sellerProducts: any[],
): Promise<CrossSellerDuplicateResult> {
  try {
    // =================================================
    // Validate Seller ID
    // =================================================

    if (!ObjectId.isValid(sellerId)) {
      return {
        count: 0,
        matches: [],
      };
    }

    // =================================================
    // Collect Current Seller Image Hashes
    // =================================================

    const imageHashes =
      new Set<string>();

    for (
      const product of sellerProducts
    ) {
      if (
        !Array.isArray(
          product?.images,
        )
      ) {
        continue;
      }

      for (
        const image of product.images
      ) {
        if (
          !image ||
          typeof image !==
            "object"
        ) {
          continue;
        }

        if (
          typeof image.imageHash !==
            "string"
        ) {
          continue;
        }

        const hash =
          image.imageHash
            .trim()
            .toLowerCase();

        if (hash) {
          imageHashes.add(hash);
        }
      }
    }

    // =================================================
    // Nothing To Check
    // =================================================

    if (
      imageHashes.size ===
      0
    ) {
      return {
        count: 0,
        matches: [],
      };
    }

    // =================================================
    // Database
    // =================================================

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

    const products =
      db.collection(
        "products",
      );

    // =================================================
    // Find Products From OTHER Sellers
    //
    // Only products containing one of the
    // current seller's image hashes are returned.
    // =================================================

    const matchedProducts =
      await products
        .find(
          {
            sellerId: {
              $ne: sellerId,
            },

            "images.imageHash": {
              $in:
                Array.from(
                  imageHashes,
                ),
            },
          },
          {
            projection: {
              _id: 1,

              sellerId: 1,

              sellerName: 1,

              title: 1,

              images: 1,
            },
          },
        )
        .toArray();

    // =================================================
    // Match Map
    // =================================================

    const matchMap =
      new Map<
        string,
        CrossSellerMatchedProduct[]
      >();

    // =================================================
    // Process Matched Products
    // =================================================

    for (
      const product of matchedProducts
    ) {
      const productSellerId =
        String(
          product.sellerId ??
            "",
        );

      // -----------------------------------------------
      // Safety Check
      // -----------------------------------------------

      if (
        !productSellerId ||
        productSellerId ===
          sellerId
      ) {
        continue;
      }

      if (
        !Array.isArray(
          product.images,
        )
      ) {
        continue;
      }

      // -----------------------------------------------
      // Find Matching Hashes Inside This Product
      // -----------------------------------------------

      const matchingImages =
        new Map<
          string,
          string
        >();

      for (
        const image of product.images
      ) {
        if (
          !image ||
          typeof image !==
            "object"
        ) {
          continue;
        }

        if (
          typeof image.imageHash !==
            "string"
        ) {
          continue;
        }

        const hash =
          image.imageHash
            .trim()
            .toLowerCase();

        if (
          !hash ||
          !imageHashes.has(
            hash,
          )
        ) {
          continue;
        }

        // ---------------------------------------------
        // Prefer URL
        // ---------------------------------------------

        const imageUrl =
          typeof image.url ===
            "string"
            ? image.url.trim()
            : "";

        if (
          !matchingImages.has(
            hash,
          )
        ) {
          matchingImages.set(
            hash,
            imageUrl,
          );
        }
      }

      // -----------------------------------------------
      // Create Evidence
      // -----------------------------------------------

      for (
        const [
          hash,
          imageUrl,
        ] of matchingImages
      ) {
        const existing =
          matchMap.get(hash) ??
          [];

        existing.push({
          productId:
            String(
              product._id,
            ),

          sellerId:
            productSellerId,

          sellerName:
            typeof product.sellerName ===
            "string"
              ? product.sellerName
              : undefined,

          title:
            typeof product.title ===
            "string"
              ? product.title
              : undefined,

          imageUrl:
            imageUrl ||
            undefined,
        });

        matchMap.set(
          hash,
          existing,
        );
      }
    }

    // =================================================
    // Convert Map To Response
    // =================================================

    const matches: CrossSellerDuplicateMatch[] =
      Array.from(
        matchMap.entries(),
      ).map(
        ([
          imageHash,
          matchedProducts,
        ]) => ({
          imageHash,

          matchedProducts:
            matchedProducts.filter(
              (
                item,
                index,
                array,
              ) =>
                array.findIndex(
                  (
                    other,
                  ) =>
                    other.productId ===
                      item.productId &&
                    other.sellerId ===
                      item.sellerId,
                ) === index,
            ),
        }),
      );

    // =================================================
    // Return
    //
    // Count = unique image hashes
    // NOT number of matched products.
    // =================================================

    return {
      count:
        matches.length,

      matches,
    };
  } catch (error) {
    console.error(
      "CROSS SELLER IMAGE DETECTION ERROR:",
      error,
    );

    return {
      count: 0,

      matches: [],
    };
  }
}