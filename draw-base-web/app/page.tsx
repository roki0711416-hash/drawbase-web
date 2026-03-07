import Link from "next/link";
import PostCard from "@/components/PostCard";

// Demo data for SSR placeholder
const demoPost = {
  id: "demo-1",
  title: "サンプル作品",
  imageUrls: [],
  tags: ["イラスト", "オリジナル"],
  author: {
    id: "u1",
    name: "demo_artist",
    displayName: "デモアーティスト",
    avatarUrl: null,
  },
  _count: { likes: 42, comments: 5 },
  createdAt: new Date().toISOString(),
};

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero */}
      <section className="relative rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white p-8 sm:p-12 mb-10 overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            クリエイターの
            <br />
            すべてが、ここに。
          </h1>
          <p className="mt-4 text-primary-100 text-sm sm:text-base leading-relaxed">
            イラスト投稿、コミッション依頼、デジタルコンテンツ販売をひとつのプラットフォームで。
            あなたの創作活動をDRAW BASEがサポートします。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/auth/register"
              className="bg-white text-primary-700 px-6 py-2.5 rounded-lg font-medium hover:bg-primary-50 transition-colors text-sm"
            >
              無料で始める
            </Link>
            <Link
              href="/marketplace"
              className="bg-white/20 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/30 transition-colors text-sm backdrop-blur-sm"
            >
              マーケットを見る
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          {
            href: "/create-post",
            icon: "🎨",
            title: "作品を投稿",
            desc: "イラスト・マンガを共有",
          },
          {
            href: "/commissions",
            icon: "✏️",
            title: "コミッション",
            desc: "イラストを依頼・受注",
          },
          {
            href: "/marketplace",
            icon: "🛍️",
            title: "マーケット",
            desc: "デジタルコンテンツ販売",
          },
          {
            href: "/community",
            icon: "💬",
            title: "コミュニティ",
            desc: "クリエイターと交流",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card hover:shadow-md transition-shadow text-center group"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors text-sm">
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </section>

      {/* Latest Artworks */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">最新の作品</h2>
          <Link
            href="/feed"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <PostCard
              key={i}
              post={{
                ...demoPost,
                id: `demo-${i}`,
                title: `サンプル作品 ${i + 1}`,
              }}
            />
          ))}
        </div>
      </section>

      {/* Popular Tags */}
      <section className="mb-10">
        <h2 className="section-title mb-4">人気のタグ</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "イラスト",
            "オリジナル",
            "ファンアート",
            "漫画",
            "デジタル",
            "水彩",
            "キャラクターデザイン",
            "背景",
            "アニメ",
            "コンセプトアート",
            "落書き",
            "ドット絵",
          ].map((tag) => (
            <Link
              key={tag}
              href={`/feed?tag=${tag}`}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
