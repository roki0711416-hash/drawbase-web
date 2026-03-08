"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { Suspense } from "react";

type RoleType = "creator" | "fan";

function RegisterForm({
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "登録に失敗しました");
        setLoading(false);
        return;
      }

      router.push(`/auth/register-success?email=${encodeURIComponent(email)}`);
    } catch {
      setError("ネットワークエラーが発生しました");
      setLoading(false);
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
          <h2 className="text-lg font-bold">{label}として登録</h2>
        </div>
        <p className="text-sm text-white/80">{description}</p>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ユーザー名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="your_name"
            required
            minLength={2}
            maxLength={30}
          />
        </div>

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
            placeholder="8文字以上"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            パスワード（確認）
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            placeholder="もう一度入力"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg font-medium transition-colors ${btnClass} disabled:opacity-50`}
        >
          {loading ? "登録中..." : `${label}アカウントを作成`}
        </button>

        <p className="text-xs text-gray-400 text-center">
          登録することで、
          <a href="#" className="text-primary-600 hover:underline">
            利用規約
          </a>
          と
          <a href="#" className="text-primary-600 hover:underline">
            プライバシーポリシー
          </a>
          に同意します。
        </p>

        <p className="text-center text-sm text-gray-500">
          既にアカウントをお持ちの方は{" "}
          <Link
            href={`/auth/login?role=${role}`}
            className={`${linkClass} font-medium hover:underline`}
          >
            ログイン
          </Link>
        </p>
      </form>
    </div>
  );
}

function RegisterContent() {
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
          <h1 className="text-2xl font-bold text-gray-900">DRAW BASE に新規登録</h1>
          <p className="text-sm text-gray-500 mt-1">
            あなたに合った会員タイプを選んで登録してください
          </p>
        </div>

        {/* 2カラム */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className={selectedRole === "fan" ? "opacity-60 hover:opacity-100 transition-opacity" : ""}>
            <RegisterForm
              role="creator"
              accent="primary"
              icon="🎨"
              label="クリエイター"
              description="作品を投稿・販売・コミッションを受注する方"
            />
          </div>
          <div className={selectedRole === "creator" ? "opacity-60 hover:opacity-100 transition-opacity" : ""}>
            <RegisterForm
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">読み込み中...</p>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
