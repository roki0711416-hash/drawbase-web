import { Resend } from "resend";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const APP_NAME = "DRAW BASE";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@drawbase.net";

/** Resend クライアントを遅延初期化する */
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY が設定されていません");
  }
  return new Resend(apiKey);
}

/**
 * メール認証トークンを生成して DB に保存する。
 * @returns 64文字のランダムトークン
 */
export async function createVerificationToken(
  userId: string,
  email: string
): Promise<string> {
  // 既存トークンを削除（再送対応）
  await prisma.emailVerificationToken.deleteMany({
    where: { userId },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間有効

  await prisma.emailVerificationToken.create({
    data: {
      token,
      email,
      userId,
      expiresAt,
    },
  });

  return token;
}

/**
 * 認証メールを送信する。
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;

  await getResend().emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: `【${APP_NAME}】メールアドレスの確認`,
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: sans-serif; color: #333;">
        <div style="text-align: center; padding: 32px 0 16px;">
          <div style="display: inline-block; background: #4c6ef5; color: white; font-weight: bold; font-size: 18px; width: 48px; height: 48px; line-height: 48px; border-radius: 12px;">
            DB
          </div>
        </div>
        <h2 style="text-align: center; margin: 0 0 8px;">メールアドレスの確認</h2>
        <p style="text-align: center; color: #666; font-size: 14px; margin: 0 0 32px;">
          ${name} さん、DRAW BASE へようこそ！
        </p>
        <p style="font-size: 14px; line-height: 1.6;">
          以下のボタンをクリックして、メールアドレスを確認してください。
          このリンクは24時間有効です。
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}"
             style="display: inline-block; background: #4c6ef5; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: bold; font-size: 14px;">
            メールアドレスを確認する
          </a>
        </div>
        <p style="font-size: 12px; color: #999; line-height: 1.6;">
          ボタンが動作しない場合は、以下のURLをブラウザに貼り付けてください：<br/>
          <a href="${verifyUrl}" style="color: #4c6ef5; word-break: break-all;">${verifyUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
        <p style="font-size: 11px; color: #bbb; text-align: center;">
          このメールに心当たりがない場合は無視してください。
        </p>
      </div>
    `,
  });
}

/**
 * トークンを検証し、ユーザーの emailVerified を更新する。
 * @returns 成功時は userId、失敗時は null
 */
export async function verifyEmailToken(
  token: string
): Promise<{ userId: string; email: string } | null> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record) return null;

  // 期限切れチェック
  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return null;
  }

  // ユーザーの emailVerified を更新
  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });

  // 使用済みトークンを削除
  await prisma.emailVerificationToken.deleteMany({
    where: { userId: record.userId },
  });

  return { userId: record.userId, email: record.email };
}
