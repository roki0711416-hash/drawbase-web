"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/creator/dashboard", label: "ダッシュボード", icon: "📊" },
  { href: "/creator/works", label: "作品管理", icon: "🎨" },
  { href: "/creator/commissions", label: "コミッション", icon: "📋" },
  { href: "/creator/profile", label: "プロフィール", icon: "👤" },
];

export default function CreatorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4">
          <h2 className="text-white font-bold text-sm tracking-wide">
            🎨 クリエイター管理
          </h2>
        </div>

        {/* ナビゲーション */}
        <ul className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/creator/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
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
            href="/creator/works/new"
            className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規作品を投稿
          </Link>
        </div>
      </nav>
    </aside>
  );
}
