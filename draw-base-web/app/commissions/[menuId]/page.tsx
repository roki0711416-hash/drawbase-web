"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

export default function CommissionMenuDetailPage({
  params,
}: {
  params: { menuId: string };
}) {
  const { data: session } = useSession();
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [referenceUrls, setReferenceUrls] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch(`/api/commission/menu/${params.menuId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMenu(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.menuId]);

  const formatPrice = (price: number, currency: string) => {
    if (currency === "JPY") return `¥${price.toLocaleString()}`;
    return `$${(price / 100).toFixed(2)}`;
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError("ログインが必要です");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const refs = referenceUrls
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await apiFetch("/api/commission/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId: params.menuId,
          description: requestText,
          referenceUrls: refs.length > 0 ? refs : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setShowRequestForm(false);
        // Update slot count locally
        setMenu((prev: any) => ({
          ...prev,
          currentSlots: prev.currentSlots + 1,
        }));
      } else {
        setError(data.error || "依頼の送信に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="aspect-video bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✏️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          メニューが見つかりません
        </h1>
        <Link href="/commissions" className="text-primary-600 hover:underline text-sm">
          コミッション一覧に戻る
        </Link>
      </div>
    );
  }

  const slotsLeft = menu.maxSlots - menu.currentSlots;
  const isOwnMenu = session?.user && (session.user as any).id === menu.creator?.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/commissions"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
        </svg>
        コミッション一覧
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Thumbnail */}
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
            {menu.thumbnailUrl ? (
              <img
                src={menu.thumbnailUrl}
                alt={menu.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
                <svg className="w-16 h-16 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{menu.title}</h1>

          {menu.description && (
            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
              {menu.description}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 space-y-4">
            {/* Price & Info Card */}
            <div className="card">
              <div className="text-3xl font-bold text-primary-600 mb-4">
                {formatPrice(menu.price, menu.currency)}
              </div>

              <div className="space-y-3 text-sm">
                {/* Delivery */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">納期目安</span>
                  <span className="font-medium text-gray-900">
                    {menu.deliveryDays || 14}日
                  </span>
                </div>

                {/* Slots */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">残り枠</span>
                  <span className={`font-medium ${slotsLeft > 0 ? "text-green-600" : "text-red-600"}`}>
                    {slotsLeft > 0 ? `${slotsLeft} / ${menu.maxSlots}` : "満員"}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">受付状態</span>
                  <span className={`inline-flex items-center gap-1 font-medium ${menu.isOpen ? "text-green-600" : "text-gray-400"}`}>
                    <span className={`w-2 h-2 rounded-full ${menu.isOpen ? "bg-green-500" : "bg-gray-400"}`} />
                    {menu.isOpen ? "受付中" : "停止中"}
                  </span>
                </div>
              </div>

              {/* Slots progress bar */}
              <div className="mt-4">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      slotsLeft === 0 ? "bg-red-500" : slotsLeft <= 1 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${(menu.currentSlots / menu.maxSlots) * 100}%` }}
                  />
                </div>
              </div>

              {/* Request button */}
              {success ? (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm text-center">
                  ✅ 依頼を送信しました！<br />
                  <Link href="/commissions" className="text-green-600 hover:underline font-medium">
                    注文一覧を見る
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => setShowRequestForm(true)}
                  disabled={!menu.isOpen || slotsLeft === 0 || isOwnMenu || !session}
                  className="btn-accent w-full mt-4 py-3"
                >
                  {!session
                    ? "ログインして依頼する"
                    : isOwnMenu
                    ? "自分のメニューです"
                    : slotsLeft === 0
                    ? "現在満員です"
                    : !menu.isOpen
                    ? "受付停止中"
                    : "✏️ コミッションを依頼する"}
                </button>
              )}
            </div>

            {/* Creator card */}
            {menu.creator && (
              <Link
                href={`/users/${menu.creator.id}`}
                className="card flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {menu.creator.avatarUrl ? (
                    <img src={menu.creator.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg text-primary-700 font-bold">
                      {menu.creator.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {menu.creator.displayName || menu.creator.name}
                  </p>
                  <p className="text-xs text-gray-500">@{menu.creator.name}</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!submitting) setShowRequestForm(false);
            }}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                コミッションを依頼
              </h2>
              <button
                onClick={() => !submitting && setShowRequestForm(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* Menu summary */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{menu.title}</p>
                <p className="text-xs text-gray-500">
                  {menu.creator?.displayName || menu.creator?.name} ・ {formatPrice(menu.price, menu.currency)}
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleRequest} className="space-y-4">
              {/* Request text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  依頼内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  className="textarea-field"
                  rows={6}
                  placeholder={`希望するイラストの詳細を記入してください。\n\n例:\n・キャラクターの特徴（髪色、服装など）\n・ポーズ・構図のイメージ\n・背景の有無\n・その他の要望`}
                  maxLength={5000}
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {requestText.length}/5000（最低10文字）
                </p>
              </div>

              {/* Reference URLs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  参考画像URL <span className="text-xs text-gray-400 font-normal">（任意・1行に1つ）</span>
                </label>
                <textarea
                  value={referenceUrls}
                  onChange={(e) => setReferenceUrls(e.target.value)}
                  className="textarea-field"
                  rows={3}
                  placeholder="https://example.com/reference1.jpg&#10;https://example.com/reference2.jpg"
                />
              </div>

              {/* Price display */}
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                <span className="text-sm text-gray-700">お支払い金額</span>
                <span className="text-lg font-bold text-primary-700">
                  {formatPrice(menu.price, menu.currency)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  disabled={submitting}
                  className="btn-secondary flex-1"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={submitting || requestText.length < 10}
                  className="btn-accent flex-1"
                >
                  {submitting ? "送信中..." : "依頼を送信する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
