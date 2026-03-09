"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

interface Work {
  id: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  tags: string[];
  isNsfw: boolean;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  _count: { likes: number; comments: number };
}

export default function CreatorWorksPage() {
  const { status } = useSession();
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?role=creator");
      return;
    }
    if (status === "authenticated") fetchWorks();
  }, [status, page, router]);

  async function fetchWorks() {
    try {
      const res = await apiFetch(`/api/creator/works?page=${page}&limit=12`);
      const json = await res.json();
      if (json.success) {
        setWorks(json.data);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">作品管理</h1>
        <Link href="/creator/works/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規投稿
        </Link>
      </div>

      {works.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🖼️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">まだ作品がありません</h2>
          <p className="text-gray-500 mb-6">最初の作品を投稿して、活動を始めましょう！</p>
          <Link href="/creator/works/new" className="btn-primary">
            最初の作品を投稿する
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map((work) => (
              <div key={work.id} className="card p-0 overflow-hidden group">
                <div className="aspect-[4/3] bg-gray-100 relative">
                  {work.imageUrls[0] ? (
                    <img
                      src={work.imageUrls[0]}
                      alt={work.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 text-5xl">
                      🎨
                    </div>
                  )}
                  {/* ステータスバッジ */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!work.isPublished && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        下書き
                      </span>
                    )}
                    {work.isNsfw && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        NSFW
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate">{work.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">❤️ {work._count.likes}</span>
                    <span className="flex items-center gap-1">💬 {work._count.comments}</span>
                    <span className="flex items-center gap-1">👁️ {work.viewCount}</span>
                  </div>
                  {work.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {work.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {new Date(work.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                    <Link
                      href={`/posts/${work.id}`}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      詳細 →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm"
              >
                ← 前へ
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm"
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
