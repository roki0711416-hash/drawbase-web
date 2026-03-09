"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";

const GENRE_OPTIONS = [
  "イラスト", "漫画", "アニメ", "3DCG", "ドット絵",
  "キャラデザ", "背景", "コンセプトアート", "Vtuber",
  "アイコン", "ロゴ", "UI/UX", "その他",
];

export default function CreatorProfileEditPage() {
  const { status } = useSession();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [headerUrl, setHeaderUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [pixivUrl, setPixivUrl] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [commissionOpen, setCommissionOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?role=creator");
      return;
    }
    if (status === "authenticated") fetchProfile();
  }, [status, router]);

  async function fetchProfile() {
    try {
      const res = await apiFetch("/api/creator/profile");
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        setDisplayName(d.displayName || "");
        setBio(d.bio || "");
        setAvatarUrl(d.avatarUrl || "");
        setHeaderUrl(d.headerUrl || "");
        setWebsite(d.website || "");
        setTwitterHandle(d.twitterHandle || "");
        setInstagramHandle(d.instagramHandle || "");
        setPixivUrl(d.pixivUrl || "");
        setGenres(d.genres || []);
        setCommissionOpen(d.commissionOpen || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await apiFetch("/api/creator/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName || null,
          bio: bio || null,
          avatarUrl: avatarUrl || null,
          headerUrl: headerUrl || null,
          website: website || null,
          twitterHandle: twitterHandle || null,
          instagramHandle: instagramHandle || null,
          pixivUrl: pixivUrl || null,
          genres,
          commissionOpen,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(json.error || "更新に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  function toggleGenre(genre: string) {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
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
        <h1 className="section-title">プロフィール編集</h1>
        <button
          onClick={() => router.push("/creator/profile")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← プロフィールに戻る
        </button>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ プロフィールを更新しました
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* アイコン */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">アイコン & ヘッダー</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アイコン画像URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="input-field"
                placeholder="https://example.com/avatar.png"
              />
              {avatarUrl && (
                <div className="mt-2 w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                  <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ヘッダー画像URL
              </label>
              <input
                type="url"
                value={headerUrl}
                onChange={(e) => setHeaderUrl(e.target.value)}
                className="input-field"
                placeholder="https://example.com/header.png"
              />
              {headerUrl && (
                <div className="mt-2 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <img src={headerUrl} alt="Header preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">基本情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field"
                placeholder="あなたの表示名"
                maxLength={30}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="textarea-field"
                rows={4}
                placeholder="あなたの自己紹介を入力してください"
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">{bio.length}/500</p>
            </div>
          </div>
        </div>

        {/* ジャンル */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">ジャンル</h2>
          <p className="text-sm text-gray-500 mb-3">得意なジャンルを選択してください（複数可）</p>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  genres.includes(genre)
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* SNSリンク */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">SNS & リンク</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🌐 Webサイト</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">𝕏 Twitter / X</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  className="input-field"
                  placeholder="username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📷 Instagram</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="input-field"
                  placeholder="username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🎨 pixiv URL</label>
              <input
                type="url"
                value={pixivUrl}
                onChange={(e) => setPixivUrl(e.target.value)}
                className="input-field"
                placeholder="https://www.pixiv.net/users/12345"
              />
            </div>
          </div>
        </div>

        {/* コミッション受付 */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">コミッション設定</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={commissionOpen}
                onChange={(e) => setCommissionOpen(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">
                コミッション受付を{commissionOpen ? "ON" : "OFF"}
              </span>
              <p className="text-xs text-gray-500">
                ONにすると、あなたのプロフィールにコミッション受付中と表示されます
              </p>
            </div>
          </label>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/creator/profile")}
            className="btn-secondary"
          >
            キャンセル
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}
