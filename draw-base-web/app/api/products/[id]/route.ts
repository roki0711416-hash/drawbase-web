import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/products/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    if (!product) return errorResponse("商品が見つかりません", 404);

    return successResponse(product);
  } catch (error) {
    console.error("Get product error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
