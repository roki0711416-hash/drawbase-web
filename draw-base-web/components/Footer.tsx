export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              サービス
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="/" className="hover:text-primary-600">
                  ホーム
                </a>
              </li>
              <li>
                <a href="/marketplace" className="hover:text-primary-600">
                  マーケット
                </a>
              </li>
              <li>
                <a href="/commissions" className="hover:text-primary-600">
                  コミッション
                </a>
              </li>
              <li>
                <a href="/community" className="hover:text-primary-600">
                  コミュニティ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              クリエイター
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="hover:text-primary-600">
                  作品を投稿
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600">
                  コミッションを開く
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600">
                  商品を出品
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              サポート
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="hover:text-primary-600">
                  ヘルプセンター
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600">
                  お問い合わせ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600">
                  ガイドライン
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">法的</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="hover:text-primary-600">
                  利用規約
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-600">
                  特定商取引法
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} DRAW BASE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
