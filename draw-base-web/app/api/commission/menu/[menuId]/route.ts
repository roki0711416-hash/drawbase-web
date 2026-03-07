import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/commission/menu/[menuId] — 単一メニュー取得
export async function GET(
  req: NextRequest,
  { params }: { params: { menuId: string } }
) {
  try {
    const menu = await prisma.commissionMenu.findUnique({
      where: { id: params.menuId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
        _count: { select: { orders: true } },
      },
    });

    if (!menu) return errorResponse("メニューが見つかりません", 404);

    return successResponse(menu);
  } catch (error) {
    console.error("Get commission menu error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
