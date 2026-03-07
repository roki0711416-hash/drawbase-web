import { z } from "zod";

// ============================================================
// Validation Schemas
// ============================================================

export const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  name: z
    .string()
    .min(2, "名前は2文字以上で入力してください")
    .max(30, "名前は30文字以下で入力してください"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createPostSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(100),
  description: z.string().max(2000).optional(),
  imageUrls: z.array(z.string().url()).min(1, "画像を1枚以上追加してください"),
  tags: z.array(z.string()).max(10).optional(),
  isNsfw: z.boolean().optional(),
});

export const createCommunityPostSchema = z.object({
  content: z.string().min(1, "内容を入力してください").max(5000),
  imageUrls: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const createProductSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  price: z.number().int().min(100, "価格は100円以上に設定してください"),
  currency: z.string().default("JPY"),
  thumbnailUrl: z.string().url().optional(),
  fileUrls: z.array(z.string().url()).min(1),
  tags: z.array(z.string()).max(10).optional(),
});

export const createCommissionMenuSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  price: z.number().int().min(500),
  deliveryDays: z.number().int().min(1).max(365).default(14),
  currency: z.string().default("JPY"),
  thumbnailUrl: z.string().url().optional(),
  maxSlots: z.number().int().min(1).max(20).default(3),
});

export const createCommissionOrderSchema = z.object({
  menuId: z.string(),
  description: z.string().min(10, "依頼内容を10文字以上で入力してください").max(5000),
  referenceUrls: z.array(z.string().url()).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  postId: z.string().optional(),
  communityPostId: z.string().optional(),
  parentId: z.string().optional(),
});

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// Extended Session Types
// ============================================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: "CREATOR" | "FAN" | "BOTH" | null;
      isAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
