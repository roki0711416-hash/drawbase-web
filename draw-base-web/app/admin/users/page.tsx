"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
  _count: {
    posts: number;
    products: number;
    communityPosts: number;
    followers: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters from URL
  const q = searchParams.get("q") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";
  const page = searchParams.get("page") || "1";

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (role) params.set("role", role);
      if (status) params.set("status", status);
      params.set("page", page);
      params.set("limit", "20");

      const res = await apiFetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [q, role, status, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update URL params
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1
    router.push(`/admin/users?${params}`);
  };

  // Admin actions
  const handleAction = async (
    userId: string,
    action: string,
    value: unknown
  ) => {
    if (!confirm(getConfirmMessage(action, value))) return;
    setActionLoading(userId);
    try {
      const res = await apiFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, value }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.error || "操作に失敗しました");
      }
    } catch {
      alert("ネットワークエラーが発生しました");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ユーザー管理</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="名前 or メールで検索..."
              defaultValue={q}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateFilter("q", (e.target as HTMLInputElement).value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Role filter */}
          <select
            value={role}
            onChange={(e) => updateFilter("role", e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">全 Role</option>
            <option value="CREATOR">Creator</option>
            <option value="FAN">Fan</option>
            <option value="BOTH">Both</option>
            <option value="null">未選択</option>
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">全ステータス</option>
            <option value="active">アクティブ</option>
            <option value="banned">停止中</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      {loading ? (
        <div className="text-gray-400 py-12 text-center">読み込み中...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-400 py-12 text-center">
          該当するユーザーが見つかりません
        </div>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    ユーザー
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    投稿
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    商品
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    フォロワー
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    登録日
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    ステータス
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 ${user.isBanned ? "opacity-60" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-1.5">
                          {user.name}
                          {user.isAdmin && (
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {user._count.posts}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {user._count.products}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {user._count.followers}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="py-3 px-4">
                      {user.isBanned ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          停止中
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          アクティブ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <UserActions
                        user={user}
                        loading={actionLoading === user.id}
                        onAction={(action, value) =>
                          handleAction(user.id, action, value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                {pagination.total} 件中{" "}
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                件表示
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(
                      searchParams.toString()
                    );
                    params.set("page", String(pagination.page - 1));
                    router.push(`/admin/users?${params}`);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  前へ
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(
                      searchParams.toString()
                    );
                    params.set("page", String(pagination.page + 1));
                    router.push(`/admin/users?${params}`);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  次へ
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function RoleBadge({ role }: { role: string | null }) {
  if (!role) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        未選択
      </span>
    );
  }
  const styles: Record<string, string> = {
    CREATOR: "bg-blue-100 text-blue-700",
    FAN: "bg-pink-100 text-pink-700",
    BOTH: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] || "bg-gray-100"}`}
    >
      {role}
    </span>
  );
}

function UserActions({
  user,
  loading,
  onAction,
}: {
  user: AdminUser;
  loading: boolean;
  onAction: (action: string, value: unknown) => void;
}) {
  const [open, setOpen] = useState(false);

  if (loading) {
    return <span className="text-gray-400 text-xs">処理中...</span>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
      >
        ⋯
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
            {/* Role changes */}
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase">
              Role 変更
            </div>
            {["CREATOR", "FAN", "BOTH"].map((r) => (
              <button
                key={r}
                disabled={user.role === r}
                onClick={() => {
                  onAction("setRole", r);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-40"
              >
                → {r}
              </button>
            ))}

            <div className="border-t border-gray-100 my-1" />

            {/* Ban / Unban */}
            {!user.isAdmin && (
              <button
                onClick={() => {
                  onAction("setBan", !user.isBanned);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${user.isBanned ? "text-green-600" : "text-red-600"}`}
              >
                {user.isBanned ? "🔓 停止を解除" : "🚫 アカウント停止"}
              </button>
            )}

            {/* Admin toggle */}
            <button
              onClick={() => {
                onAction("setAdmin", !user.isAdmin);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-yellow-600"
            >
              {user.isAdmin ? "👤 Admin 解除" : "⭐ Admin 付与"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function getConfirmMessage(action: string, value: unknown): string {
  switch (action) {
    case "setRole":
      return `Role を ${value} に変更しますか？`;
    case "setBan":
      return value
        ? "このユーザーのアカウントを停止しますか？\nログインできなくなります。"
        : "アカウント停止を解除しますか？";
    case "setAdmin":
      return value
        ? "このユーザーに管理者権限を付与しますか？"
        : "管理者権限を解除しますか？";
    default:
      return "この操作を実行しますか？";
  }
}
