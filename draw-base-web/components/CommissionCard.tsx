import Link from "next/link";

interface CommissionCardProps {
  menu: {
    id: string;
    title: string;
    description?: string | null;
    price: number;
    currency: string;
    thumbnailUrl?: string | null;
    isOpen: boolean;
    maxSlots: number;
    currentSlots: number;
    creator: {
      id: string;
      name: string;
      displayName?: string | null;
      avatarUrl?: string | null;
    };
  };
}

export default function CommissionCard({ menu }: CommissionCardProps) {
  const formatPrice = (price: number, currency: string) => {
    if (currency === "JPY") return `¥${price.toLocaleString()}`;
    return `$${(price / 100).toFixed(2)}`;
  };

  const slotsLeft = menu.maxSlots - menu.currentSlots;

  return (
    <Link href={`/commissions/${menu.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {menu.thumbnailUrl ? (
            <img
              src={menu.thumbnailUrl}
              alt={menu.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
              <svg
                className="w-12 h-12 text-primary-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
          )}
          {/* Status Badge */}
          <div
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              slotsLeft > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {slotsLeft > 0 ? `残り${slotsLeft}枠` : "満員"}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 truncate">{menu.title}</h3>
          {menu.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {menu.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                {menu.creator.avatarUrl ? (
                  <img
                    src={menu.creator.avatarUrl}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <span className="text-[10px] text-primary-700 font-bold">
                    {menu.creator.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">
                {menu.creator.displayName || menu.creator.name}
              </span>
            </div>
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(menu.price, menu.currency)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
