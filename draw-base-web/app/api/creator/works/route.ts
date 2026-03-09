import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/creator/works — 自分の作品一覧
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  try {
    const [works, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          imageUrls: true,
          tags: true,
          isNsfw: true,
          isPublished: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.post.count({ where: { authorId: userId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: works,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Creator works GET error:", error);
    return NextResponse.json({ success: false, error: "取得に失敗しました" }, { status: 500 });
  }
}

// POST /api/creator/works — 新規作品投稿
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { title, description, imageUrls, tags, isNsfw } = body;

    if (!title || !imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: "タイトルと画像は必須です" },
        { status: 400 }
      );
    }

    const work = await prisma.post.create({
      data: {
        title,
        description: description || null,
        imageUrls: imageUrls || [],
        tags: tags || [],
        isNsfw: isNsfw || false,
        authorId: userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrls: true,
        tags: true,
        isNsfw: true,
        isPublished: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: work }, { status: 201 });
  } catch (error) {
    console.error("Creator works POST error:", error);
    return NextResponse.json({ success: false, error: "投稿に失敗しました" }, { status: 500 });
  }
}
