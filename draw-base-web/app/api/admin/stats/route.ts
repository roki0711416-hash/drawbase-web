import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stats
 *
 * 管理者ダッシュボード用の統計情報。
 */
export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  try {
    const [
      totalUsers,
      creatorCount,
      fanCount,
      noRoleCount,
      bannedCount,
      totalPosts,
      totalProducts,
      totalCommunityPosts,
      totalCommissionOrders,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CREATOR" } }),
      prisma.user.count({ where: { role: "FAN" } }),
      prisma.user.count({ where: { role: null } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.post.count(),
      prisma.product.count(),
      prisma.communityPost.count(),
      prisma.commissionOrder.count(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return successResponse({
      users: {
        total: totalUsers,
        creators: creatorCount,
        fans: fanCount,
        noRole: noRoleCount,
        banned: bannedCount,
      },
      content: {
        posts: totalPosts,
        products: totalProducts,
        communityPosts: totalCommunityPosts,
        commissionOrders: totalCommissionOrders,
      },
      recentUsers,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
