import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { registerSchema } from "@/types";
import {
  createVerificationToken,
  sendVerificationEmail,
} from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 422);
    }

    const { email, password, name } = parsed.data;

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("このメールアドレスは既に登録されています", 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (emailVerified は null のまま)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        displayName: name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // メール認証トークンを生成して送信
    try {
      const token = await createVerificationToken(user.id, email);
      await sendVerificationEmail(email, name, token);
    } catch (mailError) {
      console.error("Verification email error:", mailError);
      // メール送信に失敗してもユーザー作成は成功とする
      // ユーザーは後から再送できる
    }

    return successResponse(
      {
        ...user,
        message: "登録が完了しました。メールをご確認ください。",
        requiresVerification: true,
      },
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
