import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api";
import { loginSchema } from "@/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login/token
 *
 * iOS アプリ用トークンエンドポイント。
 * メールアドレス + パスワードで認証し、JWT トークンとユーザー情報を返す。
 * Web 側の NextAuth セッションとは独立したトークンベース認証。
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("メールアドレスとパスワードを入力してください", 422);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      return errorResponse("メールアドレスまたはパスワードが正しくありません", 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return errorResponse("メールアドレスまたはパスワードが正しくありません", 401);
    }

    // JWT トークン生成
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Token login error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
