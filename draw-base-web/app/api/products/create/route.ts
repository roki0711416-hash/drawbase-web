import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";
import { createProductSchema } from "@/types";

// POST /api/products/create — 商品を出品
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
        title: parsed.data.title,
        description: parsed.data.description,
        price: parsed.data.price,
        currency: parsed.data.currency,
        thumbnailUrl: parsed.data.thumbnailUrl,
        fileUrls: parsed.data.fileUrls,
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
