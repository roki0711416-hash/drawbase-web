import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return errorResponse("ファイルが選択されていません", 422);
    }

    if (files.length > 10) {
      return errorResponse("一度にアップロードできるのは10枚までです", 422);
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return errorResponse(
          `非対応のファイル形式です: ${file.type}。JPEG, PNG, WebP, GIF, AVIF のみ対応しています`,
          422
        );
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(
          `ファイルサイズが大きすぎます（最大10MB）: ${file.name}`,
          422
        );
      }

      // Generate unique filename
      const ext = file.name.split(".").pop() || "png";
      const uniqueName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, uniqueName);

      // Write file
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      uploadedUrls.push(`/uploads/${uniqueName}`);
    }

    return successResponse({ urls: uploadedUrls }, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("アップロードに失敗しました", 500);
  }
}
