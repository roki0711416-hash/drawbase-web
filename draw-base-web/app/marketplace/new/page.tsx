"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

export default function NewProductPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  // --- Tags ---
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // --- Thumbnail upload ---
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const res = await apiFetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setThumbnailUrl(data.data.urls[0]);
      } else {
        setError("サムネイルのアップロードに失敗しました");
      }
    } catch {
      setError("サムネイルのアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  // --- File upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      const names: string[] = [];
      for (const file of Array.from(files)) {
        formData.append("files", file);
        names.push(file.name);
      }

      const res = await apiFetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setFileUrls((prev) => [...prev, ...data.data.urls]);
        setFileNames((prev) => [...prev, ...names]);
      } else {
        setError("ファイルのアップロードに失敗しました");
      }
    } catch {
      setError("ファイルのアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFileUrls((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError("ログインが必要です");
      return;
    }
    if (fileUrls.length === 0) {
      setError("販売ファイルを1つ以上追加してください");
      return;
    }

    setPublishing(true);
    setError("");

    try {
      const res = await apiFetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          price: parseInt(price),
          thumbnailUrl: thumbnailUrl || undefined,
          fileUrls,
          tags,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/marketplace/${data.data.id}`);
      } else {
        setError(data.error || "出品に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setPublishing(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🛍️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          出品するにはログインが必要です
        </h1>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/auth/login" className="btn-secondary">
            ログイン
          </Link>
          <Link href="/auth/register" className="btn-primary">
            新規登録
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">商品を出品</h1>
        <p className="text-sm text-gray-500 mt-1">
          デジタルコンテンツを販売しましょう
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            サムネイル画像
          </label>
          <div
            onClick={() =>
              document.getElementById("thumbnail-input")?.click()
            }
            className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-300 transition-colors"
          >
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">
                  クリックしてサムネイルを選択
                </span>
              </div>
            )}
            {uploading && thumbnailPreview && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
              </div>
            )}
          </div>
          <input
            id="thumbnail-input"
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
            className="hidden"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            商品名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="例：イラスト制作用ブラシセット"
            maxLength={100}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea-field"
            rows={5}
            placeholder="商品の特徴、使い方、対応ソフトなどを記入..."
            maxLength={2000}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            価格（円） <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              ¥
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field pl-7"
              placeholder="500"
              min="100"
              required
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">最低100円から設定可能</p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            タグ{" "}
            <span className="text-xs text-gray-400 font-normal">
              （最大10個）
            </span>
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 bg-white transition-colors">
            {tags.map((tag, i) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 pl-2.5 pr-1.5 py-1 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  className="w-4 h-4 rounded-full hover:bg-primary-200 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value.replace(",", ""))}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              className="flex-1 min-w-[120px] outline-none text-sm py-1 px-1 placeholder:text-gray-400"
              placeholder={tags.length === 0 ? "タグを入力（Enterで追加）" : ""}
              disabled={tags.length >= 10}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              "イラスト素材",
              "ブラシ",
              "3Dモデル",
              "テクスチャ",
              "テンプレート",
              "チュートリアル",
            ]
              .filter((t) => !tags.includes(t))
              .slice(0, 5)
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (tags.length < 10) setTags([...tags, tag]);
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  + {tag}
                </button>
              ))}
          </div>
        </div>

        {/* Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            販売ファイル <span className="text-red-500">*</span>
          </label>

          {fileNames.length > 0 && (
            <div className="space-y-2 mb-3">
              {fileNames.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
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
                    <span className="text-sm text-gray-600 truncate">
                      {name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-red-400 hover:text-red-600 text-xs ml-2 flex-shrink-0"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary w-full"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full" />
                アップロード中...
              </span>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                ファイルを追加
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <p className="text-xs text-gray-400 mt-1">
            購入者がダウンロードするファイルをアップロード
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            publishing || !title.trim() || !price || fileUrls.length === 0
          }
          className="btn-primary w-full py-3"
        >
          {publishing ? "出品中..." : "🛍️ 商品を出品する"}
        </button>
      </form>
    </div>
  );
}
