import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthUser,
  getPagination,
} from "@/lib/api";

// GET /api/notifications
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const { searchParams } = new URL(req.url);
    const { limit, skip, page } = getPagination(searchParams);
    const unreadOnly = searchParams.get("unread") === "true";

    const where: Record<string, unknown> = { receiverId: user.id };
    if (unreadOnly) where.isRead = false;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return successResponse({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}

// PATCH /api/notifications — mark all as read
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    await prisma.notification.updateMany({
      where: { receiverId: user.id, isRead: false },
      data: { isRead: true },
    });

    return successResponse({ success: true });
  } catch (error) {
    console.error("Mark notifications read error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
