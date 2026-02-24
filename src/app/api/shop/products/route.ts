import { NextRequest, NextResponse } from "next/server";
import { getPaginatedProductsServer } from "@/server/products";
import { enrichProductsWithDisplayPrices } from "@/server/enrich-products";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  if (!API_BASE_URL?.trim()) {
    return NextResponse.json(
      { success: false, message: "API not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "12";
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const subcategory = searchParams.get("subcategory") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "skuArrangementOrderNo";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";

  try {
    const result = await getPaginatedProductsServer({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search: search || undefined,
      category: category || undefined,
      subcategory: subcategory || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch products" },
        { status: 502 }
      );
    }

    const enrichedData = await enrichProductsWithDisplayPrices(
      result.data as Array<{
        _id: string;
        price?: number;
        updatedPrice?: number;
        finalPriceDiscount?: number;
      }>
    );

    return NextResponse.json({
      success: true,
      data: enrichedData,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("Shop products API error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
