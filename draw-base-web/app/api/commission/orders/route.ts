import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthUser,
  getPagination,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/commission/orders — 自分のコミッション注文一覧
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const { searchParams } = new URL(req.url);
    const { limit, skip, page } = getPagination(searchParams);
    const role = searchParams.get("role") || "client"; // client | creator
    const status = searchParams.get("status");

    const where: Record<string, unknown> =
      role === "creator"
        ? { creatorId: user.id }
        : { clientId: user.id };

    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.commissionOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          menu: true,
          client: {
            select: { id: true, name: true, displayName: true, avatarUrl: true },
          },
          creator: {
            select: { id: true, name: true, displayName: true, avatarUrl: true },
          },
        },
      }),
      prisma.commissionOrder.count({ where }),
    ]);

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Commission orders error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
