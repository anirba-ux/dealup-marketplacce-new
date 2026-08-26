import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

import {
  calculateProductSimilarity,
  ProductSimilarityResult,
} from "./productSimilarity";

// =====================================================
// Types
// =====================================================

export interface FirstSeenListing {
  productId: string;

  sellerId: string;

  sellerName?: string;

  title?: string;

  imageHash: string;

  imageUrl?: string;

  price?: number;

  firstSeenAt?: Date | string;
}

export interface CrossSellerMatchedProduct {
  productId: string;

  sellerId: string;

  sellerName?: string;

  title?: string;

  imageUrl?: string;

  imageHash?: string;

  brand?: string;

  model?: string;

  category?: string;

  subcategory?: string;

  price?: number;

  location?: {
    city?: string | null;

    district?: string | null;

    state?: string | null;

    coordinates?: {
      lat?: number | null;

      lng?: number | null;
    } | null;
  } | null;

  similarity?: ProductSimilarityResult;

  // ===================================================
  // Price Pattern
  // ===================================================

  pricePattern?: {
    firstSeenPrice?: number;

    currentPrice?: number;

    differencePercent?: number;

    significantPriceDrop: boolean;

    level: "none" | "high";
  };
}

export interface CrossSellerDuplicateMatch {
  imageHash: string;

  firstSeen?: FirstSeenListing;

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
// 1. Exact image matching uses imageHash.
// 2. Current seller is excluded.
// 3. Same seller's own repeated image is ignored.
// 4. Each imageHash is counted once.
// 5. Evidence contains matched product information.
// 6. Product similarity is calculated for every match.
// 7. Similarity does NOT automatically punish seller.
// 8. First Seen Listing is identified separately.
// 9. First Seen does NOT automatically mean "Original Product".
// 10. Price comparison uses First Seen price.
// 11. Current price >=50% lower = High price pattern.
// 12. Price pattern is evidence only.
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
      imageHashes.size === 0
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
    // Find Products From Other Sellers
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

              brand: 1,

              model: 1,

              category: 1,

              subcategory: 1,

              price: 1,

              location: 1,

              images: 1,

              createdAt: 1,
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
    // First Seen Map
    //
    // One First-Seen Listing per imageHash.
    // =================================================

    const firstSeenMap =
      new Map<
        string,
        FirstSeenListing
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

      // =================================================
      // Safety
      // =================================================

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

      // =================================================
      // Find Matching Images
      // =================================================

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

      // =================================================
      // Build Evidence
      // =================================================

