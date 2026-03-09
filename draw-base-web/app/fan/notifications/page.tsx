"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
  sender: { id: string; name: string; displayName: string | null; avatarUrl: string | null } | null;
}

export default function FanNotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      try {
        const res = await apiFetch("/api/notifications");
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const typeIcon: Record<string, string> = {
    LIKE: "♥",
    COMMENT: "💬",
    FOLLOW: "👤",
    COMMISSION_REQUEST: "✏️",
    COMMISSION_UPDATE: "📋",
    PURCHASE: "🛒",
    SYSTEM: "🔔",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🔔 通知</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🔔</div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">通知はありません</h2>
          <p className="text-gray-500 text-sm">新しい通知が届くとここに表示されます</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl border p-4 transition-colors ${
                n.isRead ? "border-gray-100" : "border-accent-200 bg-accent-50/30"
              }`}
            >
              {n.linkUrl ? (
                <Link href={n.linkUrl} className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{typeIcon[n.type] || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-500 shrink-0 mt-1.5" />
                  )}
                </Link>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{typeIcon[n.type] || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-500 shrink-0 mt-1.5" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
