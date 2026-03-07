import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getPagination } from "@/lib/api";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 *
 * 管理者用ユーザー一覧。検索・ページネーション・フィルター対応。
 *
 * Query params:
 *   - page: ページ番号 (default: 1)
 *   - limit: 件数 (default: 20, max: 50)
 *   - q: 名前 or メール検索
 *   - role: CREATOR | FAN | BOTH | null (未選択)
 *   - status: active | banned
 *   - sort: newest | oldest (default: newest)
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPagination(searchParams);
    const q = searchParams.get("q") || "";
    const roleFilter = searchParams.get("role");
    const statusFilter = searchParams.get("status");
    const sort = searchParams.get("sort") || "newest";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
      ];
    }

    if (roleFilter === "null") {
      where.role = null;
    } else if (roleFilter && ["CREATOR", "FAN", "BOTH"].includes(roleFilter)) {
      where.role = roleFilter;
    }

    if (statusFilter === "banned") {
      where.isBanned = true;
    } else if (statusFilter === "active") {
      where.isBanned = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          isAdmin: true,
          isBanned: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              products: true,
              communityPosts: true,
              followers: true,
            },
          },
        },
        orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
