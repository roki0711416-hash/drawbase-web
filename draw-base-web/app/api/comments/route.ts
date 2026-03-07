import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";
import { commentSchema } from "@/types";

export const dynamic = "force-dynamic";

// POST /api/comments — create a comment
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const body = await req.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 422);
    }

    const { content, postId, communityPostId, parentId } = parsed.data;

    if (!postId && !communityPostId) {
      return errorResponse("投稿IDが必要です", 422);
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: user.id,
        postId,
        communityPostId,
        parentId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Notify post author
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });
      if (post && post.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            type: "COMMENT",
            message: `${user.name}さんがあなたの作品にコメントしました`,
            receiverId: post.authorId,
            senderId: user.id,
            linkUrl: `/posts/${postId}`,
          },
        });
      }
    }

    return successResponse(comment, 201);
  } catch (error) {
    console.error("Comment error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
