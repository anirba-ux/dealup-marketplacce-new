import { NextRequest, NextResponse } from "next/server";

import {
  findMainCategories,
  findSubCategories,
} from "@/lib/repositories/category.repository";

export async function GET(request: NextRequest) {
  try {
    const parentId = request.nextUrl.searchParams.get("parentId");

    if (parentId) {
      const subCategories = await findSubCategories(parentId);

      const formattedSubCategories = subCategories.map((category) => ({
        ...category,
        _id: category._id?.toString(),
        parentId: category.parentId?.toString() ?? null,
      }));

      return NextResponse.json({
        success: true,
        data: formattedSubCategories,
      });
    }

    const categories = await findMainCategories();

    const formattedCategories = categories.map((category) => ({
      ...category,
      _id: category._id?.toString(),
      parentId: category.parentId?.toString() ?? null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load categories.",
      },
      {
        status: 500,
      },
    );
  }
}
