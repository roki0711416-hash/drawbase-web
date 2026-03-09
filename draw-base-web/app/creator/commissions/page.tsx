"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";

interface CommissionMenu {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  deliveryDays: number;
  revisionCount: number;
  thumbnailUrl: string | null;
  isOpen: boolean;
  maxSlots: number;
  currentSlots: number;
  createdAt: string;
  _count: { orders: number };
}

export default function CreatorCommissionsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [menus, setMenus] = useState<CommissionMenu[]>([]);
  const [loading, setLoading] = useState(true);

  // 新規メニューフォーム
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState(5000);
  const [formDeliveryDays, setFormDeliveryDays] = useState(14);
  const [formRevisionCount, setFormRevisionCount] = useState(1);
  const [formMaxSlots, setFormMaxSlots] = useState(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?role=creator");
      return;
    }
    if (status === "authenticated") fetchMenus();
  }, [status, router]);

  async function fetchMenus() {
    try {
      const res = await apiFetch("/api/creator/commissions");
      const json = await res.json();
      if (json.success) setMenus(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await apiFetch("/api/creator/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || null,
          price: formPrice,
          deliveryDays: formDeliveryDays,
          revisionCount: formRevisionCount,
          maxSlots: formMaxSlots,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowForm(false);
        resetForm();
        fetchMenus();
      } else {
        setError(json.error || "作成に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  async function toggleMenuOpen(menu: CommissionMenu) {
    try {
      await apiFetch("/api/creator/commissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: menu.id, isOpen: !menu.isOpen }),
      });
      fetchMenus();
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteMenu(id: string) {
    if (!confirm("このメニューを削除しますか？")) return;
    try {
      await apiFetch(`/api/creator/commissions?id=${id}`, { method: "DELETE" });
      fetchMenus();
    } catch (e) {
      console.error(e);
    }
  }

  function resetForm() {
    setFormTitle("");
    setFormDescription("");
    setFormPrice(5000);
    setFormDeliveryDays(14);
    setFormRevisionCount(1);
    setFormMaxSlots(3);
    setError("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">コミッション管理</h1>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="btn-primary"
        >
          {showForm ? "キャンセル" : "+ 新規メニュー"}
        </button>
      </div>

      {/* 新規メニューフォーム */}
      {showForm && (
        <div className="card border-primary-200 bg-primary-50/30">
          <h2 className="font-bold text-gray-900 mb-4">新しいコミッションメニュー</h2>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メニュー名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input-field"
                  placeholder="例: キャラクターイラスト（バストアップ）"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="textarea-field"
                  rows={3}
                  placeholder="メニューの詳細を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格 (円) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                  className="input-field"
                  min={500}
                  step={100}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">500円以上</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">納期 (日)</label>
                <input
                  type="number"
                  value={formDeliveryDays}
                  onChange={(e) => setFormDeliveryDays(parseInt(e.target.value) || 14)}
                  className="input-field"
                  min={1}
                  max={365}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">修正回数</label>
                <input
                  type="number"
                  value={formRevisionCount}
                  onChange={(e) => setFormRevisionCount(parseInt(e.target.value) || 1)}
                  className="input-field"
                  min={0}
                  max={10}
                />
                <p className="text-xs text-gray-400 mt-1">0 = 修正なし</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">同時受付数</label>
                <input
                  type="number"
                  value={formMaxSlots}
                  onChange={(e) => setFormMaxSlots(parseInt(e.target.value) || 3)}
                  className="input-field"
                  min={1}
                  max={20}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "作成中..." : "メニューを作成"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* メニュー一覧 */}
      {menus.length === 0 && !showForm ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            コミッションメニューがありません
          </h2>
          <p className="text-gray-500 mb-6">
            メニューを作成してコミッションの受付を始めましょう
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            最初のメニューを作成
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {menus.map((menu) => (
            <div key={menu.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{menu.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        menu.isOpen
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {menu.isOpen ? "受付中" : "停止中"}
                    </span>
                  </div>
                  {menu.description && (
                    <p className="text-sm text-gray-600 mb-2">{menu.description}</p>
                  )}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">
                      ¥{menu.price.toLocaleString()}
                    </span>
                    <span>📅 納期 {menu.deliveryDays}日</span>
                    <span>🔄 修正 {menu.revisionCount}回</span>
                    <span>
                      👥 {menu.currentSlots}/{menu.maxSlots} スロット
                    </span>
                    <span>📩 {menu._count.orders}件の依頼</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleMenuOpen(menu)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      menu.isOpen
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {menu.isOpen ? "停止する" : "再開する"}
                  </button>
                  <button
                    onClick={() => deleteMenu(menu.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
