import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthUser,
  getPagination,
} from "@/lib/api";
import { createCommunityPostSchema } from "@/types";

// POST — create community post
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const body = await req.json();
    const parsed = createCommunityPostSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 422);
    }

    const post = await prisma.communityPost.create({
      data: {
        content: parsed.data.content,
        imageUrls: parsed.data.imageUrls || [],
        tags: parsed.data.tags || [],
        authorId: user.id,
      },
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
    });

    return successResponse(post, 201);
  } catch (error) {
    console.error("Create community post error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}

// GET — list community posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, skip, page } = getPagination(searchParams);
    const tag = searchParams.get("tag");

    const where: Record<string, unknown> = {};
    if (tag) where.tags = { has: tag };

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
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
      prisma.communityPost.count({ where }),
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
    console.error("Community posts error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
