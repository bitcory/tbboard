"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const dragCounterRef = useRef(0);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Keep cardOrder in sync with posts
  useEffect(() => {
    setCardOrder((prev) => {
      const postIds = new Set(posts.map((p) => p.id));
      const existing = prev.filter((id) => postIds.has(id));
      const existingSet = new Set(existing);
      const newIds = posts.map((p) => p.id).filter((id) => !existingSet.has(id));
      return [...newIds, ...existing];
    });
  }, [posts]);

  const orderedPosts = useMemo(() => {
    const postMap = new Map(posts.map((p) => [p.id, p]));
    return cardOrder.map((id) => postMap.get(id)).filter(Boolean) as PostWithAuthor[];
  }, [posts, cardOrder]);

  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    setDragIndex(idx);
    dragCounterRef.current = 0;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex !== null && idx !== dragIndex) {
      setDragOverIndex(idx);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    handleReorder(dragIndex, idx);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // 공용 reorder: ChatPanel과 카드 그리드 양쪽에서 사용
  const handleReorder = useCallback((fromIdx: number, toIdx: number) => {
    setCardOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, []);

  const highlight = useCallback((postId: string) => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightedPostId(postId);
    highlightTimerRef.current = setTimeout(() => setHighlightedPostId(null), 1500);
  }, []);

  // ChatPanel 클릭 → 카드 하이라이트 + 스크롤
  const handleChatPostClick = useCallback((post: PostWithAuthor) => {
    setSelectedPost(post);
    highlight(post.id);
    const cardEl = cardRefs.current.get(post.id);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlight]);

  // 카드 클릭 → 사이드바 하이라이트 + 모달
  const handleCardClick = useCallback((post: PostWithAuthor) => {
    setSelectedPost(post);
    highlight(post.id);
  }, [highlight]);

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
          <ChatPanel posts={orderedPosts} user={user} highlightedPostId={highlightedPostId} onPostClick={handleChatPostClick} onReorder={handleReorder} />

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
                {orderedPosts.map((post, idx) => (
                  <PostCard
                    key={post.id}
                    ref={(el: HTMLButtonElement | null) => {
                      if (el) cardRefs.current.set(post.id, el);
                      else cardRefs.current.delete(post.id);
                    }}
                    post={post}
                    index={idx}
                    isDragging={dragIndex === idx}
                    isDragOver={dragOverIndex === idx}
                    isHighlighted={highlightedPostId === post.id}
                    onDragStart={handleDragStart(idx)}
                    onDragOver={handleDragOver(idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleCardClick(post)}
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
