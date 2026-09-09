import clientPromise from "@/lib/db/mongodb";

const DATABASE_NAME = "dealup";
const PRODUCTS_COLLECTION = "products";

export interface SellerAnalyticsProduct {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  price: number;
  status: string;
  views: number;
  favorites: number;
  inquiries: number;
  isFeatured: boolean;
  isBoosted: boolean;
  createdAt: string | null;
}

export interface SellerAnalytics {
  totalAds: number;
  activeAds: number;
  soldAds: number;
  totalViews: number;
  totalFavorites: number;
  totalInquiries: number;
  products: SellerAnalyticsProduct[];
}

export async function getSellerAnalytics(
  sellerId: string,
  limit = 10,
): Promise<SellerAnalytics> {
  const client = await clientPromise;
  const db = client.db(DATABASE_NAME);
  const products = db.collection(PRODUCTS_COLLECTION);

  const [summary] = await products
    .aggregate([
      { $match: { sellerId } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalAds: { $sum: 1 },
                activeAds: {
                  $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
                },
                soldAds: {
                  $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] },
                },
                totalViews: { $sum: { $ifNull: ["$views", 0] } },
                totalFavorites: { $sum: { $ifNull: ["$favorites", 0] } },
              },
            },
          ],
          products: [
            { $addFields: { productIdString: { $toString: "$_id" } } },
            {
              $lookup: {
                from: "conversations",
                localField: "productIdString",
                foreignField: "productId",
                as: "sellerConversations",
              },
            },
            {
              $project: {
                _id: 1,
                slug: 1,
                title: 1,
                thumbnail: 1,
                price: 1,
                status: 1,
                views: { $ifNull: ["$views", 0] },
                favorites: { $ifNull: ["$favorites", 0] },
                inquiries: { $size: "$sellerConversations" },
                isFeatured: { $eq: ["$isFeatured", true] },
                isBoosted: { $eq: ["$isBoosted", true] },
                createdAt: 1,
              },
            },
            { $sort: { views: -1, createdAt: -1 } },
            { $limit: Math.max(1, Math.min(limit, 50)) },
          ],
        },
      },
    ])
    .toArray();

  const totals = summary?.totals?.[0] ?? {
    totalAds: 0,
    activeAds: 0,
    soldAds: 0,
    totalViews: 0,
    totalFavorites: 0,
  };

  const productRows = summary?.products ?? [];
  const productsWithInquiries = productRows.map((product: any) => ({
    id: product._id.toString(),
    slug: String(product.slug ?? ""),
    title: String(product.title ?? "Untitled product"),
    thumbnail: String(product.thumbnail ?? ""),
    price: Number(product.price ?? 0),
    status: String(product.status ?? "unknown"),
    views: Number(product.views ?? 0),
    favorites: Number(product.favorites ?? 0),
    inquiries: Number(product.inquiries ?? 0),
    isFeatured: product.isFeatured === true,
    isBoosted: product.isBoosted === true,
    createdAt: product.createdAt
      ? new Date(product.createdAt).toISOString()
      : null,
  }));

  return {
    totalAds: Number(totals.totalAds ?? 0),
    activeAds: Number(totals.activeAds ?? 0),
    soldAds: Number(totals.soldAds ?? 0),
    totalViews: Number(totals.totalViews ?? 0),
    totalFavorites: Number(totals.totalFavorites ?? 0),
    totalInquiries: productsWithInquiries.reduce(
      (sum: number, product: any) => sum + product.inquiries,
      0,
    ),
    products: productsWithInquiries,
  };
}
