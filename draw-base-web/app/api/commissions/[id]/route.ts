import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";

// GET /api/commissions/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const order = await prisma.commissionOrder.findUnique({
      where: { id: params.id },
      include: {
        menu: true,
        client: {
          select: { id: true, name: true, displayName: true, avatarUrl: true },
        },
        creator: {
          select: { id: true, name: true, displayName: true, avatarUrl: true },
        },
      },
    });

    if (!order) return errorResponse("依頼が見つかりません", 404);
    if (order.clientId !== user.id && order.creatorId !== user.id) {
      return errorResponse("権限がありません", 403);
    }

    return successResponse(order);
  } catch (error) {
    console.error("Get commission error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}

// PATCH /api/commissions/[id] — update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const body = await req.json();
    const { status, deliveryUrl } = body;

    const order = await prisma.commissionOrder.findUnique({
      where: { id: params.id },
    });

    if (!order) return errorResponse("依頼が見つかりません", 404);

    // Only creator can update status
    if (order.creatorId !== user.id && order.clientId !== user.id) {
      return errorResponse("権限がありません", 403);
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (deliveryUrl) updateData.deliveryUrl = deliveryUrl;

    const updated = await prisma.commissionOrder.update({
      where: { id: params.id },
      data: updateData,
    });

    // Notify the other party
    const receiverId =
      user.id === order.creatorId ? order.clientId : order.creatorId;
    await prisma.notification.create({
      data: {
        type: "COMMISSION_UPDATE",
        message: `コミッションのステータスが「${status}」に更新されました`,
        receiverId,
        senderId: user.id,
        linkUrl: `/commissions/${order.id}`,
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error("Update commission error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
