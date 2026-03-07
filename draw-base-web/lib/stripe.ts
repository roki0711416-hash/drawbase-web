import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

/**
 * 商品購入用の Checkout Session を作成
 */
export async function createCheckoutSession({
  priceAmount,
  currency = "jpy",
  productName,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata,
}: {
  priceAmount: number;
  currency?: string;
  productName: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: productName },
          unit_amount: priceAmount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata,
  });
  return session;
}

/**
 * Connect アカウントを作成（クリエイター向け）
 */
export async function createConnectAccount(email: string) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  return account;
}

/**
 * Connect ダッシュボードのリンクを生成
 */
export async function createAccountLink(accountId: string) {
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments`,
    type: "account_onboarding",
  });
  return link;
}
