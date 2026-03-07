"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

export default function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch(`/api/posts/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPost(data.data);
          setLikeCount(data.data._count?.likes || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleLike = async () => {
    if (!session) return;
    const prev = liked;
    setLiked(!liked);
    setLikeCount((c) => (prev ? c - 1 : c + 1));

    try {
      await apiFetch(`/api/posts/${params.id}/like`, { method: "POST" });
    } catch {
      setLiked(prev);
      setLikeCount((c) => (prev ? c + 1 : c - 1));
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await apiFetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText.trim(),
          postId: params.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPost((prev: any) => ({
          ...prev,
          comments: [...(prev.comments || []), data.data],
        }));
        setCommentText("");
      }
    } catch {
      // noop
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="aspect-[4/3] bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          投稿が見つかりません
        </h1>
        <Link href="/feed" className="text-primary-600 hover:underline text-sm">
          フィードに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Images */}
          <div className="space-y-2 mb-6">
            {/* Current image */}
            <div className="bg-gray-100 rounded-xl overflow-hidden relative">
              <img
                src={post.imageUrls[currentImageIndex]}
                alt={post.title}
                className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              />

              {/* Image navigation */}
              {post.imageUrls.length > 1 && (
                <>
                  {currentImageIndex > 0 && (
                    <button
                      onClick={() => setCurrentImageIndex((i: number) => i - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      ‹
                    </button>
                  )}
                  {currentImageIndex < post.imageUrls.length - 1 && (
                    <button
                      onClick={() => setCurrentImageIndex((i: number) => i + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      ›
                    </button>
                  )}

                  {/* Page indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                    {currentImageIndex + 1} / {post.imageUrls.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {post.imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {post.imageUrls.map((url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === i
                        ? "border-primary-500"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={handleLike}
              disabled={!session}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                liked
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
              }`}
            >
              <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {likeCount}
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {copied ? "コピーしました！" : "シェア"}
            </button>

            <div className="ml-auto flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {post.viewCount}
              </span>
            </div>
          </div>

          {/* Comments section */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">
              コメント ({post.comments?.length || 0})
            </h3>

            {/* Comment form */}
            {session ? (
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary-700 font-bold">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="textarea-field"
                      rows={2}
                      placeholder="コメントを書く..."
                      maxLength={500}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!commentText.trim() || submittingComment}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        {submittingComment ? "送信中..." : "コメント"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <p className="text-sm text-gray-400 mb-4">
                <Link href="/auth/login" className="text-primary-600 hover:underline">
                  ログイン
                </Link>
                してコメントを投稿
              </p>
            )}

            {/* Comment list */}
            {post.comments?.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs text-gray-500 font-bold">
                        {comment.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/users/${comment.author.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600"
                        >
                          {comment.author.displayName || comment.author.name}
                        </Link>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                まだコメントはありません
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            {/* Post info */}
            <div className="card">
              <h1 className="text-xl font-bold text-gray-900">
                {post.title}
              </h1>

              {/* Author */}
              <Link
                href={`/users/${post.author.id}`}
                className="flex items-center gap-3 mt-4 group/author"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {post.author.avatarUrl ? (
                    <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-primary-700 font-bold">
                      {post.author.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover/author:text-primary-600 transition-colors">
                    {post.author.displayName || post.author.name}
                  </p>
                  <p className="text-xs text-gray-400">@{post.author.name}</p>
                </div>
              </Link>

              {/* Description */}
              {post.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {post.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/feed?tag=${tag}`}
                        className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats & date */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
                <p>
                  投稿日: {new Date(post.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>❤️ {likeCount} いいね ・ 💬 {post._count?.comments || 0} コメント ・ 👁️ {post.viewCount} 閲覧</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
