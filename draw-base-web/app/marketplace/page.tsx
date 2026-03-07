"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { apiFetch } from "@/lib/apiClient";

export default function MarketplacePage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("latest");
  const [searchTag, setSearchTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, limit: "20" });
      if (searchTag) params.set("tag", searchTag);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      const res = await apiFetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) setProducts(data.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [sort, searchTag]);

  // URL tag param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tag = params.get("tag");
    if (tag) setSearchTag(tag);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">マーケットプレイス</h1>
          <p className="text-sm text-gray-500 mt-1">
            クリエイターのデジタルコンテンツを購入
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session && (
            <Link href="/marketplace/new" className="btn-accent text-sm">
              🛍️ 出品する
            </Link>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field w-auto"
          >
            <option value="latest">新着順</option>
            <option value="popular">人気順</option>
            <option value="price_asc">価格が安い順</option>
            <option value="price_desc">価格が高い順</option>
          </select>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="relative">
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 pr-20"
            placeholder="商品名やキーワードで検索..."
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-primary text-xs px-3 py-1.5"
          >
            検索
          </button>
        </div>
      </form>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["イラスト素材", "ブラシ", "3Dモデル", "テクスチャ", "テンプレート", "チュートリアル"].map(
          (tag) => (
            <button
              key={tag}
              onClick={() => setSearchTag(searchTag === tag ? "" : tag)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                searchTag === tag
                  ? "bg-primary-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
              }`}
            >
              #{tag}
            </button>
          )
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl" />
              <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
              <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🛍️</div>
          <p className="text-gray-500">商品がまだありません</p>
          <p className="text-sm text-gray-400 mt-1">
            最初の商品を出品してみましょう
          </p>
        </div>
      )}
    </div>
  );
}
