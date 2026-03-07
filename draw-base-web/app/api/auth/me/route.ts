import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenUser } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 *
 * Bearer トークンからユーザー情報を取得する。
 * iOS アプリの起動時にトークンの有効性確認 + 最新ユーザー情報取得に使用。
 */
export async function GET(req: NextRequest) {
  try {
    const tokenUser = getTokenUser(req);
    if (!tokenUser) {
      return errorResponse("認証が必要です", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        headerUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse("ユーザーが見つかりません", 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error("Auth me error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
