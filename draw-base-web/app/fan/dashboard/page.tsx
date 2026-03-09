"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

interface DashboardStats {
  favoritesCount: number;
  followingCount: number;
  purchasesCount: number;
  ordersCount: number;
  unreadNotifications: number;
}

interface RecentPost {
  id: string;
  title: string;
  imageUrls: string[];
  author: { id: string; name: string; displayName: string | null; avatarUrl: string | null };
  _count: { likes: number; comments: number };
  createdAt: string;
}

export default function FanDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentFavorites, setRecentFavorites] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      try {
        const res = await apiFetch("/api/fan/dashboard");
        const data = await res.json();
        if (data.success) {
          setStats(data.data.stats);
          setRecentFavorites(data.data.recentFavorites || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ウェルカムカード */}
      <div className="bg-gradient-to-r from-accent-500 to-pink-500 rounded-2xl p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          おかえりなさい、{session?.user?.name}さん！
        </h1>
        <p className="text-white/80 text-sm">好きな作品を見つけて、クリエイターを応援しましょう</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            href="/feed"
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            📰 フィードを見る
          </Link>
          <Link
            href="/commissions"
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            ✏️ コミッションを依頼
          </Link>
          <Link
            href="/marketplace"
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            🛍️ マーケットを見る
          </Link>
        </div>
      </div>

      {/* 統計カード */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon="❤️" label="お気に入り" value={stats.favoritesCount} href="/fan/favorites" />
          <StatCard icon="👥" label="フォロー中" value={stats.followingCount} href="/fan/following" />
          <StatCard icon="🛒" label="購入数" value={stats.purchasesCount} href="/fan/purchases" />
          <StatCard icon="📋" label="依頼数" value={stats.ordersCount} />
        </div>
      )}

      {/* 通知バナー */}
      {stats && stats.unreadNotifications > 0 && (
        <Link
          href="/fan/notifications"
          className="block bg-accent-50 border border-accent-200 rounded-xl p-4 hover:bg-accent-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-medium text-accent-800">
                {stats.unreadNotifications} 件の未読通知があります
              </p>
              <p className="text-sm text-accent-600">タップして確認する</p>
            </div>
          </div>
        </Link>
      )}

      {/* 最近のお気に入り */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">❤️ 最近のお気に入り</h2>
          <Link href="/fan/favorites" className="text-sm text-accent-600 hover:underline font-medium">
            すべて見る →
          </Link>
        </div>

        {recentFavorites.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-3">まだお気に入りがありません</p>
            <Link
              href="/feed"
              className="text-accent-600 hover:underline font-medium text-sm"
            >
              フィードで作品を探す →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recentFavorites.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100 relative">
                  {post.imageUrls?.[0] ? (
                    <img
                      src={post.imageUrls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{post.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {post.author.displayName || post.author.name}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>♥ {post._count.likes}</span>
                    <span>💬 {post._count.comments}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
