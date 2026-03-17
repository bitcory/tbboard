"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border-[3px] border-[rgb(var(--foreground))] bg-[rgb(var(--danger))] px-4 py-2.5 text-sm font-bold text-white">
          <Icon icon="solar:danger-triangle-bold" width={18} />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-bold uppercase tracking-wider">
          아이디
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="memphis-input"
          placeholder="아이디를 입력하세요"
          required
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-bold uppercase tracking-wider">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="memphis-input"
          placeholder="비밀번호를 입력하세요"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="neo-btn w-full gap-2 bg-[rgb(var(--primary))] px-4 py-3 text-sm text-[rgb(var(--primary-foreground))]"
      >
        {loading ? (
          <div className="neo-spinner" style={{ width: 18, height: 18, borderTopColor: "rgb(var(--primary-foreground))" }} />
        ) : (
          <Icon icon="solar:login-2-bold" width={18} />
        )}
        {loading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
