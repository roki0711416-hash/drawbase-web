"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";

export default function RoleSelectPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 既にロール選択済みならリダイレクト
  if (session?.user && (session.user as { role?: string }).role) {
    const role = (session.user as { role?: string }).role;
    if (role === "CREATOR" || role === "BOTH") {
      router.replace("/creator/dashboard");
    } else {
      router.replace("/fan/dashboard");
    }
    return null;
  }

  const handleSelect = async (role: "CREATOR" | "FAN") => {
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userId = (session.user as { id: string }).id;
      const res = await apiFetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "ロール設定に失敗しました");
        setLoading(false);
        return;
      }

      // NextAuth セッションを更新
      await updateSession({ role });

      // ロールに応じたダッシュボードへ遷移
      if (role === "CREATOR") {
        router.push("/creator/dashboard");
      } else {
        router.push("/fan/dashboard");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">DB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            DRAW BASE へようこそ！
          </h1>
          <p className="text-gray-500 mt-2">
            あなたの利用目的に合わせて、タイプを選んでください
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        {/* ロール選択カード */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* クリエイター */}
          <button
            onClick={() => handleSelect("CREATOR")}
            disabled={loading}
            className="group relative bg-white border-2 border-gray-200 rounded-2xl p-8 text-left hover:border-primary-400 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <div className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-primary-500 group-hover:bg-primary-500 transition-colors" />
            <div className="text-4xl mb-4">🎨</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              クリエイター
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              作品を投稿・販売したり、コミッションを受注する
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span>
                イラスト・マンガを投稿
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span>
                コミッション受付・管理
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span>
                デジタルコンテンツを販売
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-500">✓</span>
                アクセス解析・収益管理
              </li>
            </ul>
            <div className="mt-6 text-center">
              <span className="inline-block bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-primary-600 group-hover:text-white transition-colors">
                クリエイターとして始める
              </span>
            </div>
          </button>

          {/* ファン */}
          <button
            onClick={() => handleSelect("FAN")}
            disabled={loading}
            className="group relative bg-white border-2 border-gray-200 rounded-2xl p-8 text-left hover:border-accent-400 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <div className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-accent-500 group-hover:bg-accent-500 transition-colors" />
            <div className="text-4xl mb-4">⭐</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">ファン</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              作品を楽しんだり、コミッションを依頼する
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-accent-500">✓</span>
                好きな作品をお気に入り登録
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-500">✓</span>
                クリエイターをフォロー
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-500">✓</span>
                コミッションを依頼
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-500">✓</span>
                デジタルコンテンツを購入
              </li>
            </ul>
            <div className="mt-6 text-center">
              <span className="inline-block bg-accent-50 text-accent-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-accent-600 group-hover:text-white transition-colors">
                ファンとして始める
              </span>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          ※ ロールは後から変更できます
        </p>
      </div>
    </div>
  );
}
