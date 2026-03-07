import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    currency: string;
    thumbnailUrl?: string | null;
    tags: string[];
    salesCount: number;
    seller: {
      id: string;
      name: string;
      displayName?: string | null;
      avatarUrl?: string | null;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number, currency: string) => {
    if (currency === "JPY") return `¥${price.toLocaleString()}`;
    return `$${(price / 100).toFixed(2)}`;
  };

  return (
    <Link href={`/marketplace/${product.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        {/* Thumbnail */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          )}
          {/* Price Badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2.5 py-1 rounded-lg text-sm font-bold">
            {formatPrice(product.price, product.currency)}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                {product.seller.avatarUrl ? (
                  <img
                    src={product.seller.avatarUrl}
                    alt=""
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <span className="text-[10px] text-primary-700 font-bold">
                    {product.seller.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 truncate">
                {product.seller.displayName || product.seller.name}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {product.salesCount}件販売
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
