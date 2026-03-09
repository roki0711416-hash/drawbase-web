"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

interface Order {
  id: string;
  description: string;
  price: number;
  status: string;
  createdAt: string;
  client: { id: string; name: string; displayName: string | null; avatarUrl: string | null };
  menu: { id: string; title: string };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "未対応", color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "承認済み", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "制作中", color: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "納品済み", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "完了", color: "bg-gray-100 text-gray-700" },
  CANCELLED: { label: "キャンセル", color: "bg-red-100 text-red-700" },
  DISPUTED: { label: "紛争中", color: "bg-red-100 text-red-700" },
};

export default function CreatorOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      try {
        const res = await apiFetch("/api/commission/orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📦 注文管理</h1>
        <span className="text-sm text-gray-500">{orders.length} 件</span>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "ACCEPTED", "IN_PROGRESS", "DELIVERED", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "ALL" ? "すべて" : statusLabels[s]?.label || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">注文はありません</h2>
          <p className="text-gray-500 text-sm">コミッションメニューを公開して注文を受け付けましょう</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const st = statusLabels[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{order.menu.title}</h3>
                      <span className={`${st.color} px-2 py-0.5 rounded-full text-xs font-medium`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{order.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>依頼者: {order.client.displayName || order.client.name}</span>
                      <span>¥{order.price.toLocaleString()}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString("ja-JP")}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
