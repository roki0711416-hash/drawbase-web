import FanSidebar from "@/components/FanSidebar";

export default function FanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <FanSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
