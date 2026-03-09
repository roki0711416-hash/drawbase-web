"use client";

import Link from "next/link";

export default function FanPurchasesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🛒 購入履歴</h1>
      <div className="bg-gray-50 rounded-xl p-12 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-lg font-bold text-gray-700 mb-2">Coming Soon</h2>
        <p className="text-gray-500 text-sm mb-4">
          購入履歴機能は Phase 2 で実装予定です
        </p>
        <Link
          href="/marketplace"
          className="inline-block bg-accent-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors"
        >
          マーケットを見る
        </Link>
      </div>
    </div>
  );
}
