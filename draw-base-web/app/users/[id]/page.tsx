"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import CommissionCard from "@/components/CommissionCard";
import { apiFetch } from "@/lib/apiClient";

export default function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [commissionMenus, setCommissionMenus] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "products" | "commissions">("posts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/users/${params.id}`).then((r) => r.json()),
      apiFetch(`/api/users/${params.id}/posts?limit=20`).then((r) => r.json()),
      apiFetch(`/api/commissions/menus?creatorId=${params.id}`).then((r) => r.json()),
    ])
      .then(([userData, postsData, menusData]) => {
        if (userData.success) setUser(userData.data);
        if (postsData.success) setPosts(postsData.data.posts);
        if (menusData.success) setCommissionMenus(menusData.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="flex items-end gap-4 -mt-12 ml-6">
            <div className="w-24 h-24 bg-gray-300 rounded-full border-4 border-white" />
            <div className="mb-2 space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-xl font-bold text-gray-900">
          ユーザーが見つかりません
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-r from-primary-400 to-accent-400 rounded-xl overflow-hidden">
        {user.headerUrl && (
          <img
            src={user.headerUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <div className="w-24 h-24 rounded-full bg-primary-100 border-4 border-white flex items-center justify-center flex-shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-full h-full rounded-full"
              />
            ) : (
              <span className="text-2xl text-primary-700 font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {user.displayName || user.name}
            </h1>
            <p className="text-sm text-gray-500">@{user.name}</p>
          </div>
          <button className="btn-primary sm:self-end">フォロー</button>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">
            {user.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-6 mt-4 text-sm">
          <span>
            <strong className="text-gray-900">{user._count?.posts || 0}</strong>{" "}
            <span className="text-gray-500">作品</span>
          </span>
          <span>
            <strong className="text-gray-900">
              {user._count?.followers || 0}
            </strong>{" "}
            <span className="text-gray-500">フォロワー</span>
          </span>
          <span>
            <strong className="text-gray-900">
              {user._count?.following || 0}
            </strong>{" "}
            <span className="text-gray-500">フォロー中</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex gap-3 mt-3 text-sm">
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              🔗 {user.website}
            </a>
          )}
          {user.twitterHandle && (
            <a
              href={`https://twitter.com/${user.twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              𝕏 @{user.twitterHandle}
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {(
            [
              { key: "posts", label: "作品" },
              { key: "products", label: "商品" },
              { key: "commissions", label: "コミッション" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "posts" && (
        posts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">まだ作品がありません</p>
          </div>
        )
      )}

      {activeTab === "products" && (
        <div className="text-center py-12">
          <p className="text-gray-500">商品はまだありません</p>
        </div>
      )}

      {activeTab === "commissions" && (
        commissionMenus.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {commissionMenus.map((menu) => (
              <CommissionCard key={menu.id} menu={menu} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✏️</div>
            <p className="text-gray-500">コミッションメニューはまだありません</p>
          </div>
        )
      )}
    </div>
  );
}
