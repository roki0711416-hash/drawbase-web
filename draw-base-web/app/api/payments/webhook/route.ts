import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { productId, buyerId, sellerId } = session.metadata || {};

    if (productId && buyerId && sellerId) {
      // Increment sales count
      await prisma.product.update({
        where: { id: productId },
        data: { salesCount: { increment: 1 } },
      });

      // Notify seller
      await prisma.notification.create({
        data: {
          type: "PURCHASE",
          message: "あなたの商品が購入されました",
          receiverId: sellerId,
          senderId: buyerId,
          linkUrl: `/marketplace/${productId}`,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
