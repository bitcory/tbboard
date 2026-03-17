import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { content, imageUrl } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
    }

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "게시물을 찾을 수 없습니다." }, { status: 404 });
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        content: content.trim(),
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
      },
      include: { author: { select: { id: true, name: true, username: true } } },
    });

    globalThis.__io?.emit("post:updated", post);

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "게시물을 찾을 수 없습니다." }, { status: 404 });
    }

    await prisma.post.delete({ where: { id } });

    globalThis.__io?.emit("post:deleted", id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
