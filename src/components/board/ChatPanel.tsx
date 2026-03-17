"use client";

import { useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { PostWithAuthor, UserInfo } from "@/types";

interface ChatPanelProps {
  posts: PostWithAuthor[];
  user: UserInfo | null;
  onPostClick: (post: PostWithAuthor) => void;
}

function getTimeStr(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "오늘";
  if (d.toDateString() === yesterday.toDateString()) return "어제";
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

export default function ChatPanel({ posts, onPostClick }: ChatPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [posts.length]);

  const sorted = [...posts].reverse();
  let lastDate = "";

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3 sm:px-4"
    >
      {sorted.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[rgb(var(--foreground)/0.4)]">
          <Icon icon="solar:chat-dots-bold" width={40} />
          <span className="text-sm font-bold">아직 게시물이 없습니다</span>
        </div>
      ) : (
        sorted.map((post, idx) => {
          const dateLabel = getDateLabel(post.createdAt);
          const showDate = dateLabel !== lastDate;
          lastDate = dateLabel;

          return (
            <div key={post.id} className="card-enter" style={{ "--card-index": idx } as React.CSSProperties}>
              {showDate && (
                <div className="my-3 flex items-center gap-3">
                  <div className="h-[2px] flex-1 bg-[rgb(var(--foreground)/0.1)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground)/0.4)]">
                    {dateLabel}
                  </span>
                  <div className="h-[2px] flex-1 bg-[rgb(var(--foreground)/0.1)]" />
                </div>
              )}

              <button
                onClick={() => onPostClick(post)}
                className="group flex w-full gap-3 rounded-xl border-2 border-transparent p-2.5 text-left transition-all hover:border-[rgb(var(--foreground))] hover:bg-[rgb(var(--content1))] hover:shadow-[var(--shadow-sm)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[rgb(var(--foreground))] bg-[rgb(var(--content3))] text-xs font-black">
                  {post.author.name[0]}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-baseline gap-2">
                    <span className="text-sm font-bold">{post.author.name}</span>
                    <span className="text-[11px] font-medium text-[rgb(var(--foreground)/0.4)]">
                      {getTimeStr(post.createdAt)}
                    </span>
                  </div>

                  {post.imageUrl && (
                    <div className="mb-1.5 flex items-center gap-1 text-xs font-bold text-[rgb(var(--secondary))]">
                      <Icon icon="solar:gallery-bold" width={14} />
                      이미지 첨부
                    </div>
                  )}

                  <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm text-[rgb(var(--foreground)/0.7)] group-hover:text-[rgb(var(--foreground))]">
                    {post.content}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Icon icon="solar:alt-arrow-right-bold" width={16} className="text-[rgb(var(--foreground)/0.4)]" />
                </div>
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
