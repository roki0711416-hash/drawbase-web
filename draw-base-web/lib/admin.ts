import { getAuthUser, errorResponse } from "@/lib/api";

/**
 * Admin ガード — 管理者ユーザーのみ通過させる。
 * 未認証 or 非Adminの場合はエラーレスポンスを返す。
 *
 * Usage:
 * ```ts
 * const admin = await requireAdmin();
 * if (admin instanceof Response) return admin; // 非Admin
 * // admin = { id, email, name, role, isAdmin }
 * ```
 */
export async function requireAdmin() {
  const user = await getAuthUser();

  if (!user) {
    return errorResponse("認証が必要です", 401);
  }

  if (!user.isAdmin) {
    return errorResponse("管理者権限が必要です", 403);
  }

  return user;
}
