import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getPagination } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/users/[id]/posts
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, skip, page } = getPagination(searchParams);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: params.id, isPublished: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, displayName: true, avatarUrl: true },
          },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.post.count({
        where: { authorId: params.id, isPublished: true },
      }),
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
    console.error("User posts error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
