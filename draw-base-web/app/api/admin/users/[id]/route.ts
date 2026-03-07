import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users/[id]
 * 管理者用ユーザー詳細。
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        headerUrl: true,
        website: true,
        twitterHandle: true,
        role: true,
        isAdmin: true,
        isBanned: true,
        stripeAccountId: true,
        stripeCustomerId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            products: true,
            communityPosts: true,
            commissionMenus: true,
            commissionOrdersAsClient: true,
            commissionOrdersAsCreator: true,
            followers: true,
            following: true,
            likes: true,
            purchases: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse("ユーザーが見つかりません", 404);
    }

    return successResponse(user);
  } catch (error) {
    console.error("Admin get user error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}

/**
 * PATCH /api/admin/users/[id]
 *
 * 管理者によるユーザー操作。
 * Body: { action, value }
 *   - action: "setRole"    value: "CREATOR" | "FAN" | "BOTH" | null
 *   - action: "setBan"     value: true | false
 *   - action: "setAdmin"   value: true | false
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  try {
    const body = await req.json();
    const { action, value } = body;

    if (!action) {
      return errorResponse("action を指定してください", 422);
    }

    // 自分自身の Admin 権限は外せない
    if (action === "setAdmin" && params.id === (admin as { id: string }).id && value === false) {
      return errorResponse("自分自身の管理者権限は削除できません", 400);
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "setRole":
        if (value !== null && !["CREATOR", "FAN", "BOTH"].includes(value)) {
          return errorResponse("無効な role です", 422);
        }
        updateData = { role: value, isCreator: value === "CREATOR" || value === "BOTH" };
        break;

      case "setBan":
        if (typeof value !== "boolean") {
          return errorResponse("value は true または false を指定してください", 422);
        }
        // Admin は BAN できない
        const targetUser = await prisma.user.findUnique({
          where: { id: params.id },
          select: { isAdmin: true },
        });
        if (targetUser?.isAdmin) {
          return errorResponse("管理者ユーザーは停止できません", 400);
        }
        updateData = { isBanned: value };
        break;

      case "setAdmin":
        if (typeof value !== "boolean") {
          return errorResponse("value は true または false を指定してください", 422);
        }
        updateData = { isAdmin: value };
        break;

      default:
        return errorResponse("無効な action です。setRole / setBan / setAdmin のいずれかを指定してください", 422);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true,
        isBanned: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error("Admin update user error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
