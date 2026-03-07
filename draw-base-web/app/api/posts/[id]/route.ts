import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  getAuthUser,
  getPagination,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/posts/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) return errorResponse("投稿が見つかりません", 404);

    // Increment view count
    await prisma.post.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return successResponse(post);
  } catch (error) {
    console.error("Get post error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}

// DELETE /api/posts/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) return errorResponse("投稿が見つかりません", 404);
    if (post.authorId !== user.id)
      return errorResponse("権限がありません", 403);

    await prisma.post.delete({ where: { id: params.id } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
