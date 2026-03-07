import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getPagination } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, skip, page } = getPagination(searchParams);
    const tag = searchParams.get("tag");
    const query = searchParams.get("q");
    const sort = searchParams.get("sort") || "latest"; // latest | popular | trending

    // Build where clause
    const conditions: Record<string, unknown>[] = [{ isPublished: true }];

    if (tag) {
      conditions.push({ tags: { has: tag } });
    }

    if (query) {
      conditions.push({
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      });
    }

    const where = conditions.length === 1 ? conditions[0] : { AND: conditions };

    // Build orderBy
    let orderBy: Record<string, string>;
    switch (sort) {
      case "popular":
        orderBy = { viewCount: "desc" };
        break;
      case "trending":
        orderBy = { viewCount: "desc" }; // With recency bias via where
        // Add recency filter for trending: last 7 days
        conditions.push({
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        });
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const finalWhere =
      conditions.length === 1 ? conditions[0] : { AND: conditions };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: finalWhere,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.post.count({ where: finalWhere }),
    ]);

    return successResponse({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Feed error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
