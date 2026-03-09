import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: ファンプロフィール取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

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
        role: true,
        createdAt: true,
        _count: {
          select: {
            following: true,
            likes: true,
            purchases: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "ユーザーが見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Fan profile GET error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT: ファンプロフィール更新
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: body.displayName || null,
        bio: body.bio || null,
        avatarUrl: body.avatarUrl || null,
        headerUrl: body.headerUrl || null,
        website: body.website || null,
        twitterHandle: body.twitterHandle || null,
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
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Fan profile PUT error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
