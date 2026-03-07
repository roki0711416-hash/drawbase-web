import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";
import { createCommissionMenuSchema } from "@/types";

export const dynamic = "force-dynamic";

// POST /api/commissions/menus — create a commission menu
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

// GET /api/commissions/menus — list open menus
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    const where: Record<string, unknown> = { isOpen: true };
    if (creatorId) where.creatorId = creatorId;

    const menus = await prisma.commissionMenu.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: { id: true, name: true, displayName: true, avatarUrl: true },
        },
        _count: { select: { orders: true } },
      },
    });

    return successResponse(menus);
  } catch (error) {
    console.error("Commission menus error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
