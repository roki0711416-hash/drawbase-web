import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";
import { createCheckoutSession } from "@/lib/stripe";

// POST /api/products/purchase — 商品を購入
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const body = await req.json();
    const { productId } = body;

    if (!productId) return errorResponse("商品IDが必要です", 400);

    // 商品を取得
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!product) return errorResponse("商品が見つかりません", 404);
    if (!product.isPublished) return errorResponse("この商品は非公開です", 400);
    if (product.sellerId === user.id)
      return errorResponse("自分の商品は購入できません", 400);

    // 既に購入済みかチェック
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        buyerId_productId: {
          buyerId: user.id,
          productId: product.id,
        },
      },
    });

    if (existingPurchase) {
      return errorResponse("この商品は既に購入済みです", 400);
    }

    // Stripe Checkout セッションを作成
    const appUrl = process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await createCheckoutSession({
      priceAmount: product.price,
      currency: product.currency.toLowerCase(),
      productName: product.title,
      customerEmail: user.email,
      successUrl: `${appUrl}/marketplace/${product.id}?purchased=true`,
      cancelUrl: `${appUrl}/marketplace/${product.id}`,
      metadata: {
        type: "product_purchase",
        productId: product.id,
        buyerId: user.id,
        sellerId: product.sellerId,
      },
    });

    // 購入レコードを作成（Stripe 決済前に作成、webhookで確定する設計も可）
    await prisma.purchase.create({
      data: {
        buyerId: user.id,
        productId: product.id,
        price: product.price,
        currency: product.currency,
        stripePaymentId: session.id,
      },
    });

    // salesCount をインクリメント
    await prisma.product.update({
      where: { id: product.id },
      data: { salesCount: { increment: 1 } },
    });

    // 出品者に通知
    await prisma.notification.create({
      data: {
        type: "PURCHASE",
        message: `${user.name}さんが「${product.title}」を購入しました`,
        receiverId: product.sellerId,
        senderId: user.id,
        linkUrl: `/marketplace/${product.id}`,
      },
    });

    return successResponse({
      checkoutUrl: session.url,
      purchaseId: session.id,
    }, 201);
  } catch (error) {
    console.error("Product purchase error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
