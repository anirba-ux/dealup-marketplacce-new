
export const queryKeys = {
  wishlist: (userId: string) => ["wishlist", userId] as const,
  wishlistProducts: ["wishlist-products"] as const,
};
