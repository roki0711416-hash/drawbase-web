"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

interface CreatorProfile {
  id: string;
  name: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  headerUrl: string | null;
  website: string | null;
  twitterHandle: string | null;
  instagramHandle: string | null;
  pixivUrl: string | null;
  genres: string[];
  commissionOpen: boolean;
  createdAt: string;
  _count: { posts: number; followers: number; following: number };
}

export default function CreatorProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
      if (json.success) setProfile(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.displayName || profile.name;

  return (
    <div className="space-y-6">
      {/* ヘッダー画像 */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-400 to-primary-600 h-40 sm:h-52">
        {profile.headerUrl && (
          <img
            src={profile.headerUrl}
            alt="Header"
            className="w-full h-full object-cover"
          />
        )}
        <Link
          href="/creator/profile/edit"
          className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors shadow"
        >
          ✏️ 編集する
        </Link>
      </div>

      {/* アバター & 基本情報 */}
      <div className="card -mt-16 relative z-10 mx-4 sm:mx-0">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-100 border-4 border-white shadow -mt-14 flex items-center justify-center overflow-hidden">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-600 text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-sm text-gray-500">@{profile.name}</p>
            {profile.bio && (
              <p className="text-gray-700 mt-2 text-sm whitespace-pre-wrap">{profile.bio}</p>
            )}

            {/* ジャンルタグ */}
            {profile.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{profile._count.posts}</div>
            <div className="text-xs text-gray-500">作品</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{profile._count.followers}</div>
            <div className="text-xs text-gray-500">フォロワー</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{profile._count.following}</div>
            <div className="text-xs text-gray-500">フォロー中</div>
          </div>
        </div>
      </div>

      {/* SNS & リンク */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">リンク</h2>
        <div className="space-y-3">
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-primary-600">
              <span>🌐</span> {profile.website}
            </a>
          )}
          {profile.twitterHandle && (
            <a href={`https://twitter.com/${profile.twitterHandle}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-primary-600">
              <span>𝕏</span> @{profile.twitterHandle}
            </a>
          )}
          {profile.instagramHandle && (
            <a href={`https://instagram.com/${profile.instagramHandle}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-primary-600">
              <span>📷</span> @{profile.instagramHandle}
            </a>
          )}
          {profile.pixivUrl && (
            <a href={profile.pixivUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-primary-600">
              <span>🎨</span> pixiv
            </a>
          )}
          {!profile.website && !profile.twitterHandle && !profile.instagramHandle && !profile.pixivUrl && (
            <p className="text-sm text-gray-400">リンクが設定されていません</p>
          )}
        </div>
      </div>

      {/* コミッション受付状態 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">コミッション</h2>
            <p className="text-sm text-gray-500 mt-1">
              {profile.commissionOpen ? "現在コミッションを受け付けています" : "現在コミッションは受け付けていません"}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              profile.commissionOpen
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {profile.commissionOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>
      </div>
    </div>
  );
}
