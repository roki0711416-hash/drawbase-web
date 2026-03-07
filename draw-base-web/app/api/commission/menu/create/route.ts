import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";
import { createCommissionMenuSchema } from "@/types";

export const dynamic = "force-dynamic";

// POST /api/commission/menu/create — コミッションメニューを作成
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const body = await req.json();
    const parsed = createCommissionMenuSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 422);
    }

    const menu = await prisma.commissionMenu.create({
      data: {
        ...parsed.data,
        creatorId: user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, displayName: true, avatarUrl: true },
        },
      },
    });

    return successResponse(menu, 201);
  } catch (error) {
    console.error("Create commission menu error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
