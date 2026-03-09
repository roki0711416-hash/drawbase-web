"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";

export default function CreatorWorksNewPage() {
  const { status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isNsfw, setIsNsfw] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.push("/auth/login?role=creator");
    return null;
  }

  function addImageUrl() {
    const url = imageUrlInput.trim();
    if (url && !imageUrls.includes(url)) {
      setImageUrls([...imageUrls, url]);
      setImageUrlInput("");
    }
  }

  function removeImage(index: number) {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (imageUrls.length === 0) {
      setError("画像URLを1つ以上追加してください");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await apiFetch("/api/creator/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, imageUrls, tags, isNsfw }),
      });

      const json = await res.json();
      if (json.success) {
        router.push("/creator/works");
      } else {
        setError(json.error || "投稿に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">新規作品投稿</h1>
        <button
          onClick={() => router.push("/creator/works")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 作品一覧に戻る
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* タイトル */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">基本情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="作品のタイトル"
                maxLength={100}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea-field"
                rows={4}
                placeholder="作品の説明やコメントを入力"
                maxLength={2000}
              />
            </div>
          </div>
        </div>

        {/* 画像 */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">
            画像 <span className="text-red-500">*</span>
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="input-field flex-1"
              placeholder="画像URLを入力"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
            />
            <button type="button" onClick={addImageUrl} className="btn-secondary whitespace-nowrap">
              追加
            </button>
          </div>
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square">
                  <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {imageUrls.length === 0 && (
            <p className="text-sm text-gray-400">画像URLを追加してください</p>
          )}
        </div>

        {/* タグ */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">タグ</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="input-field flex-1"
              placeholder="タグを入力"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            />
            <button type="button" onClick={addTag} className="btn-secondary whitespace-nowrap">
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-primary-400 hover:text-primary-600 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{tags.length}/10</p>
        </div>

        {/* オプション */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">オプション</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isNsfw}
              onChange={(e) => setIsNsfw(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">年齢制限コンテンツ (NSFW)</span>
              <p className="text-xs text-gray-500">この作品に年齢制限のある内容が含まれる場合はONにしてください</p>
            </div>
          </label>
        </div>

        {/* 投稿ボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/creator/works")}
            className="btn-secondary"
          >
            キャンセル
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "投稿中..." : "作品を投稿する"}
          </button>
        </div>
      </form>
    </div>
  );
}