      for (
        const [
          hash,
          imageUrl,
        ] of matchingImages
      ) {
        // =================================================
        // Find Current Seller Product
        // =================================================

        const currentProduct =
          sellerProducts.find(
            (
              sellerProduct,
            ) => {
              if (
                !Array.isArray(
                  sellerProduct?.images,
                )
              ) {
                return false;
              }

              return sellerProduct.images.some(
                (
                  image: any,
                ) =>
                  typeof image?.imageHash ===
                    "string" &&
                  image.imageHash
                    .trim()
                    .toLowerCase() ===
                    hash,
              );
            },
          );

        // =================================================
        // Calculate Product Similarity
        // =================================================

        const similarity =
          currentProduct
            ? calculateProductSimilarity(
                {
                  imageHash:
                    hash,

                  title:
                    currentProduct.title,

                  brand:
                    currentProduct.brand,

                  model:
                    currentProduct.model,

                  category:
                    currentProduct.category,

                  subcategory:
                    currentProduct.subcategory,

                  price:
                    currentProduct.price,

                  location:
                    currentProduct.location,
                },

                {
                  imageHash:
                    hash,

                  title:
                    product.title,

                  brand:
                    product.brand,

                  model:
                    product.model,

                  category:
                    product.category,

                  subcategory:
                    product.subcategory,

                  price:
                    product.price,

                  location:
                    product.location,
                },
              )
            : undefined;

        // =================================================
        // First Seen Listing
        // =================================================

        const productCreatedAt =
          product.createdAt
            ? new Date(
                product.createdAt,
              )
            : undefined;

        const existingFirstSeen =
          firstSeenMap.get(
            hash,
          );

        const currentFirstSeenTime =
          productCreatedAt?.getTime();

        const existingFirstSeenTime =
          existingFirstSeen?.firstSeenAt
            ? new Date(
                existingFirstSeen.firstSeenAt,
              ).getTime()
            : undefined;

        const shouldReplaceFirstSeen =
          !existingFirstSeen ||
          (
            currentFirstSeenTime !==
              undefined &&
            (
              existingFirstSeenTime ===
                undefined ||
              currentFirstSeenTime <
                existingFirstSeenTime
            )
          );

        if (
          shouldReplaceFirstSeen
        ) {
          firstSeenMap.set(
            hash,
            {
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

              imageHash:
                hash,

              imageUrl:
                imageUrl ||
                undefined,

              // =========================================
              // IMPORTANT:
              // Save First Seen Product Price
              // =========================================

              price:
                typeof product.price ===
                "number"
                  ? product.price
                  : undefined,

              firstSeenAt:
                productCreatedAt,
            },
          );
        }

        // =================================================
        // Get First Seen Listing
        // =================================================

        const firstSeen =
          firstSeenMap.get(
            hash,
          );

        // =================================================
        // Price Pattern
        //
        // First Seen Price
        //         ↓
        // Current Seller Price
        //
        // If current price is 50% or more lower:
        //
        // level = "high"
        //
        // IMPORTANT:
        // This is evidence only.
        // It does NOT directly reduce Trust Score.
        // =================================================

        const firstSeenPrice =
          typeof firstSeen?.price ===
          "number"
            ? firstSeen.price
            : undefined;

        const currentPrice =
          typeof currentProduct?.price ===
          "number"
            ? currentProduct.price
            : undefined;

        let priceDifferencePercent:
          | number
          | undefined;

        let significantPriceDrop =
          false;

        if (
          firstSeenPrice !==
            undefined &&
          currentPrice !==
            undefined &&
          firstSeenPrice > 0 &&
          currentPrice >= 0 &&
          currentPrice <
            firstSeenPrice
        ) {
          priceDifferencePercent =
            Number(
              (
                (
                  (
                    firstSeenPrice -
                    currentPrice
                  ) /
                  firstSeenPrice
                ) *
                100
              ).toFixed(2),
            );

          significantPriceDrop =
            priceDifferencePercent >=
            50;
        }

        const pricePattern = {
          firstSeenPrice,

          currentPrice,

          differencePercent:
            priceDifferencePercent,

          significantPriceDrop,

          level:
            significantPriceDrop
              ? ("high" as const)
              : ("none" as const),
        };

        // =================================================
        // Existing Match List
        // =================================================

        const existing =
          matchMap.get(
            hash,
          ) ?? [];

        // =================================================
        // Add Matched Product
        // =================================================

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

          imageHash:
            hash,

          brand:
            typeof product.brand ===
            "string"
              ? product.brand
              : undefined,

          model:
            typeof product.model ===
            "string"
              ? product.model
              : undefined,

          category:
            typeof product.category ===
            "string"
              ? product.category
              : undefined,

          subcategory:
            typeof product.subcategory ===
            "string"
              ? product.subcategory
              : undefined,

          price:
            typeof product.price ===
            "number"
              ? product.price
              : undefined,

          location:
            product.location ??
            null,

          similarity,

          // =============================================
          // Price Evidence
          // =============================================

          pricePattern,
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

    const matches:
      CrossSellerDuplicateMatch[] =
      Array.from(
        matchMap.entries(),
      ).map(
        ([
          imageHash,
          matchedProducts,
        ]) => ({
          imageHash,

          firstSeen:
            firstSeenMap.get(
              imageHash,
            ),

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
                ) ===
                index,
            ),
        }),
      );

    // =================================================
    // Return
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