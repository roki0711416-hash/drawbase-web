import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";

// POST /api/posts/[id]/like — toggle like
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const postId = params.id;

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return successResponse({ liked: false });
    }

    await prisma.like.create({
      data: { userId: user.id, postId },
    });

    // Send notification to the post author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (post && post.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          message: `${user.name}さんがあなたの作品にいいねしました`,
          receiverId: post.authorId,
          senderId: user.id,
          linkUrl: `/posts/${postId}`,
        },
      });
    }

    return successResponse({ liked: true });
  } catch (error) {
    console.error("Like error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
