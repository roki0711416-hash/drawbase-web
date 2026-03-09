import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const [
      favoritesCount,
      followingCount,
      purchasesCount,
      ordersCount,
      unreadNotifications,
      recentFavorites,
    ] = await Promise.all([
      prisma.favorite.count({ where: { userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.purchase.count({ where: { buyerId: userId } }),
      prisma.commissionOrder.count({ where: { clientId: userId } }),
      prisma.notification.count({ where: { receiverId: userId, isRead: false } }),
      prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          post: {
            include: {
              author: { select: { id: true, name: true, displayName: true, avatarUrl: true } },
              _count: { select: { likes: true, comments: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          favoritesCount,
          followingCount,
          purchasesCount,
          ordersCount,
          unreadNotifications,
        },
        recentFavorites: recentFavorites.map((f) => f.post),
      },
    });
  } catch (error) {
    console.error("Fan dashboard error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
