import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";

// GET /api/users/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        headerUrl: true,
        website: true,
        twitterHandle: true,
        isCreator: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            products: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) return errorResponse("ユーザーが見つかりません", 404);

    return successResponse(user);
  } catch (error) {
    console.error("Get user error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
