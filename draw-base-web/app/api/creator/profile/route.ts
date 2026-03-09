import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/creator/profile — 自分のクリエイタープロフィール取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        headerUrl: true,
        website: true,
        twitterHandle: true,
        instagramHandle: true,
        pixivUrl: true,
        genres: true,
        commissionOpen: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "ユーザーが見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Creator profile GET error:", error);
    return NextResponse.json({ success: false, error: "取得に失敗しました" }, { status: 500 });
  }
}

// PUT /api/creator/profile — クリエイタープロフィール更新
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const {
      displayName,
      bio,
      avatarUrl,
      headerUrl,
      website,
      twitterHandle,
      instagramHandle,
      pixivUrl,
      genres,
      commissionOpen,
    } = body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: displayName ?? undefined,
        bio: bio ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
        headerUrl: headerUrl ?? undefined,
        website: website ?? undefined,
        twitterHandle: twitterHandle ?? undefined,
        instagramHandle: instagramHandle ?? undefined,
        pixivUrl: pixivUrl ?? undefined,
        genres: genres ?? undefined,
        commissionOpen: commissionOpen ?? undefined,
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        headerUrl: true,
        website: true,
        twitterHandle: true,
        instagramHandle: true,
        pixivUrl: true,
        genres: true,
        commissionOpen: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Creator profile PUT error:", error);
    return NextResponse.json({ success: false, error: "更新に失敗しました" }, { status: 500 });
  }
}
