"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

interface DashboardStats {
  worksCount: number;
  commissionsCount: number;
  pendingOrders: number;
  unreadNotifications: number;
  followersCount: number;
  totalLikes: number;
}

interface RecentWork {
  id: string;
  title: string;
  imageUrls: string[];
  viewCount: number;
  createdAt: string;
  _count: { likes: number; comments: number };
}

export default function CreatorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentWorks, setRecentWorks] = useState<RecentWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?role=creator");
      return;
    }
    if (status === "authenticated") {
      fetchDashboard();
    }
  }, [status, router]);

  async function fetchDashboard() {
    try {
      const res = await apiFetch("/api/creator/dashboard");
      const json = await res.json();
      if (json.success) {
        setStats(json.data.stats);
        setRecentWorks(json.data.recentWorks);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const userName = session?.user?.name || "クリエイター";

  return (
    <div className="space-y-8">
      {/* ようこそ */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          ようこそ、{userName}さん 🎨
        </h1>
        <p className="text-primary-100 text-sm sm:text-base">
          クリエイターダッシュボードであなたの活動を管理しましょう
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/creator/works/new"
            className="inline-flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            作品を投稿
          </Link>
          <Link
            href="/creator/commissions"
            className="inline-flex items-center gap-2 bg-primary-500/30 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-500/50 transition-colors border border-white/20"
          >
            📋 コミッション設定
          </Link>
          <Link
            href="/creator/profile/edit"
            className="inline-flex items-center gap-2 bg-primary-500/30 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-500/50 transition-colors border border-white/20"
          >
            ✏️ プロフィール編集
          </Link>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "作品数", value: stats?.worksCount ?? 0, icon: "🎨" },
          { label: "いいね", value: stats?.totalLikes ?? 0, icon: "❤️" },
          { label: "フォロワー", value: stats?.followersCount ?? 0, icon: "👥" },
          { label: "メニュー数", value: stats?.commissionsCount ?? 0, icon: "📋" },
          { label: "未対応依頼", value: stats?.pendingOrders ?? 0, icon: "📩", highlight: true },
          { label: "未読通知", value: stats?.unreadNotifications ?? 0, icon: "🔔", highlight: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`card text-center ${stat.highlight && stat.value > 0 ? "ring-2 ring-primary-300 bg-primary-50" : ""}`}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 最近の作品 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">最近の作品</h2>
          <Link
            href="/creator/works"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            すべて見る →
          </Link>
        </div>
        {recentWorks.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">🖼️</div>
            <p className="text-gray-500 mb-4">まだ作品が投稿されていません</p>
            <Link href="/creator/works/new" className="btn-primary">
              最初の作品を投稿する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recentWorks.map((work) => (
              <Link
                key={work.id}
                href={`/posts/${work.id}`}
                className="card p-0 overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100 relative">
                  {work.imageUrls[0] ? (
                    <img
                      src={work.imageUrls[0]}
                      alt={work.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 text-4xl">
                      🎨
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 truncate group-hover:text-primary-600">
                    {work.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>❤️ {work._count.likes}</span>
                    <span>💬 {work._count.comments}</span>
                    <span>👁️ {work.viewCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 通知サマリー */}
      {stats && stats.unreadNotifications > 0 && (
        <div className="card bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div className="flex-1">
              <p className="font-medium text-amber-900">
                {stats.unreadNotifications}件の未読通知があります
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                {stats.pendingOrders > 0 &&
                  `${stats.pendingOrders}件の未対応コミッション依頼を含みます`}
              </p>
            </div>
            <Link
              href="/notifications"
              className="text-sm text-amber-700 hover:text-amber-900 font-medium whitespace-nowrap"
            >
              確認する →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
