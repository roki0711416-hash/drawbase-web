"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/fan/dashboard", label: "ホーム", icon: "🏠" },
  { href: "/feed", label: "フィード", icon: "📰" },
  { href: "/fan/favorites", label: "お気に入り", icon: "❤️" },
  { href: "/fan/following", label: "フォロー中", icon: "👥" },
  { href: "/fan/purchases", label: "購入履歴", icon: "🛒" },
  { href: "/fan/notifications", label: "通知", icon: "🔔" },
  { href: "/fan/profile/edit", label: "プロフィール", icon: "👤" },
];

export default function FanSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-5 py-4">
          <h2 className="text-white font-bold text-sm tracking-wide">
            ⭐ マイページ
          </h2>
        </div>

        {/* ナビゲーション */}
        <ul className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/fan/dashboard" &&
                item.href !== "/feed" &&
                pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent-50 text-accent-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* クイックアクション */}
        <div className="border-t border-gray-100 p-3">
          <Link
            href="/commissions"
            className="flex items-center justify-center gap-2 w-full bg-accent-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            コミッションを依頼
          </Link>
        </div>
      </nav>
    </aside>
  );
}
