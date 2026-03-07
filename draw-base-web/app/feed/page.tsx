"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/apiClient";

interface Post {
  id: string;
  title: string;
  imageUrls: string[];
  tags: string[];
  isNsfw: boolean;
  viewCount: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    displayName?: string;
    avatarUrl?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

const SORT_OPTIONS = [
  { value: "latest", label: "新着", icon: "🕐" },
  { value: "popular", label: "人気", icon: "🔥" },
  { value: "trending", label: "トレンド", icon: "📈" },
];

const POPULAR_TAGS = [
  "イラスト",
  "オリジナル",
  "ファンアート",
  "デジタル",
  "漫画",
  "キャラクターデザイン",
  "風景",
  "ドット絵",
  "3D",
  "水彩",
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState("latest");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(
    async (pageNum: number, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "20",
          sort,
        });
        if (selectedTag) params.set("tag", selectedTag);
        if (searchQuery) params.set("q", searchQuery);

        const res = await apiFetch(`/api/posts/feed?${params}`);
        const data = await res.json();

        if (data.success) {
          if (append) {
            setPosts((prev) => [...prev, ...data.data]);
          } else {
            setPosts(data.data);
          }
          setHasMore(data.data.length === 20);
        }
      } catch {
        console.error("Failed to fetch posts");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sort, selectedTag, searchQuery]
  );

  // Reset and fetch on filter change
  useEffect(() => {
    setPage(1);
    fetchPosts(1);
  }, [sort, selectedTag, searchQuery, fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, true);
        }
      },
      { rootMargin: "200px" }
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [page, hasMore, loading, loadingMore, fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            フィード
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            クリエイターたちの最新アートワーク
          </p>
        </div>
        <Link
          href="/create-post"
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          作品を投稿
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="作品を検索..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </form>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          {/* Sort Options */}
          <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sort === opt.value
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Tag Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedTag("")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedTag === ""
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              すべて
            </button>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setSelectedTag(selectedTag === tag ? "" : tag)
                }
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active filters info */}
      {(searchQuery || selectedTag) && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <span>フィルター:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
              &ldquo;{searchQuery}&rdquo;
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchInput("");
                }}
                className="hover:text-primary-900"
              >
                ✕
              </button>
            </span>
          )}
          {selectedTag && (
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
              #{selectedTag}
              <button
                onClick={() => setSelectedTag("")}
                className="hover:text-primary-900"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="masonry-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div
                  className="bg-gray-200"
                  style={{
                    aspectRatio: [3 / 4, 4 / 5, 1, 3 / 4, 2 / 3, 4 / 3][i % 6],
                  }}
                />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts Grid (Masonry) */}
      {!loading && posts.length > 0 && (
        <div className="masonry-grid">
          {posts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎨</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            作品がまだありません
          </h2>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedTag
              ? "検索条件を変えてみてください"
              : "最初の作品を投稿してみましょう！"}
          </p>
          <Link href="/create-post" className="btn-primary">
            作品を投稿
          </Link>
        </div>
      )}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {loadingMore && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="animate-spin w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full" />
            読み込み中...
          </div>
        )}
      </div>
    </div>
  );
}

// --- Feed Post Card ---
function FeedPostCard({ post }: { post: Post }) {
  const coverImage = post.imageUrls?.[0] || "/placeholder.png";

  return (
    <div className="masonry-item">
      <Link
        href={`/posts/${post.id}`}
        className="block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-shadow duration-200"
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={coverImage}
            alt={post.title}
            className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-sm font-medium text-white line-clamp-2">
                {post.title}
              </h3>
            </div>
          </div>

          {/* Multi-image badge */}
          {post.imageUrls.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
              </svg>
              {post.imageUrls.length}
            </div>
          )}

          {/* NSFW badge */}
          {post.isNsfw && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              R-18
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {post.title}
          </h3>

          <div className="flex items-center justify-between mt-2">
            {/* Author */}
            <div className="flex items-center gap-1.5 min-w-0">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.displayName || post.author.name}
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-primary-700 font-bold">
                    {(post.author.displayName || post.author.name)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-500 truncate">
                {post.author.displayName || post.author.name}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
              <span className="flex items-center gap-0.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {post._count.likes}
              </span>
              <span className="flex items-center gap-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {post.viewCount}
              </span>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-[10px] text-gray-400">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
