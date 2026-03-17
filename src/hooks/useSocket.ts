"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import type { PostWithAuthor } from "@/types";

interface UseSocketOptions {
  onPostCreated?: (post: PostWithAuthor) => void;
  onPostUpdated?: (post: PostWithAuthor) => void;
  onPostDeleted?: (id: string) => void;
}

export function useSocket(options: UseSocketOptions) {
  const [viewerCount, setViewerCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("viewers:count", (count: number) => setViewerCount(count));

    socket.on("post:created", (post: PostWithAuthor) => {
      optionsRef.current.onPostCreated?.(post);
    });

    socket.on("post:updated", (post: PostWithAuthor) => {
      optionsRef.current.onPostUpdated?.(post);
    });

    socket.on("post:deleted", (id: string) => {
      optionsRef.current.onPostDeleted?.(id);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("viewers:count");
      socket.off("post:created");
      socket.off("post:updated");
      socket.off("post:deleted");
    };
  }, []);

  return { viewerCount, connected };
}
