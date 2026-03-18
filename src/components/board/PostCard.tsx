"use client";

import { forwardRef } from "react";
import { Icon } from "@iconify/react";
import type { PostWithAuthor } from "@/types";

interface PostCardProps {
  post: PostWithAuthor;
  onClick: () => void;
  index: number;
  isDragging?: boolean;
  isDragOver?: boolean;
  isHighlighted?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const PostCard = forwardRef<HTMLButtonElement, PostCardProps>(function PostCard(
  { post, onClick, index, isDragging, isDragOver, isHighlighted, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd },
  ref
) {
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <button
      ref={ref}
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`neo-card aspect-square w-full p-3.5 text-left card-enter flex flex-col overflow-hidden cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40 scale-95" : ""} ${isDragOver ? "ring-3 ring-[rgb(var(--primary))] ring-offset-2" : ""} ${isHighlighted ? "ring-3 ring-[rgb(var(--primary))] ring-offset-2 highlight-pulse" : ""}`}
      style={{ "--card-index": index, transition: "opacity 0.15s, transform 0.15s, box-shadow 0.15s" } as React.CSSProperties}
    >
      {post.imageUrl && (
        <div className="mb-2.5 flex-1 min-h-0 overflow-hidden rounded-lg border-2 border-[rgb(var(--foreground))]">
          <img
            src={post.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <p className={`whitespace-pre-wrap break-words text-sm font-medium leading-relaxed ${post.imageUrl ? "line-clamp-2" : "line-clamp-[8] flex-1"}`}>
        {post.content}
      </p>

      <div className="mt-auto pt-2.5 flex items-center gap-2 text-xs font-bold text-[rgb(var(--foreground)/0.5)]">
        <span className="text-[rgb(var(--foreground)/0.8)]">{post.author.name}</span>
        <span>{timeAgo}</span>
        {post.imageUrl && (
          <Icon icon="solar:gallery-bold" width={13} className="ml-auto text-[rgb(var(--secondary))]" />
        )}
      </div>
    </button>
  );
});

export default PostCard;

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}
