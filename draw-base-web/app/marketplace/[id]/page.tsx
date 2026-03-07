"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProduct(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  // Check URL for ?purchased=true
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("purchased") === "true") {
      setPurchased(true);
    }
  }, []);

  const formatPrice = (price: number, currency: string) => {
    if (currency === "JPY") return `¥${price.toLocaleString()}`;
    return `$${(price / 100).toFixed(2)}`;
  };

  const handlePurchase = async () => {
    if (!session) return;
    setPurchasing(true);
    setError("");

    try {
      const res = await apiFetch("/api/products/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: params.id }),
      });

      const data = await res.json();
      if (data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        setError(data.error || "購入処理に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-xl" />
          <div className="mt-6 h-8 bg-gray-200 rounded w-1/2" />
          <div className="mt-3 h-4 bg-gray-200 rounded w-1/3" />
          <div className="mt-6 h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🛍️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          商品が見つかりません
        </h1>
        <Link
          href="/marketplace"
          className="text-primary-600 hover:underline text-sm"
        >
          マーケットに戻る
        </Link>
      </div>
    );
  }

  const isOwner =
    session?.user && (session.user as any).id === product.sellerId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
        </svg>
        マーケット
      </Link>

      {/* Purchased banner */}
      {purchased && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          購入が完了しました！ダウンロードリンクは購入履歴から確認できます。
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Thumbnail */}
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
            {product.thumbnailUrl ? (
              <img
                src={product.thumbnailUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
                <svg
                  className="w-20 h-20 text-primary-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {product.title}
          </h1>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/marketplace?tag=${tag}`}
                  className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description ? (
            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
              {product.description}
            </div>
          ) : (
            <p className="text-sm text-gray-400">説明はありません</p>
          )}

          {/* File info */}
          {product.fileUrls?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                含まれるファイル
              </h3>
              <div className="space-y-2">
                {product.fileUrls.map((url: string, i: number) => {
                  const filename = url.split("/").pop() || `ファイル ${i + 1}`;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg text-sm"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-gray-600 truncate">
                        {filename}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 space-y-4">
            {/* Purchase card */}
            <div className="card">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {formatPrice(product.price, product.currency)}
              </div>
              <p className="text-xs text-gray-400 mb-4">
                {product.salesCount}件販売
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs mb-3">
                  {error}
                </div>
              )}

              {purchased ? (
                <div className="text-center py-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                  ✅ 購入済み
                </div>
              ) : isOwner ? (
                <div className="text-center py-3 bg-gray-50 text-gray-500 rounded-lg text-sm">
                  自分の商品です
                </div>
              ) : session ? (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="btn-accent w-full py-3"
                >
                  {purchasing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      処理中...
                    </span>
                  ) : (
                    <>🛒 購入する</>
                  )}
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="btn-accent w-full py-3 text-center block"
                >
                  ログインして購入
                </Link>
              )}

              {/* Info list */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">ファイル数</span>
                  <span className="font-medium text-gray-900">
                    {product.fileUrls?.length || 0}個
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">投稿日</span>
                  <span className="font-medium text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </div>
            </div>

            {/* Seller card */}
            {product.seller && (
              <Link
                href={`/users/${product.seller.id}`}
                className="card flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.seller.avatarUrl ? (
                    <img
                      src={product.seller.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg text-primary-700 font-bold">
                      {product.seller.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {product.seller.displayName || product.seller.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{product.seller.name}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
