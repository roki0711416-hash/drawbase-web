"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/apiClient";

export default function NewCommissionMenuPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("14");
  const [maxSlots, setMaxSlots] = useState("3");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError("ログインが必要です");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/commission/menu/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          price: parseInt(price),
          deliveryDays: parseInt(deliveryDays),
          maxSlots: parseInt(maxSlots),
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/commissions");
      } else {
        setError(data.error || "作成に失敗しました");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="section-title mb-6">コミッションメニューを作成</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メニュータイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="例：SNSアイコン制作"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea-field"
            rows={4}
            placeholder="どのようなイラストを描くか、制作期間、注意事項などを記入..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              価格（円） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
              placeholder="5000"
              min="500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              納期（日）
            </label>
            <input
              type="number"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              className="input-field"
              min="1"
              max="365"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最大受注数
            </label>
            <input
              type="number"
              value={maxSlots}
              onChange={(e) => setMaxSlots(e.target.value)}
              className="input-field"
              min="1"
              max="20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title || !price}
          className="btn-primary w-full"
        >
          {loading ? "作成中..." : "メニューを作成"}
        </button>
      </form>
    </div>
  );
}
