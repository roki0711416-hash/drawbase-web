"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setResendMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendMessage("認証メールを再送信しました。");
      } else {
        setResendMessage(data.error || "送信に失敗しました。");
      }
    } catch {
      setResendMessage("ネットワークエラーが発生しました。");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          メールをご確認ください
        </h1>

        <p className="text-gray-600 mb-2">
          ご登録ありがとうございます！
        </p>

        {email && (
          <p className="text-gray-800 font-medium mb-4">
            <span className="text-blue-600">{email}</span>{" "}
            宛に認証メールを送信しました。
          </p>
        )}

        <p className="text-sm text-gray-500 mb-8">
          メール内のリンクをクリックして、アカウントを有効化してください。
          リンクは24時間有効です。
        </p>

        {/* 再送ボタン */}
        {email && (
          <div className="mb-6">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "送信中..." : "認証メールを再送する"}
            </button>
            {resendMessage && (
              <p className="text-sm mt-2 text-gray-600">{resendMessage}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            ログインページへ
          </Link>
          <p className="text-xs text-gray-400">
            メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">読み込み中...</p>
        </div>
      }
    >
      <RegisterSuccessContent />
    </Suspense>
  );
}
