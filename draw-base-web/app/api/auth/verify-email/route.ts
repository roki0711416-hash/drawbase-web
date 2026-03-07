import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/verify-email
 * body: { token: string }
 *
 * トークンを検証し、emailVerified を更新。
 * 成功時は自動ログイン用の短命 JWT (autoLoginToken) を返す。
 *
 * レスポンス:
 *   成功: { success: true, email, autoLoginToken }
 *   失敗: { success: false, reason: "missing_token" | "invalid_token" | "expired_token" | "already_verified" | "error" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, reason: "missing_token" },
        { status: 400 }
      );
    }

    // --- トークンを DB で検索 ---
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, reason: "invalid_token" },
        { status: 400 }
      );
    }

    // --- 対象ユーザーを取得 ---
    const user = await prisma.user.findUnique({
      where: { id: record.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, reason: "invalid_token" },
        { status: 400 }
      );
    }

    // --- 既に認証済み ---
    if (user.emailVerified) {
      // トークンを掃除して返す
      await prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json(
        { success: false, reason: "already_verified", email: user.email },
        { status: 400 }
      );
    }

    // --- 有効期限チェック ---
    if (record.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: { id: record.id },
      });
      return NextResponse.json(
        { success: false, reason: "expired_token" },
        { status: 400 }
      );
    }

    // --- 認証成功: emailVerified を更新 ---
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // --- 使用済みトークンを削除 ---
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // --- 自動ログイン用の短命 JWT を発行 (5分有効) ---
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      // シークレットがない場合はトークンなしで成功を返す
      return NextResponse.json({ success: true, email: user.email });
    }

    const autoLoginToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        purpose: "email-verified-auto-login",
      },
      secret,
      { expiresIn: "5m" }
    );

    return NextResponse.json({
      success: true,
      email: user.email,
      autoLoginToken,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, reason: "error" },
      { status: 500 }
    );
  }
}
