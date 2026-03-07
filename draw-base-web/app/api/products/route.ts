import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthUser,
  getPagination,
} from "@/lib/api";
import { createProductSchema } from "@/types";

export const dynamic = "force-dynamic";

// POST /api/products — create a product
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 422);
    }

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        tags: parsed.data.tags || [],
        sellerId: user.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return successResponse(product, 201);
  } catch (error) {
    console.error("Create product error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}

// GET /api/products — list products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, skip, page } = getPagination(searchParams);
    const tag = searchParams.get("tag");
    const sort = searchParams.get("sort") || "latest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const q = searchParams.get("q");

    const where: Record<string, unknown> = { isPublished: true };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ];
    }
    if (tag) where.tags = { has: tag };
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseInt(minPrice) } : {}),
        ...(maxPrice ? { lte: parseInt(maxPrice) } : {}),
      };
    }

    const orderBy =
      sort === "popular"
        ? { salesCount: "desc" as const }
        : sort === "price_asc"
        ? { price: "asc" as const }
        : sort === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
