import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set.");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      typescript: true,
    });
  }
  return _stripe;
}

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
  const session = await getStripe().checkout.sessions.create({
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
  const account = await getStripe().accounts.create({
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
  const link = await getStripe().accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/payments`,
    type: "account_onboarding",
  });
  return link;
}
