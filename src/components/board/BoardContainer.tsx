"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import Header from "@/components/layout/Header";
import ChatPanel from "@/components/board/ChatPanel";
import PostCard from "@/components/board/PostCard";
import PostForm from "@/components/board/PostForm";
import PostDetailModal from "@/components/board/PostDetailModal";
import Toast from "@/components/ui/Toast";
import { showToast } from "@/components/ui/Toast";
import type { PostWithAuthor } from "@/types";

export default function BoardContainer() {
  const { user, loading: authLoading, logout } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"chat" | "board">("chat");

  const handlePostCreated = useCallback((post: PostWithAuthor) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const handlePostUpdated = useCallback((post: PostWithAuthor) => {
    setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    setSelectedPost((prev) => (prev?.id === post.id ? post : prev));
  }, []);

  const handlePostDeleted = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setSelectedPost((prev) => (prev?.id === id ? null : prev));
  }, []);

  const { viewerCount, connected } = useSocket({
    onPostCreated: handlePostCreated,
    onPostUpdated: handlePostUpdated,
    onPostDeleted: handlePostDeleted,
  });

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(() => showToast("게시물을 불러오는데 실패했습니다."));
  }, []);

  const handleSubmit = async (content: string, imageUrl: string | null) => {
    if (editingId) {
      const res = await fetch(`/api/posts/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditContent("");
        setEditImageUrl(null);
      } else {
        const data = await res.json();
        showToast(data.error || "수정에 실패했습니다.");
      }
    } else {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "게시에 실패했습니다.");
      }
    }
  };

  const handleEdit = (id: string, content: string, imageUrl: string | null) => {
    setEditingId(id);
    setEditContent(content);
    setEditImageUrl(imageUrl);
    setMobileTab("chat");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("삭제에 실패했습니다.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditImageUrl(null);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--background))]">
        <div className="neo-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-[rgb(var(--background))]">
      <Header
        user={user}
        viewerCount={viewerCount}
        connected={connected}
        onLogout={logout}
      />

      {/* Mobile Tab Bar */}
      <div className="flex border-b-[3px] border-[rgb(var(--foreground))] md:hidden">
        <button
          onClick={() => setMobileTab("chat")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition-colors ${
            mobileTab === "chat"
              ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]"
              : "bg-[rgb(var(--content1))]"
          }`}
        >
          <Icon icon="solar:chat-round-dots-bold" width={18} />
          대화
        </button>
        <div className="w-[3px] bg-[rgb(var(--foreground))]" />
        <button
          onClick={() => setMobileTab("board")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold transition-colors ${
            mobileTab === "board"
              ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]"
              : "bg-[rgb(var(--content1))]"
          }`}
        >
          <Icon icon="solar:widget-bold" width={18} />
          게시물
        </button>
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Chat Panel */}
        <div
          className={`flex w-full flex-col md:w-[420px] lg:w-[480px] md:border-r-[3px] md:border-[rgb(var(--foreground))] ${
            mobileTab === "chat" ? "flex" : "hidden md:flex"
          }`}
        >
          <ChatPanel posts={posts} user={user} onPostClick={setSelectedPost} />

          {user && (
            <div className="border-t-[3px] border-[rgb(var(--foreground))] bg-[rgb(var(--content1))] p-3">
              <PostForm
                editingId={editingId}
                editContent={editContent}
                editImageUrl={editImageUrl}
                onSubmit={handleSubmit}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          )}
        </div>

        {/* Right: Post Cards Grid */}
        <div
          className={`flex flex-1 flex-col ${
            mobileTab === "board" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="flex-1 overflow-y-auto p-4">
            {posts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-[rgb(var(--foreground)/0.4)]">
                <Icon icon="solar:widget-bold" width={40} />
                <span className="text-sm font-bold">아직 게시물이 없습니다</span>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {posts.map((post, idx) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={idx}
                    onClick={() => setSelectedPost(post)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          user={user}
          onClose={() => setSelectedPost(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Toast />
    </div>
  );
}
