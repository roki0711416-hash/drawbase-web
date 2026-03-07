import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";

// POST /api/users/[id]/follow — toggle follow
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const targetId = params.id;

    if (targetId === user.id) {
      return errorResponse("自分自身をフォローできません", 400);
    }

    // Check target exists
    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, name: true },
    });
    if (!target) return errorResponse("ユーザーが見つかりません", 404);

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return successResponse({ following: false });
    }

    await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: targetId,
      },
    });

    // Notify
    await prisma.notification.create({
      data: {
        type: "FOLLOW",
        message: `${user.name}さんがあなたをフォローしました`,
        receiverId: targetId,
        senderId: user.id,
        linkUrl: `/users/${user.id}`,
      },
    });

    return successResponse({ following: true });
  } catch (error) {
    console.error("Follow error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
