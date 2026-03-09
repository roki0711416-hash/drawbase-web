import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: お気に入り一覧
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          post: {
            include: {
              author: { select: { id: true, name: true, displayName: true, avatarUrl: true } },
              _count: { select: { likes: true, comments: true } },
            },
          },
        },
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: favorites.map((f) => ({
        id: f.id,
        postId: f.postId,
        createdAt: f.createdAt,
        post: f.post,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Fan favorites GET error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST: お気に入り追加
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ success: false, error: "postId は必須です" }, { status: 400 });
    }

    // 既に存在チェック
    const existing = await prisma.favorite.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const favorite = await prisma.favorite.create({
      data: { userId, postId },
    });

    return NextResponse.json({ success: true, data: favorite }, { status: 201 });
  } catch (error) {
    console.error("Fan favorites POST error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: お気に入り解除
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ success: false, error: "postId は必須です" }, { status: 400 });
    }

    await prisma.favorite.deleteMany({
      where: { userId, postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fan favorites DELETE error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
