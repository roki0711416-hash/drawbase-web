"use client";

import { useState, useEffect } from "react";
import CommunityPostCard from "@/components/CommunityPostCard";
import { apiFetch } from "@/lib/apiClient";

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await apiFetch("/api/community?limit=20");
      const data = await res.json();
      if (data.success) setPosts(data.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setPosting(true);

    try {
      const res = await apiFetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts([data.data, ...posts]);
        setNewContent("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="section-title mb-6">コミュニティ</h1>

      {/* New Post Form */}
      <form onSubmit={handlePost} className="card mb-6">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="textarea-field"
          rows={3}
          placeholder="何かシェアしませんか？"
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={posting || !newContent.trim()}
            className="btn-primary"
          >
            {posting ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </form>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">まだ投稿がありません</p>
          <p className="text-sm text-gray-400 mt-1">
            最初の投稿をしてみましょう！
          </p>
        </div>
      )}
    </div>
  );
}
