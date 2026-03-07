import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, successResponse, errorResponse } from "@/lib/api";
import { getTokenUser } from "@/lib/jwt";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/users/[id]/role
 *
 * ユーザーの role を設定する（オンボーディング用）。
 * 自分自身の role のみ変更可能。
 * Web（NextAuth セッション）と iOS（Bearer トークン）両対応。
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Web セッション or iOS トークンで認証
    const sessionUser = await getAuthUser();
    const tokenUser = getTokenUser(req);
    const currentUserId = sessionUser?.id || tokenUser?.userId;

    if (!currentUserId) {
      return errorResponse("認証が必要です", 401);
    }

    // 自分自身のみ変更可能
    if (currentUserId !== params.id) {
      return errorResponse("権限がありません", 403);
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !["CREATOR", "FAN"].includes(role)) {
      return errorResponse("role は CREATOR または FAN を指定してください", 422);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        role,
        // isCreator も同期（移行期間）
        isCreator: role === "CREATOR",
      },
      select: {
        id: true,
        role: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error("Update role error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
