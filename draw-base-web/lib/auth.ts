import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        autoLoginToken: { label: "Auto Login Token", type: "hidden" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("メールアドレスを入力してください");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("アカウントが見つかりません");
        }

        // ── 自動ログインパス（メール認証完了後）──
        if (credentials.autoLoginToken) {
          try {
            const decoded = jwt.verify(
              credentials.autoLoginToken,
              process.env.NEXTAUTH_SECRET!
            ) as { userId: string; email: string; purpose: string };

            if (
              decoded.purpose !== "email-verified-auto-login" ||
              decoded.userId !== user.id
            ) {
              throw new Error("Invalid auto-login token");
            }
            // autoLoginToken は認証直後なので emailVerified チェック不要
          } catch {
            throw new Error(
              "自動ログインに失敗しました。ログインページからお試しください。"
            );
          }
        } else {
          // ── 通常パスワードログインパス ──
          if (!credentials.password) {
            throw new Error("パスワードを入力してください");
          }

          if (!user.passwordHash) {
            throw new Error("アカウントが見つかりません");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValid) {
            throw new Error("パスワードが正しくありません");
          }

          if (!user.emailVerified) {
            throw new Error(
              "メールアドレスが認証されていません。受信トレイをご確認ください。"
            );
          }
        }

        if (user.isBanned) {
          throw new Error("このアカウントは停止されています");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? null;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      // session update で role を更新できるようにする
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string | null }).role = (token.role as string) ?? null;
        (session.user as { isAdmin: boolean }).isAdmin = (token.isAdmin as boolean) ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
