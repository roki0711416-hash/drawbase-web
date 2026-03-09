"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

interface FavoritePost {
  id: string;
  postId: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    imageUrls: string[];
    tags: string[];
    author: { id: string; name: string; displayName: string | null; avatarUrl: string | null };
    _count: { likes: number; comments: number };
    createdAt: string;
  };
}

export default function FanFavoritesPage() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<FavoritePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFavorites = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/fan/favorites?page=${p}&limit=18`);
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) fetchFavorites(page);
  }, [session, page]);

  const handleRemove = async (postId: string) => {
    try {
      await apiFetch(`/api/fan/favorites?postId=${postId}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((f) => f.postId !== postId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">❤️ お気に入り</h1>
        <span className="text-sm text-gray-500">{favorites.length} 件</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">❤️</div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">
            お気に入りはまだありません
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            フィードで気に入った作品をお気に入りに追加しましょう
          </p>
          <Link
            href="/feed"
            className="inline-block bg-accent-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors"
          >
            フィードを見る
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative"
              >
                <Link href={`/posts/${fav.post.id}`}>
                  <div className="aspect-square bg-gray-100 relative">
                    {fav.post.imageUrls?.[0] ? (
                      <img
                        src={fav.post.imageUrls[0]}
                        alt={fav.post.title}
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
                    <h3 className="text-sm font-medium text-gray-900 truncate">{fav.post.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {fav.post.author.displayName || fav.post.author.name}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>♥ {fav.post._count.likes}</span>
                      <span>💬 {fav.post._count.comments}</span>
                    </div>
                  </div>
                </Link>
                {/* 削除ボタン */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(fav.postId);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="お気に入りから削除"
                >
                  ✕
                </button>
              </div>
            ))}
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
