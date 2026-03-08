"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

type RoleType = "creator" | "fan";

function LoginForm({
  role,
  accent,
  icon,
  label,
  description,
}: {
  role: RoleType;
  accent: string;
  icon: string;
  label: string;
  description: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const bgClass = accent === "primary"
    ? "bg-primary-50 border-primary-200"
    : "bg-accent-50 border-accent-200";
  const headerBg = accent === "primary"
    ? "bg-primary-600"
    : "bg-accent-600";
  const btnClass = accent === "primary"
    ? "bg-primary-600 hover:bg-primary-700 text-white"
    : "bg-accent-600 hover:bg-accent-700 text-white";
  const linkClass = accent === "primary"
    ? "text-primary-600 hover:text-primary-800"
    : "text-accent-600 hover:text-accent-800";

  return (
    <div className={`rounded-2xl border ${bgClass} overflow-hidden`}>
      {/* ヘッダー */}
      <div className={`${headerBg} text-white px-6 py-4`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{icon}</span>
          <h2 className="text-lg font-bold">{label}</h2>
        </div>
        <p className="text-sm text-white/80">{description}</p>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
            {error.includes("認証されていません") && (
              <button
                type="button"
                onClick={async () => {
                  if (!email) return;
                  setError("");
                  try {
                    const res = await fetch("/api/auth/resend-verification", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    });
                    if (res.ok) {
                      setError("認証メールを再送信しました。受信トレイをご確認ください。");
                    } else {
                      const data = await res.json();
                      setError(data.error || "再送信に失敗しました");
                    }
                  } catch {
                    setError("ネットワークエラーが発生しました");
                  }
                }}
                className="block mt-2 underline text-blue-600 hover:text-blue-800 text-xs"
              >
                認証メールを再送信する
              </button>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg font-medium transition-colors ${btnClass} disabled:opacity-50`}
        >
          {loading ? "ログイン中..." : `${label}としてログイン`}
        </button>

        <p className="text-center text-sm text-gray-500">
          アカウントがない方は{" "}
          <Link
            href={`/auth/register?role=${role}`}
            className={`${linkClass} font-medium hover:underline`}
          >
            {label}として新規登録
          </Link>
        </p>
      </form>
    </div>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get("role") as RoleType | null;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">DB</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DRAW BASE にログイン</h1>
          <p className="text-sm text-gray-500 mt-1">
            ご利用の会員タイプを選んでログインしてください
          </p>
        </div>

        {/* 2カラム（モバイルは1カラム） */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className={selectedRole === "fan" ? "opacity-60 hover:opacity-100 transition-opacity" : ""}>
            <LoginForm
              role="creator"
              accent="primary"
              icon="🎨"
              label="クリエイター"
              description="作品を投稿・販売・コミッションを受注する方"
            />
          </div>
          <div className={selectedRole === "creator" ? "opacity-60 hover:opacity-100 transition-opacity" : ""}>
            <LoginForm
              role="fan"
              accent="accent"
              icon="⭐"
              label="ファン"
              description="作品を楽しむ・購入・コミッションを依頼する方"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">読み込み中...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
