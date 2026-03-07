"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/notifications?limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setNotifications(data.data.notifications);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await apiFetch("/api/notifications", { method: "PATCH" });
    setNotifications(
      notifications.map((n) => ({ ...n, isRead: true }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return "❤️";
      case "COMMENT":
        return "💬";
      case "FOLLOW":
        return "👤";
      case "COMMISSION_REQUEST":
        return "✏️";
      case "COMMISSION_UPDATE":
        return "📋";
      case "PURCHASE":
        return "🛍️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">通知</h1>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            すべて既読にする
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.linkUrl || "#"}
              className={`card flex items-start gap-3 hover:shadow-md transition-shadow ${
                !notif.isRead ? "border-l-4 border-l-primary-500" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.createdAt).toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!notif.isRead && (
                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔔</div>
          <p className="text-gray-500">通知はまだありません</p>
        </div>
      )}
    </div>
  );
}
