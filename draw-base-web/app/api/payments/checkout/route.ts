import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";
import { createCheckoutSession } from "@/lib/stripe";

// POST /api/payments/checkout — create Stripe checkout for product purchase
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const { productId } = await req.json();

    if (!productId) return errorResponse("商品IDが必要です", 422);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: { select: { id: true, name: true, stripeAccountId: true } },
      },
    });

    if (!product) return errorResponse("商品が見つかりません", 404);
    if (!product.isPublished) return errorResponse("この商品は非公開です", 400);
    if (product.sellerId === user.id)
      return errorResponse("自分の商品は購入できません", 400);

    const session = await createCheckoutSession({
      priceAmount: product.price,
      currency: product.currency.toLowerCase(),
      productName: product.title,
      customerEmail: user.email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace/${product.id}?purchased=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace/${product.id}`,
      metadata: {
        productId: product.id,
        buyerId: user.id,
        sellerId: product.sellerId,
      },
    });

    return successResponse({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return errorResponse("決済の作成に失敗しました", 500);
  }
}
