"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/apiClient";

interface Stats {
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  totalFollowers: number;
  totalOrders: number;
  totalRevenue: number;
  recentPosts: { id: string; title: string; likesCount: number; viewsCount: number; createdAt: string }[];
}

export default function CreatorAnalyticsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      try {
        // 統計データを取得（将来的に専用APIを作成）
        const [postsRes] = await Promise.all([
          apiFetch(`/api/users/${(session.user as any).id}`),
        ]);
        const postsData = await postsRes.json();
        if (postsData.success) {
          const user = postsData.data;
          setStats({
            totalPosts: user._count?.posts || 0,
            totalLikes: user._count?.receivedLikes || 0,
            totalViews: 0,
            totalFollowers: user._count?.followers || 0,
            totalOrders: user._count?.receivedOrders || 0,
            totalRevenue: 0,
            recentPosts: [],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const statCards = stats
    ? [
        { label: "総作品数", value: stats.totalPosts, icon: "🖼️", color: "from-blue-500 to-blue-600" },
        { label: "総いいね", value: stats.totalLikes, icon: "❤️", color: "from-pink-500 to-pink-600" },
        { label: "フォロワー", value: stats.totalFollowers, icon: "👥", color: "from-purple-500 to-purple-600" },
        { label: "受注数", value: stats.totalOrders, icon: "📦", color: "from-green-500 to-green-600" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📊 分析</h1>
        <span className="text-xs text-gray-400">データは随時更新されます</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : (
        <>
          {/* 統計カード */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl border border-gray-100 p-5 text-center"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} text-white text-lg mb-2`}>
                  {card.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">{card.label}</div>
              </div>
            ))}
          </div>

          {/* 将来の分析機能プレースホルダー */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* いいね推移 */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">📈 いいね推移</h3>
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <p className="text-sm text-gray-500">グラフ機能は Phase 2 で実装予定</p>
                </div>
              </div>
            </div>

            {/* フォロワー推移 */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">👥 フォロワー推移</h3>
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm text-gray-500">グラフ機能は Phase 2 で実装予定</p>
                </div>
              </div>
            </div>

            {/* 収益 */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">💰 収益サマリー</h3>
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="text-sm text-gray-500">収益管理は Phase 2 で実装予定</p>
                </div>
              </div>
            </div>

            {/* 人気作品 */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">🏆 人気作品ランキング</h3>
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-sm text-gray-500">ランキング機能は Phase 2 で実装予定</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
