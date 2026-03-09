"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/apiClient";

interface FanProfile {
  id: string;
  name: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  headerUrl: string | null;
  website: string | null;
  twitterHandle: string | null;
}

export default function FanProfileEditPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<FanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // フォームフィールド
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [headerUrl, setHeaderUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      try {
        const res = await apiFetch("/api/fan/profile");
        const data = await res.json();
        if (data.success && data.data) {
          const p = data.data;
          setProfile(p);
          setDisplayName(p.displayName || "");
          setBio(p.bio || "");
          setAvatarUrl(p.avatarUrl || "");
          setHeaderUrl(p.headerUrl || "");
          setWebsite(p.website || "");
          setTwitterHandle(p.twitterHandle || "");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await apiFetch("/api/fan/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl,
          headerUrl,
          website,
          twitterHandle,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "保存に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">👤 プロフィール編集</h1>

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✅ プロフィールを更新しました
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* プレビュー */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* ヘッダー画像 */}
          <div className="h-32 bg-gradient-to-r from-accent-200 to-pink-200 relative">
            {headerUrl && (
              <img src={headerUrl} alt="ヘッダー" className="w-full h-full object-cover" />
            )}
          </div>
          {/* アバター */}
          <div className="px-5 -mt-10">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-accent-100 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="アバター" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-accent-600">
                  {(displayName || profile?.name || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="px-5 py-3">
            <p className="font-bold text-gray-900">{displayName || profile?.name}</p>
            <p className="text-xs text-gray-500">@{profile?.name}</p>
          </div>
        </div>

        {/* フォームフィールド */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">アバター URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ヘッダー画像 URL</label>
            <input
              type="url"
              value={headerUrl}
              onChange={(e) => setHeaderUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/header.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="表示名を入力"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              自己紹介
              <span className="text-gray-400 font-normal ml-2">{bio.length}/300</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="textarea-field"
              rows={4}
              placeholder="自己紹介を入力"
              maxLength={300}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ウェブサイト</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="input-field"
              placeholder="https://your-site.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">@</span>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                className="input-field"
                placeholder="username"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-accent-500 text-white py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors disabled:opacity-50"
        >
          {saving ? "保存中..." : "プロフィールを保存"}
        </button>
      </form>
    </div>
  );
}
