import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/creator/dashboard — ダッシュボードデータ取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const [
      worksCount,
      recentWorks,
      commissionsCount,
      pendingOrders,
      unreadNotifications,
      followersCount,
      totalLikes,
    ] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          imageUrls: true,
          viewCount: true,
          createdAt: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.commissionMenu.count({ where: { creatorId: userId } }),
      prisma.commissionOrder.count({
        where: { creatorId: userId, status: "PENDING" },
      }),
      prisma.notification.count({
        where: { receiverId: userId, isRead: false },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.like.count({
        where: { post: { authorId: userId } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          worksCount,
          commissionsCount,
          pendingOrders,
          unreadNotifications,
          followersCount,
          totalLikes,
        },
        recentWorks,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
