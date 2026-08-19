import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { getWishlistProducts } from "@/lib/repositories/wishlist.repository";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json([]);
    }

    const products = await getWishlistProducts(
      (session.user as any).id
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

// import { NextResponse } from "next/server";
// import { auth } from "@/auth";
// import { getWishlistProducts } from "@/lib/repositories/wishlist.repository";

// export async function GET() {
//   const session = await auth();

//   console.log("SESSION:", session);
//   console.log("USER ID:", (session?.user as any)?.id);

//   if (!session?.user || !(session.user as any).id) {
//     return NextResponse.json([]);
//   }

//   const products = await getWishlistProducts(
//     (session.user as any).id
//   );

//   console.log("PRODUCT COUNT:", products.length);

//   return NextResponse.json(products);
// }