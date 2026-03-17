"use client";

import { Icon } from "@iconify/react";
import type { PostWithAuthor } from "@/types";

interface PostCardProps {
  post: PostWithAuthor;
  onClick: () => void;
  index: number;
}

export default function PostCard({ post, onClick, index }: PostCardProps) {
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <button
      onClick={onClick}
      className="neo-card w-full p-3.5 text-left card-enter"
      style={{ "--card-index": index } as React.CSSProperties}
    >
      {post.imageUrl && (
        <div className="mb-2.5 overflow-hidden rounded-lg border-2 border-[rgb(var(--foreground))]">
          <img
            src={post.imageUrl}
            alt=""
            className="w-full object-cover"
            style={{ maxHeight: 140 }}
          />
        </div>
      )}

      <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed">
        {post.content}
      </p>

      <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-[rgb(var(--foreground)/0.5)]">
        <span className="text-[rgb(var(--foreground)/0.8)]">{post.author.name}</span>
        <span>{timeAgo}</span>
        {post.imageUrl && (
          <Icon icon="solar:gallery-bold" width={13} className="ml-auto text-[rgb(var(--secondary))]" />
        )}
      </div>
    </button>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
