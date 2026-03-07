"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CommissionCard from "@/components/CommissionCard";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "承認待ち", color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED: { label: "承認済み", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "制作中", color: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "納品済み", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "完了", color: "bg-gray-100 text-gray-700" },
  CANCELLED: { label: "キャンセル", color: "bg-red-100 text-red-600" },
  DISPUTED: { label: "紛争中", color: "bg-red-100 text-red-700" },
};

export default function CommissionsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"browse" | "orders">("browse");
  const [menus, setMenus] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderRole, setOrderRole] = useState<"client" | "creator">("client");
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch menus
  useEffect(() => {
    apiFetch("/api/commissions/menus")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMenus(data.data);
        setLoadingMenus(false);
      })
      .catch(() => setLoadingMenus(false));
  }, []);

  // Fetch orders when tab or role changes
  useEffect(() => {
    if (tab !== "orders" || !session) return;
    setLoadingOrders(true);
    apiFetch(`/api/commission/orders?role=${orderRole}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrders(data.data.orders);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, [tab, orderRole, session]);

  const formatPrice = (price: number, currency: string) => {
    if (currency === "JPY") return `¥${price.toLocaleString()}`;
    return `$${(price / 100).toFixed(2)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">コミッション</h1>
          <p className="text-sm text-gray-500 mt-1">
            クリエイターにイラストを依頼しよう
          </p>
        </div>
        <Link href="/commissions/new" className="btn-primary">
          メニューを作成
        </Link>
      </div>

      {/* Tabs */}
      {session && (
        <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setTab("browse")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "browse"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🔍 メニューを探す
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "orders"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📋 注文管理
          </button>
        </div>
      )}

      {/* Browse Tab */}
      {tab === "browse" && (
        <>
          {/* How It Works */}
          <div className="card mb-8">
            <h2 className="font-medium text-gray-900 mb-4">コミッションの流れ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "メニューを選ぶ", desc: "クリエイターの提供するメニューから選択" },
                { step: "2", title: "依頼内容を送る", desc: "希望するイラストの詳細を記入" },
                { step: "3", title: "制作・やりとり", desc: "クリエイターが制作を開始" },
                { step: "4", title: "納品・完了", desc: "完成作品を受け取り" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Menus Grid */}
          {loadingMenus ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-xl" />
                  <div className="mt-3 h-5 bg-gray-200 rounded w-3/4" />
                  <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : menus.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus.map((menu) => (
                <CommissionCard key={menu.id} menu={menu} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">✏️</div>
              <p className="text-gray-500">コミッションメニューがまだありません</p>
              <p className="text-sm text-gray-400 mt-1">最初のメニューを作成してみましょう</p>
            </div>
          )}
        </>
      )}

      {/* Orders Tab */}
      {tab === "orders" && session && (
        <>
          {/* Role toggle */}
          <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
            <button
              onClick={() => setOrderRole("client")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                orderRole === "client"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              依頼した注文
            </button>
            <button
              onClick={() => setOrderRole("creator")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                orderRole === "creator"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              受注した注文
            </button>
          </div>

          {loadingOrders ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => {
                const statusInfo = STATUS_LABELS[order.status] || {
                  label: order.status,
                  color: "bg-gray-100 text-gray-600",
                };
                const otherUser = orderRole === "client" ? order.creator : order.client;

                return (
                  <Link
                    key={order.id}
                    href={`/commissions/${order.id}`}
                    className="card flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {otherUser?.avatarUrl ? (
                          <img src={otherUser.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-sm text-primary-700 font-bold">
                            {otherUser?.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.menu?.title || "コミッション"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {orderRole === "client" ? "クリエイター" : "依頼者"}: {otherUser?.displayName || otherUser?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {formatPrice(order.price, order.currency)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500">
                {orderRole === "client"
                  ? "依頼した注文はまだありません"
                  : "受注した注文はまだありません"}
              </p>
              {orderRole === "client" && (
                <button
                  onClick={() => setTab("browse")}
                  className="btn-primary mt-4"
                >
                  メニューを探す
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
