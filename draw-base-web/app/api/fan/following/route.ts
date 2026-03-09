import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: フォロー中クリエイター一覧
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

    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          following: {
            select: {
              id: true,
              name: true,
              displayName: true,
              avatarUrl: true,
              bio: true,
              genres: true,
              commissionOpen: true,
              _count: {
                select: { posts: true, followers: true },
              },
            },
          },
        },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: follows.map((f) => ({
        id: f.id,
        followedAt: f.createdAt,
        creator: f.following,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Fan following GET error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
