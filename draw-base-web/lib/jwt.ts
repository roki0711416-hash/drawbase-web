import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-change-me";
const JWT_EXPIRES_IN = "30d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string | null;
}

/** JWT トークンを生成 */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** JWT トークンを検証してペイロードを返す */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

/** Authorization ヘッダーから Bearer トークンを抽出 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

/** リクエストから認証済みユーザーを取得（iOS トークン用） */
export function getTokenUser(request: NextRequest): JWTPayload | null {
  const token = extractBearerToken(request);
  if (!token) return null;
  return verifyToken(token);
}
