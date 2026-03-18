"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { showToast } from "@/components/ui/Toast";

interface PostFormProps {
  editingId: string | null;
  editContent: string;
  editImageUrl: string | null;
  onSubmit: (content: string, imageUrl: string | null) => Promise<void>;
  onCancelEdit: () => void;
}

export default function PostForm({
  editingId,
  editContent,
  editImageUrl,
  onSubmit,
  onCancelEdit,
}: PostFormProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) {
      setContent(editContent);
      setImageUrl(editImageUrl);
      textareaRef.current?.focus();
    }
  }, [editingId, editContent, editImageUrl]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [content]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(content, imageUrl);
      setContent("");
      setImageUrl(null);
    } finally {
      setSubmitting(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      showToast("파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
      } else {
        showToast(data.error || "업로드에 실패했습니다.");
      }
    } catch {
      showToast("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) uploadFile(file);
        return;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (content.trim() && !submitting) {
        handleSubmit(e);
      }
    }
  };

  const handleCancel = () => {
    setContent("");
    setImageUrl(null);
    onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit}>
      {editingId && (
        <div className="mb-2 flex items-center justify-between rounded-lg border-2 border-[rgb(var(--foreground))] bg-[rgb(var(--content4))] px-3 py-1.5 text-xs font-bold">
          <span className="flex items-center gap-1.5">
            <Icon icon="solar:pen-bold" width={14} />
            수정 중...
          </span>
          <button type="button" onClick={handleCancel}>
            <Icon icon="solar:close-circle-bold" width={16} />
          </button>
        </div>
      )}

      {imageUrl && (
        <div className="relative mb-2 inline-block">
          <img src={imageUrl} alt="" className="h-14 rounded-lg border-2 border-[rgb(var(--foreground))] object-cover" />
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            className="absolute -top-1.5 -right-1.5 rounded-full border-2 border-[rgb(var(--foreground))] bg-[rgb(var(--danger))] p-0.5 text-white"
          >
            <Icon icon="solar:close-circle-bold" width={12} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="neo-btn shrink-0 bg-[rgb(var(--content1))] p-2"
        >
          {uploading ? (
            <div className="neo-spinner" style={{ width: 18, height: 18 }} />
          ) : (
            <Icon icon="solar:gallery-add-bold" width={18} />
          )}
        </button>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="메시지를 입력하세요..."
          rows={1}
          className="memphis-input max-h-[120px] min-h-[42px] resize-none !py-2.5"
        />

        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="neo-btn shrink-0 bg-[rgb(var(--primary))] p-2 text-[rgb(var(--primary-foreground))]"
        >
          {submitting ? (
            <div className="neo-spinner" style={{ width: 18, height: 18, borderTopColor: "rgb(var(--primary-foreground))" }} />
          ) : (
            <Icon icon="solar:plain-bold" width={18} />
          )}
        </button>
      </div>
    </form>
  );
}
