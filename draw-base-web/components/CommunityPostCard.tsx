import Link from "next/link";

interface CommunityPostCardProps {
  post: {
    id: string;
    content: string;
    imageUrls: string[];
    tags: string[];
    author: {
      id: string;
      name: string;
      displayName?: string | null;
      avatarUrl?: string | null;
    };
    _count: {
      likes: number;
      comments: number;
    };
    createdAt: string;
  };
}

export default function CommunityPostCard({ post }: CommunityPostCardProps) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}分前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}時間前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}日前`;
    return new Date(dateStr).toLocaleDateString("ja-JP");
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Author */}
      <div className="flex items-center gap-3">
        <Link href={`/users/${post.author.id}`}>
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt=""
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-sm text-primary-700 font-bold">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </Link>
        <div>
          <Link
            href={`/users/${post.author.id}`}
            className="text-sm font-medium text-gray-900 hover:text-primary-600"
          >
            {post.author.displayName || post.author.name}
          </Link>
          <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap line-clamp-5">
        {post.content}
      </p>

      {/* Images */}
      {post.imageUrls.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {post.imageUrls.slice(0, 4).map((url, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4 pt-3 border-t border-gray-100">
        <button className="flex items-center gap-1.5 text-gray-400 hover:text-accent-500 transition-colors text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {post._count.likes}
        </button>
        <button className="flex items-center gap-1.5 text-gray-400 hover:text-primary-500 transition-colors text-sm">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {post._count.comments}
        </button>
      </div>
    </div>
  );
}
