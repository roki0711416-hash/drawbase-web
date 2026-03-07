"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Suspense } from "react";

type VerifyState =
  | "loading"
  | "success"
  | "logging-in"
  | "redirecting"
  | "already_verified"
  | "expired_token"
  | "invalid_token"
  | "auto_login_failed"
  | "error";

const STATE_UI: Record<
  string,
  { icon: string; colorBg: string; colorText: string; title: string; body: string }
> = {
  loading: {
    icon: "⟳",
    colorBg: "bg-blue-100",
    colorText: "text-blue-600",
    title: "メールアドレスを認証中...",
    body: "しばらくお待ちください。",
  },
  success: {
    icon: "✓",
    colorBg: "bg-green-100",
    colorText: "text-green-600",
    title: "メール認証が完了しました！",
    body: "ログイン中です...",
  },
  "logging-in": {
    icon: "⟳",
    colorBg: "bg-green-100",
    colorText: "text-green-600",
    title: "メール認証が完了しました！",
    body: "自動ログイン中です...",
  },
  redirecting: {
    icon: "✓",
    colorBg: "bg-green-100",
    colorText: "text-green-600",
    title: "ログインしました！",
    body: "リダイレクト中...",
  },
  already_verified: {
    icon: "✓",
    colorBg: "bg-blue-100",
    colorText: "text-blue-600",
    title: "既に認証済みです",
    body: "このメールアドレスは既に認証されています。ログインしてご利用ください。",
  },
  expired_token: {
    icon: "⏰",
    colorBg: "bg-yellow-100",
    colorText: "text-yellow-600",
    title: "リンクの有効期限が切れています",
    body: "認証リンクの有効期限（24時間）が切れました。新規登録ページから再度お試しいただくか、ログインページから認証メールを再送してください。",
  },
  invalid_token: {
    icon: "✕",
    colorBg: "bg-red-100",
    colorText: "text-red-600",
    title: "無効なリンクです",
    body: "この認証リンクは無効です。既に使用済みか、URLが正しくない可能性があります。",
  },
  auto_login_failed: {
    icon: "✓",
    colorBg: "bg-green-100",
    colorText: "text-green-600",
    title: "メール認証が完了しました！",
    body: "認証は正常に完了しましたが、自動ログインに失敗しました。以下のボタンからログインしてください。",
  },
  error: {
    icon: "!",
    colorBg: "bg-red-100",
    colorText: "text-red-600",
    title: "エラーが発生しました",
    body: "認証処理中にエラーが発生しました。もう一度お試しください。",
  },
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>(
    token ? "loading" : "invalid_token"
  );

  const verify = useCallback(async () => {
    if (!token) return;

    try {
      // 1. トークンを検証
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!data.success) {
        // 既に認証済みの場合
        if (data.reason === "already_verified") {
          setState("already_verified");
          return;
        }
        // エラー理由をそのまま state に反映
        setState(
          (data.reason as VerifyState) || "error"
        );
        return;
      }

      // 2. 認証成功 → 自動ログイン
      setState("logging-in");

      if (data.autoLoginToken && data.email) {
        const signInResult = await signIn("credentials", {
          email: data.email,
          autoLoginToken: data.autoLoginToken,
          redirect: false,
        });

        if (signInResult?.ok && !signInResult.error) {
          setState("redirecting");
          // 少し待ってからリダイレクト（UI表示のため）
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1200);
          return;
        }

        // 自動ログイン失敗 → 認証自体は成功しているのでログインページへ誘導
        console.error("Auto-login failed:", signInResult?.error);
        setState("auto_login_failed");
        return;
      }

      // autoLoginToken がない場合（NEXTAUTH_SECRET 未設定等）
      setState("auto_login_failed");
    } catch (err) {
      console.error("Verify email error:", err);
      setState("error");
    }
  }, [token, router]);

  useEffect(() => {
    if (token) {
      verify();
    }
  }, [token, verify]);

  const ui = STATE_UI[state] || STATE_UI.error;
  const isTerminal = ![
    "loading",
    "logging-in",
    "redirecting",
  ].includes(state);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div
          className={`mx-auto w-16 h-16 ${ui.colorBg} rounded-full flex items-center justify-center mb-6`}
        >
          {state === "loading" || state === "logging-in" ? (
            <svg
              className={`w-8 h-8 ${ui.colorText} animate-spin`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <span className={`text-2xl font-bold ${ui.colorText}`}>
              {ui.icon}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{ui.title}</h1>
        <p className="text-gray-600 mb-8">{ui.body}</p>

        {/* ボタン（終端状態のみ表示） */}
        {isTerminal && (
          <div className="space-y-3">
            {state === "already_verified" || state === "auto_login_failed" ? (
              <Link
                href="/auth/login"
                className="block w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                ログインする
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  ログインページへ
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-blue-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              読み込み中...
            </h1>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
