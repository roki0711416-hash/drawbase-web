import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/creator/commissions — 自分のコミッションメニュー一覧
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const menus = await prisma.commissionMenu.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        deliveryDays: true,
        revisionCount: true,
        thumbnailUrl: true,
        isOpen: true,
        maxSlots: true,
        currentSlots: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error("Creator commissions GET error:", error);
    return NextResponse.json({ success: false, error: "取得に失敗しました" }, { status: 500 });
  }
}

// POST /api/creator/commissions — 新規コミッションメニュー作成
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { title, description, price, deliveryDays, revisionCount, thumbnailUrl, maxSlots } = body;

    if (!title || !price) {
      return NextResponse.json(
        { success: false, error: "タイトルと価格は必須です" },
        { status: 400 }
      );
    }

    if (price < 500) {
      return NextResponse.json(
        { success: false, error: "価格は500円以上に設定してください" },
        { status: 400 }
      );
    }

    const menu = await prisma.commissionMenu.create({
      data: {
        title,
        description: description || null,
        price,
        deliveryDays: deliveryDays || 14,
        revisionCount: revisionCount || 1,
        thumbnailUrl: thumbnailUrl || null,
        maxSlots: maxSlots || 3,
        creatorId: userId,
      },
    });

    return NextResponse.json({ success: true, data: menu }, { status: 201 });
  } catch (error) {
    console.error("Creator commissions POST error:", error);
    return NextResponse.json({ success: false, error: "作成に失敗しました" }, { status: 500 });
  }
}

// PUT /api/creator/commissions — コミッションメニュー更新
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { id, title, description, price, deliveryDays, revisionCount, thumbnailUrl, maxSlots, isOpen } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "メニューIDが必要です" }, { status: 400 });
    }

    // 自分のメニューか確認
    const existing = await prisma.commissionMenu.findFirst({
      where: { id, creatorId: userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "メニューが見つかりません" }, { status: 404 });
    }

    const updated = await prisma.commissionMenu.update({
      where: { id },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        price: price ?? undefined,
        deliveryDays: deliveryDays ?? undefined,
        revisionCount: revisionCount ?? undefined,
        thumbnailUrl: thumbnailUrl ?? undefined,
        maxSlots: maxSlots ?? undefined,
        isOpen: isOpen ?? undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Creator commissions PUT error:", error);
    return NextResponse.json({ success: false, error: "更新に失敗しました" }, { status: 500 });
  }
}

// DELETE /api/creator/commissions — コミッションメニュー削除
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "メニューIDが必要です" }, { status: 400 });
    }

    const existing = await prisma.commissionMenu.findFirst({
      where: { id, creatorId: userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "メニューが見つかりません" }, { status: 404 });
    }

    await prisma.commissionMenu.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Creator commissions DELETE error:", error);
    return NextResponse.json({ success: false, error: "削除に失敗しました" }, { status: 500 });
  }
}
