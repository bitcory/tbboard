"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import type { UserInfo } from "@/types";

interface HeaderProps {
  user: UserInfo | null;
  viewerCount: number;
  connected: boolean;
  onLogout: () => void;
}

export default function Header({ user, viewerCount, connected, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full sticky top-0 z-50 border-b-[3px] border-[rgb(var(--foreground))] bg-[rgb(var(--background))]">
      <div className="w-full px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-black tracking-tight uppercase">
            TB Board
          </Link>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Status */}
            <div className="flex items-center gap-2 text-sm font-bold">
              <Icon
                icon={connected ? "solar:wi-fi-router-bold" : "solar:wi-fi-router-minimalistic-bold"}
                className={connected ? "text-[rgb(var(--success))]" : "text-[rgb(var(--danger))]"}
                width={18}
              />
              <Icon icon="solar:users-group-rounded-bold" width={18} />
              <span>{viewerCount}</span>
            </div>

            {user ? (
              <>
                <div className="memphis-badge">{user.name}</div>
                <button
                  onClick={onLogout}
                  className="neo-btn gap-1.5 bg-[rgb(var(--content1))] px-3 py-1.5 text-sm"
                >
                  <Icon icon="solar:logout-2-bold" width={16} />
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="neo-btn gap-1.5 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-3 py-1.5 text-sm"
              >
                <Icon icon="solar:login-2-bold" width={16} />
                로그인
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Icon
                icon={connected ? "solar:wi-fi-router-bold" : "solar:wi-fi-router-minimalistic-bold"}
                className={connected ? "text-[rgb(var(--success))]" : "text-[rgb(var(--danger))]"}
                width={16}
              />
              <Icon icon="solar:users-group-rounded-bold" width={16} />
              <span>{viewerCount}</span>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="neo-btn p-1.5 bg-[rgb(var(--content1))]"
            >
              <Icon
                icon={menuOpen ? "solar:close-circle-bold" : "solar:hamburger-menu-bold"}
                width={20}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="border-t-[3px] border-[rgb(var(--foreground))] bg-[rgb(var(--content1))] p-4 md:hidden animate-slide-up">
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-2 py-1 text-sm font-bold">
                  <Icon icon="solar:user-circle-bold" width={18} />
                  {user.name}
                </div>
                <button
                  onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="neo-btn w-full gap-2 bg-[rgb(var(--content1))] px-4 py-2 text-sm"
                >
                  <Icon icon="solar:logout-2-bold" width={16} />
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="neo-btn w-full gap-2 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] px-4 py-2 text-sm"
              >
                <Icon icon="solar:login-2-bold" width={16} />
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
