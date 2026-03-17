import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Server as SocketServer } from "socket.io";

declare global {
  // eslint-disable-next-line no-var
  var __io: SocketServer | undefined;
}

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { author: { select: { id: true, name: true, username: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { content, imageUrl } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        imageUrl: imageUrl || null,
        authorId: user.id,
      },
      include: { author: { select: { id: true, name: true, username: true } } },
    });

    globalThis.__io?.emit("post:created", post);

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
