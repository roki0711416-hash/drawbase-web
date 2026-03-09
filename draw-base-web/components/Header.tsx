"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* ── 未ログイン時: クリエイター / ファン 分割バー ── */}
      {!session?.user && (
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              {/* クリエイター側 */}
              <div className="flex items-center justify-between py-2 pr-4">
                <span className="text-xs font-bold text-primary-700 tracking-wide">
                  🎨 クリエイター
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/register?role=creator"
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium hover:underline"
                  >
                    新規登録
                  </Link>
                  <Link
                    href="/auth/login?role=creator"
                    className="text-xs bg-primary-600 text-white px-3 py-1 rounded font-medium hover:bg-primary-700 transition-colors"
                  >
                    ログイン
                  </Link>
                </div>
              </div>
              {/* ファン側 */}
              <div className="flex items-center justify-between py-2 pl-4">
                <span className="text-xs font-bold text-accent-700 tracking-wide">
                  ⭐ ファン
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/register?role=fan"
                    className="text-xs text-accent-600 hover:text-accent-800 font-medium hover:underline"
                  >
                    新規登録
                  </Link>
                  <Link
                    href="/auth/login?role=fan"
                    className="text-xs bg-accent-600 text-white px-3 py-1 rounded font-medium hover:bg-accent-700 transition-colors"
                  >
                    ログイン
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── メインヘッダー ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DB</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              DRAW BASE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              ホーム
            </Link>
            <Link
              href="/feed"
              className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              フィード
            </Link>
            <Link
              href="/community"
              className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              コミュニティ
            </Link>
            <Link
              href="/marketplace"
              className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              マーケット
            </Link>
            <Link
              href="/commissions"
              className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              コミッション
            </Link>
          </nav>

          {/* User area */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link
                  href="/create-post"
                  className="hidden sm:inline-flex items-center gap-1.5 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
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
                  投稿
                </Link>
                <Link
                  href="/notifications"
                  className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 text-sm font-bold">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {(session.user as { role?: string }).role === "CREATOR" ||
                       (session.user as { role?: string }).role === "BOTH" ? (
                        <>
                          <Link
                            href="/creator/dashboard"
                            className="block px-4 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50"
                            onClick={() => setMenuOpen(false)}
                          >
                            🎨 クリエイター管理
                          </Link>
                          <hr className="my-1" />
                        </>
                      ) : null}
                      <Link
                        href={`/users/${(session.user as { id: string }).id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        プロフィール
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        設定
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* 未ログイン時はヘッダーバーにログインUIがあるのでここは空 */
              <div className="hidden md:block" />
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-500"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              ホーム
            </Link>
            <Link
              href="/feed"
              className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              フィード
            </Link>
            <Link
              href="/community"
              className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              コミュニティ
            </Link>
            <Link
              href="/marketplace"
              className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              マーケット
            </Link>
            <Link
              href="/commissions"
              className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              コミッション
            </Link>
            {session?.user && (
              <Link
                href="/create-post"
                className="block px-3 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                + 新規投稿
              </Link>
            )}
            {!session?.user && (
              <div className="border-t border-gray-200 mt-2 pt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 px-3">
                  <Link
                    href="/auth/login?role=creator"
                    className="block text-center bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    🎨 クリエイター ログイン
                  </Link>
                  <Link
                    href="/auth/login?role=fan"
                    className="block text-center bg-accent-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-accent-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    ⭐ ファン ログイン
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2 px-3">
                  <Link
                    href="/auth/register?role=creator"
                    className="block text-center border border-primary-300 text-primary-700 py-2 rounded-lg text-sm font-medium hover:bg-primary-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    クリエイター 登録
                  </Link>
                  <Link
                    href="/auth/register?role=fan"
                    className="block text-center border border-accent-300 text-accent-700 py-2 rounded-lg text-sm font-medium hover:bg-accent-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    ファン 登録
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
