"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import Link from "next/link";

interface Stats {
  users: {
    total: number;
    creators: number;
    fans: number;
    noRole: number;
    banned: number;
  };
  content: {
    posts: number;
    products: number;
    communityPosts: number;
    commissionOrders: number;
  };
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    createdAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="text-gray-400 py-12 text-center">読み込み中...</div>;
  }

  if (!stats) {
    return (
      <div className="text-red-500 py-12 text-center">
        統計情報の取得に失敗しました
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        管理者ダッシュボード
      </h1>

      {/* User stats */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        ユーザー
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <StatCard label="総ユーザー" value={stats.users.total} />
        <StatCard label="Creator" value={stats.users.creators} color="blue" />
        <StatCard label="Fan" value={stats.users.fans} color="pink" />
        <StatCard label="未選択" value={stats.users.noRole} color="gray" />
        <StatCard label="停止中" value={stats.users.banned} color="red" />
      </div>

      {/* Content stats */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        コンテンツ
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="作品投稿" value={stats.content.posts} />
        <StatCard label="商品" value={stats.content.products} />
        <StatCard label="コミュニティ" value={stats.content.communityPosts} />
        <StatCard label="コミッション" value={stats.content.commissionOrders} />
      </div>

      {/* Recent users */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          最近の登録ユーザー
        </h2>
        <Link
          href="/admin/users"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          すべて表示 →
        </Link>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-500">
                名前
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">
                メール
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">
                Role
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">
                登録日
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.recentUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/admin/users?q=${encodeURIComponent(user.email)}`}
                    className="text-primary-600 hover:underline font-medium"
                  >
                    {user.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-gray-500">{user.email}</td>
                <td className="py-3 px-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "primary",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "text-primary-600",
    blue: "text-blue-600",
    pink: "text-pink-600",
    gray: "text-gray-500",
    red: "text-red-600",
  };

  return (
    <div className="card text-center">
      <div className={`text-2xl font-bold ${colorMap[color] || colorMap.primary}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        未選択
      </span>
    );
  }
  const styles: Record<string, string> = {
    CREATOR: "bg-blue-100 text-blue-700",
    FAN: "bg-pink-100 text-pink-700",
    BOTH: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] || "bg-gray-100 text-gray-500"}`}
    >
      {role}
    </span>
  );
}
