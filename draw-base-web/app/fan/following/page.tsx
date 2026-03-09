"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

interface FollowedCreator {
  id: string;
  followedAt: string;
  creator: {
    id: string;
    name: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    genres: string[];
    commissionOpen: boolean;
    _count: { posts: number; followers: number };
  };
}

export default function FanFollowingPage() {
  const { data: session } = useSession();
  const [following, setFollowing] = useState<FollowedCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFollowing = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/fan/following?page=${p}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setFollowing(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) fetchFollowing(page);
  }, [session, page]);

  const handleUnfollow = async (creatorId: string) => {
    try {
      await apiFetch(`/api/users/${creatorId}/follow`, { method: "DELETE" });
      setFollowing((prev) => prev.filter((f) => f.creator.id !== creatorId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">👥 フォロー中</h1>
        <span className="text-sm text-gray-500">{following.length} 人</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500" />
        </div>
      ) : following.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">
            まだ誰もフォローしていません
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            お気に入りのクリエイターをフォローして最新情報を受け取りましょう
          </p>
          <Link
            href="/feed"
            className="inline-block bg-accent-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors"
          >
            クリエイターを探す
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {following.map((item) => {
              const c = item.creator;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* アバター */}
                    <Link href={`/users/${c.id}`}>
                      <div className="w-14 h-14 rounded-full bg-accent-100 flex items-center justify-center shrink-0">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-bold text-accent-600">
                            {(c.displayName || c.name).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/users/${c.id}`} className="hover:underline">
                        <h3 className="font-bold text-gray-900 truncate">
                          {c.displayName || c.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-500">@{c.name}</p>

                      {c.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.bio}</p>
                      )}

                      {/* ジャンルタグ */}
                      {c.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {c.genres.slice(0, 3).map((g) => (
                            <span
                              key={g}
                              className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                            >
                              {g}
                            </span>
                          ))}
                          {c.genres.length > 3 && (
                            <span className="text-xs text-gray-400">+{c.genres.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* 統計 */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>🖼️ {c._count.posts} 作品</span>
                        <span>👥 {c._count.followers} フォロワー</span>
                        {c.commissionOpen && (
                          <span className="text-green-600 font-medium">✏️ コミッション受付中</span>
                        )}
                      </div>
                    </div>

                    {/* アンフォローボタン */}
                    <button
                      onClick={() => handleUnfollow(c.id)}
                      className="shrink-0 text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      フォロー解除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                ← 前へ
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                次へ →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
