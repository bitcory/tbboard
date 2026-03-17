"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { showToast } from "@/components/ui/Toast";
import type { PostWithAuthor, UserInfo } from "@/types";

interface PostDetailModalProps {
  post: PostWithAuthor;
  user: UserInfo | null;
  onClose: () => void;
  onEdit: (id: string, content: string, imageUrl: string | null) => void;
  onDelete: (id: string) => void;
}

export default function PostDetailModal({
  post,
  user,
  onClose,
  onEdit,
  onDelete,
}: PostDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopied(true);
      showToast("클립보드에 복사되었습니다!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("복사에 실패했습니다.");
    }
  };

  const handleEdit = () => {
    onEdit(post.id, post.content, post.imageUrl);
    onClose();
  };

  const handleDelete = () => {
    onDelete(post.id);
    onClose();
  };

  const date = new Date(post.createdAt);
  const dateStr = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[rgb(var(--foreground)/0.4)]" />

      {/* Modal */}
      <div
        className="relative flex max-h-[90vh] w-full flex-col overflow-hidden border-[3px] border-[rgb(var(--foreground))] bg-[rgb(var(--content1))] shadow-[var(--shadow-lg)] sm:max-w-lg sm:rounded-xl animate-scale-in rounded-t-xl sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-[3px] border-[rgb(var(--foreground))] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[rgb(var(--foreground))] bg-[rgb(var(--content3))] text-sm font-black">
              {post.author.name[0]}
            </div>
            <div>
              <div className="text-sm font-bold">{post.author.name}</div>
              <div className="text-xs font-medium text-[rgb(var(--foreground)/0.5)]">{dateStr}</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {user && (
              <>
                <button
                  onClick={handleEdit}
                  className="rounded-lg p-2 transition-colors hover:bg-[rgb(var(--content2))]"
                  title="수정"
                >
                  <Icon icon="solar:pen-bold" width={18} />
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg p-2 text-[rgb(var(--danger))] transition-colors hover:bg-[rgb(var(--content2))]"
                  title="삭제"
                >
                  <Icon icon="solar:trash-bin-trash-bold" width={18} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-[rgb(var(--content2))]"
            >
              <Icon icon="solar:close-circle-bold" width={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {post.imageUrl && (
            <div className="mb-4 overflow-hidden rounded-xl border-2 border-[rgb(var(--foreground))]">
              <img
                src={post.imageUrl}
                alt=""
                className="w-full object-contain"
                style={{ maxHeight: 300 }}
              />
            </div>
          )}
          <pre className="whitespace-pre-wrap break-words font-[inherit] text-[15px] font-medium leading-relaxed">
            {post.content}
          </pre>
        </div>

        {/* Footer */}
        <div className="border-t-[3px] border-[rgb(var(--foreground))] p-4 flex gap-2">
          <button
            onClick={handleCopy}
            className={`neo-btn flex-1 gap-2 bg-[rgb(var(--primary))] px-4 py-2.5 text-sm text-[rgb(var(--primary-foreground))]`}
          >
            {copied ? (
              <>
                <Icon icon="solar:check-circle-bold" width={18} />
                복사 완료!
              </>
            ) : (
              <>
                <Icon icon="solar:copy-bold" width={18} />
                내용 복사
              </>
            )}
          </button>
          {post.imageUrl && (
            <a
              href={post.imageUrl}
              download
              className="neo-btn gap-2 bg-[rgb(var(--content3))] px-4 py-2.5 text-sm"
            >
              <Icon icon="solar:download-bold" width={18} />
              이미지 저장
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
