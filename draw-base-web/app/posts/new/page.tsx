"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/apiClient";

export default function NewPostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isNsfw, setIsNsfw] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError("ログインが必要です");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          imageUrls,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          isNsfw,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/posts/${data.data.id}`);
      } else {
        setError(data.error || "投稿に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="section-title mb-6">作品を投稿</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Title */}
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
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea-field"
            rows={4}
            placeholder="作品の説明を入力..."
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            画像URL <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="input-field flex-1"
              placeholder="https://example.com/image.png"
            />
            <button
              type="button"
              onClick={addImage}
              className="btn-secondary"
            >
              追加
            </button>
          </div>
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imageUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タグ
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="input-field"
            placeholder="イラスト, オリジナル, ファンアート（カンマ区切り）"
          />
        </div>

        {/* NSFW */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="nsfw"
            checked={isNsfw}
            onChange={(e) => setIsNsfw(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <label htmlFor="nsfw" className="text-sm text-gray-700">
            センシティブな内容を含む
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !title || imageUrls.length === 0}
          className="btn-primary w-full"
        >
          {loading ? "投稿中..." : "投稿する"}
        </button>
      </form>
    </div>
  );
}
