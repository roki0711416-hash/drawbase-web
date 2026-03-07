import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import {
  createVerificationToken,
  sendVerificationEmail,
} from "@/lib/mail";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/resend-verification
 * body: { email: string }
 * 認証メールを再送信する。レートリミット: 60秒に1回。
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return errorResponse("メールアドレスを入力してください", 422);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, emailVerified: true },
    });

    if (!user) {
      // セキュリティ上、存在しないユーザーでも同じレスポンスを返す
      return successResponse({
        message: "登録済みのメールアドレスであれば、認証メールを送信しました。",
      });
    }

    if (user.emailVerified) {
      return errorResponse("このメールアドレスは既に認証済みです", 400);
    }

    // レートリミット: 最後のトークンから60秒以内なら拒否
    const lastToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (lastToken) {
      const elapsed = Date.now() - lastToken.createdAt.getTime();
      if (elapsed < 60_000) {
        const wait = Math.ceil((60_000 - elapsed) / 1000);
        return errorResponse(
          `再送信は${wait}秒後に可能です`,
          429
        );
      }
    }

    const token = await createVerificationToken(user.id, user.email);
    await sendVerificationEmail(user.email, user.name || "ユーザー", token);

    return successResponse({
      message: "登録済みのメールアドレスであれば、認証メールを送信しました。",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
