import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthUser,
  getPagination,
} from "@/lib/api";
import { createCommissionOrderSchema } from "@/types";

// POST /api/commissions/request — create a commission order
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const body = await req.json();
    const parsed = createCommissionOrderSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 422);
    }

    const menu = await prisma.commissionMenu.findUnique({
      where: { id: parsed.data.menuId },
      include: { creator: { select: { id: true, name: true } } },
    });

    if (!menu) return errorResponse("メニューが見つかりません", 404);
    if (!menu.isOpen) return errorResponse("このメニューは現在受付停止中です", 400);
    if (menu.currentSlots >= menu.maxSlots)
      return errorResponse("スロットが満員です", 400);
    if (menu.creatorId === user.id)
      return errorResponse("自分自身には依頼できません", 400);

    const order = await prisma.commissionOrder.create({
      data: {
        menuId: menu.id,
        clientId: user.id,
        creatorId: menu.creatorId,
        description: parsed.data.description,
        referenceUrls: parsed.data.referenceUrls || [],
        price: menu.price,
        currency: menu.currency,
      },
      include: {
        menu: true,
        client: {
          select: { id: true, name: true, avatarUrl: true },
        },
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Update slot count
    await prisma.commissionMenu.update({
      where: { id: menu.id },
      data: { currentSlots: { increment: 1 } },
    });

    // Notify creator
    await prisma.notification.create({
      data: {
        type: "COMMISSION_REQUEST",
        message: `${user.name}さんから新しいコミッション依頼が届きました`,
        receiverId: menu.creatorId,
        senderId: user.id,
        linkUrl: `/commissions/${order.id}`,
      },
    });

    return successResponse(order, 201);
  } catch (error) {
    console.error("Commission request error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}

// GET /api/commissions — list user's commissions
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
            select: { id: true, name: true, avatarUrl: true },
          },
          creator: {
            select: { id: true, name: true, avatarUrl: true },
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
    console.error("Commissions error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
