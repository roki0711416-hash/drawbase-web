"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

interface UploadedImage {
  file: File;
  preview: string;
  uploaded: boolean;
  url?: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isNsfw, setIsNsfw] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "details">("upload");

  // --- Image handling ---
  const addFiles = useCallback((files: FileList | File[]) => {
    const newImages: UploadedImage[] = [];
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

    for (const file of Array.from(files)) {
      if (!allowed.includes(file.type)) {
        setError(`非対応の形式です: ${file.name}`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`ファイルが大きすぎます（最大10MB）: ${file.name}`);
        continue;
      }
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        uploaded: false,
      });
    }

    if (images.length + newImages.length > 10) {
      setError("画像は最大10枚までです");
      return;
    }

    setImages((prev) => [...prev, ...newImages]);
    setError("");
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index];
      URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveImage = (from: number, to: number) => {
    setImages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  // --- Drag & Drop ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

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

  // --- Upload & Publish ---
  const uploadImages = async (): Promise<string[]> => {
    const formData = new FormData();
    const unuploaded = images.filter((img) => !img.uploaded);

    if (unuploaded.length === 0) {
      return images.map((img) => img.url!);
    }

    for (const img of unuploaded) {
      formData.append("files", img.file);
    }

    const res = await apiFetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const urls: string[] = data.data.urls;

    // Update images with uploaded URLs
    let urlIndex = 0;
    const updated = images.map((img) => {
      if (!img.uploaded) {
        return { ...img, uploaded: true, url: urls[urlIndex++] };
      }
      return img;
    });
    setImages(updated);

    return updated.map((img) => img.url!);
  };

  const handlePublish = async () => {
    if (!session) {
      setError("ログインが必要です");
      return;
    }
    if (images.length === 0) {
      setError("画像を1枚以上追加してください");
      return;
    }
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }

    setPublishing(true);
    setError("");

    try {
      // 1. Upload images
      setUploading(true);
      const imageUrls = await uploadImages();
      setUploading(false);

      // 2. Create post
      const res = await apiFetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          imageUrls,
          tags,
          isNsfw,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/posts/${data.data.id}`);
      } else {
        setError(data.error || "投稿に失敗しました");
      }
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setPublishing(false);
      setUploading(false);
    }
  };

  // --- Auth guard ---
  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎨</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          作品を投稿するにはログインが必要です
        </h1>
        <p className="text-gray-500 mb-6">
          アカウントを作成して、あなたの作品を世界に共有しましょう
        </p>
        <div className="flex gap-3 justify-center">
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            作品を投稿
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            あなたのアートワークを共有しましょう
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <button
              onClick={() => setStep("upload")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                step === "upload"
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "text-gray-400"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                1
              </span>
              画像
            </button>
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
            <button
              onClick={() => images.length > 0 && setStep("details")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                step === "details"
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "text-gray-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                  step === "details"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </span>
              詳細
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          {error}
        </div>
      )}

      {/* Step 1: Image Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-primary-400 bg-primary-50 scale-[1.01]"
                : "border-gray-300 bg-white hover:border-primary-300 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
              className="hidden"
            />

            <div className="space-y-3">
              <div
                className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-colors ${
                  isDragging ? "bg-primary-100" : "bg-gray-100"
                }`}
              >
                <svg
                  className={`w-8 h-8 ${isDragging ? "text-primary-500" : "text-gray-400"}`}
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
              </div>
              <div>
                <p className="text-base font-medium text-gray-700">
                  {isDragging
                    ? "ここにドロップ"
                    : "画像をドラッグ＆ドロップ、またはクリックして選択"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  JPEG, PNG, WebP, GIF, AVIF — 最大10枚・各10MBまで
                </p>
              </div>
            </div>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  アップロード画像 ({images.length}/10)
                </h3>
                <span className="text-xs text-gray-400">
                  ドラッグで並び替え可能
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div
                    key={img.preview}
                    className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group border-2 border-transparent hover:border-primary-300 transition-colors"
                  >
                    <img
                      src={img.preview}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

                    {/* Cover badge */}
                    {i === 0 && (
                      <div className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        カバー
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {i > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(i, i - 1);
                          }}
                          className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white text-xs"
                        >
                          ←
                        </button>
                      )}
                      {i < images.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(i, i + 1);
                          }}
                          className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white text-xs"
                        >
                          →
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(i);
                        }}
                        className="w-7 h-7 bg-red-500/90 rounded-lg flex items-center justify-center text-white hover:bg-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    {/* File info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full truncate inline-block">
                        {(img.file.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                    </div>
                  </div>
                ))}

                {/* Add more button */}
                {images.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs">追加</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Next button */}
          {images.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => setStep("details")}
                className="btn-primary px-8"
              >
                次へ：詳細を入力
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Details */}
      {step === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field text-lg"
                placeholder="作品のタイトルを入力"
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {title.length}/100
              </p>
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
                placeholder="作品の説明、制作過程、使用ツールなどを記入..."
                maxLength={2000}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {description.length}/2000
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                タグ <span className="text-xs text-gray-400 font-normal">（最大10個）</span>
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 bg-white transition-colors">
                {tags.map((tag, i) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 pl-2.5 pr-1.5 py-1 rounded-full text-sm"
                  >
                    #{tag}
                    <button
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
              {/* Suggested tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["イラスト", "オリジナル", "ファンアート", "デジタル", "漫画", "キャラクターデザイン"]
                  .filter((t) => !tags.includes(t))
                  .slice(0, 5)
                  .map((tag) => (
                    <button
                      key={tag}
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

            {/* NSFW toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  センシティブコンテンツ
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  閲覧制限付きで公開されます
                </p>
              </div>
              <button
                onClick={() => setIsNsfw(!isNsfw)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isNsfw ? "bg-accent-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isNsfw ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("upload")}
                className="btn-secondary"
              >
                ← 画像に戻る
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing || !title.trim() || images.length === 0}
                className="btn-primary flex-1"
              >
                {uploading
                  ? "画像をアップロード中..."
                  : publishing
                  ? "投稿中..."
                  : "🎨 作品を公開する"}
              </button>
            </div>
          </div>

          {/* Preview sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                プレビュー
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover image */}
                {images[0] && (
                  <div className="aspect-[3/4] bg-gray-100">
                    <img
                      src={images[0].preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {title || "タイトル未入力"}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-[10px] text-primary-700 font-bold">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {session.user.name}
                    </span>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="text-[10px] text-gray-400">
                          +{tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  {images.length > 1 && (
                    <p className="text-[10px] text-gray-400 mt-2">
                      📷 {images.length}枚の画像
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
