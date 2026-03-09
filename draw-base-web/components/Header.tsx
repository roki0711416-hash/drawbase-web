"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

type UserRole = "CREATOR" | "FAN" | "BOTH" | null;

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (session?.user as { role?: UserRole } | undefined)?.role ?? null;
  const isCreator = role === "CREATOR" || role === "BOTH";
  const isFan = role === "FAN" || role === "BOTH";

  // ロール別のダッシュボードURL
  const dashboardUrl = isCreator ? "/creator/dashboard" : "/fan/dashboard";

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
          <Link href={session?.user ? dashboardUrl : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DB</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              DRAW BASE
            </span>
          </Link>

          {/* Desktop Navigation — 役割別 */}
          <nav className="hidden md:flex items-center gap-5">
            {!session?.user ? (
              <>
                <NavLink href="/">ホーム</NavLink>
                <NavLink href="/feed">フィード</NavLink>
                <NavLink href="/community">コミュニティ</NavLink>
                <NavLink href="/marketplace">マーケット</NavLink>
                <NavLink href="/commissions">コミッション</NavLink>
              </>
            ) : isCreator ? (
              <>
                <NavLink href="/creator/dashboard">ダッシュボード</NavLink>
                <NavLink href="/creator/works">作品</NavLink>
                <NavLink href="/creator/commissions">コミッション</NavLink>
                <NavLink href="/feed">フィード</NavLink>
                <NavLink href="/marketplace">マーケット</NavLink>
              </>
            ) : (
              <>
                <NavLink href="/fan/dashboard">ホーム</NavLink>
                <NavLink href="/feed">フィード</NavLink>
                <NavLink href="/fan/favorites">お気に入り</NavLink>
                <NavLink href="/marketplace">マーケット</NavLink>
                <NavLink href="/commissions">コミッション</NavLink>
              </>
            )}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                {isCreator && (
                  <Link
                    href="/creator/works/new"
                    className="hidden sm:inline-flex items-center gap-1.5 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    投稿
                  </Link>
                )}

                <Link
                  href={isCreator ? "/creator/notifications" : "/fan/notifications"}
                  className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </Link>

                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCreator ? "bg-primary-100" : "bg-accent-100"
                    }`}>
                      <span className={`text-sm font-bold ${
                        isCreator ? "text-primary-700" : "text-accent-700"
                      }`}>
                        {session.user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
                        <p className="text-xs text-gray-500">{isCreator ? "🎨 クリエイター" : "⭐ ファン"}</p>
                      </div>

                      {isCreator ? (
                        <>
                          <Link href="/creator/dashboard" className="block px-4 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50" onClick={() => setMenuOpen(false)}>
                            🎨 クリエイター管理
                          </Link>
                          <Link href="/creator/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                            プロフィール
                          </Link>
                          <Link href="/creator/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                            📦 注文管理
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/fan/dashboard" className="block px-4 py-2 text-sm text-accent-600 font-medium hover:bg-accent-50" onClick={() => setMenuOpen(false)}>
                            ⭐ マイページ
                          </Link>
                          <Link href="/fan/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                            ❤️ お気に入り
                          </Link>
                          <Link href="/fan/following" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                            👥 フォロー中
                          </Link>
                          <Link href="/fan/profile/edit" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                            プロフィール編集
                          </Link>
                        </>
                      )}

                      <hr className="my-1" />
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:block" />
            )}

            <button className="md:hidden p-2 text-gray-500" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation — 役割別 */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-1">
            {!session?.user ? (
              <>
                <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>ホーム</MobileNavLink>
                <MobileNavLink href="/feed" onClick={() => setMobileOpen(false)}>フィード</MobileNavLink>
                <MobileNavLink href="/community" onClick={() => setMobileOpen(false)}>コミュニティ</MobileNavLink>
                <MobileNavLink href="/marketplace" onClick={() => setMobileOpen(false)}>マーケット</MobileNavLink>
                <MobileNavLink href="/commissions" onClick={() => setMobileOpen(false)}>コミッション</MobileNavLink>
                <div className="border-t border-gray-200 mt-2 pt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 px-3">
                    <Link href="/auth/login?role=creator" className="block text-center bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700" onClick={() => setMobileOpen(false)}>🎨 クリエイター</Link>
                    <Link href="/auth/login?role=fan" className="block text-center bg-accent-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-accent-700" onClick={() => setMobileOpen(false)}>⭐ ファン</Link>
                  </div>
                </div>
              </>
            ) : isCreator ? (
              <>
                <MobileNavLink href="/creator/dashboard" onClick={() => setMobileOpen(false)}>📊 ダッシュボード</MobileNavLink>
                <MobileNavLink href="/creator/works" onClick={() => setMobileOpen(false)}>🖼️ 作品</MobileNavLink>
                <MobileNavLink href="/creator/commissions" onClick={() => setMobileOpen(false)}>📋 コミッション</MobileNavLink>
                <MobileNavLink href="/creator/orders" onClick={() => setMobileOpen(false)}>📦 注文</MobileNavLink>
                <MobileNavLink href="/creator/analytics" onClick={() => setMobileOpen(false)}>📈 分析</MobileNavLink>
                <MobileNavLink href="/feed" onClick={() => setMobileOpen(false)}>📰 フィード</MobileNavLink>
                <MobileNavLink href="/marketplace" onClick={() => setMobileOpen(false)}>🛍️ マーケット</MobileNavLink>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <MobileNavLink href="/creator/works/new" onClick={() => setMobileOpen(false)}>
                    <span className="text-primary-600 font-medium">+ 新規作品を投稿</span>
                  </MobileNavLink>
                </div>
              </>
            ) : (
              <>
                <MobileNavLink href="/fan/dashboard" onClick={() => setMobileOpen(false)}>🏠 ホーム</MobileNavLink>
                <MobileNavLink href="/feed" onClick={() => setMobileOpen(false)}>📰 フィード</MobileNavLink>
                <MobileNavLink href="/fan/favorites" onClick={() => setMobileOpen(false)}>❤️ お気に入り</MobileNavLink>
                <MobileNavLink href="/fan/following" onClick={() => setMobileOpen(false)}>👥 フォロー中</MobileNavLink>
                <MobileNavLink href="/marketplace" onClick={() => setMobileOpen(false)}>🛍️ マーケット</MobileNavLink>
                <MobileNavLink href="/commissions" onClick={() => setMobileOpen(false)}>✏️ コミッション</MobileNavLink>
                <MobileNavLink href="/fan/purchases" onClick={() => setMobileOpen(false)}>🛒 購入履歴</MobileNavLink>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-gray-600 hover:text-primary-600 transition-colors font-medium text-sm">
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm" onClick={onClick}>
      {children}
    </Link>
  );
}
