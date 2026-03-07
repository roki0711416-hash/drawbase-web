import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api";
import { createPostSchema } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return errorResponse("認証が必要です", 401);

    const body = await req.json();

    // Normalize: accept both imageUrl (singular) and imageUrls (array)
    if (body.imageUrl && !body.imageUrls) {
      body.imageUrls = [body.imageUrl];
    }

    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 422);
    }

    const post = await prisma.post.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        imageUrls: parsed.data.imageUrls,
        tags: parsed.data.tags || [],
        isNsfw: parsed.data.isNsfw || false,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return successResponse(post, 201);
  } catch (error) {
    console.error("Create post error:", error);
    return errorResponse("サーバーエラーが発生しました", 500);
  }
}
