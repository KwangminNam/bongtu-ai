"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { logClick } from "@/lib/logging/logger";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" || pathname.startsWith("/dashboard/events")
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>

      {/* 하단 탭바 */}
      <nav className="shrink-0 border-t bg-background/95 backdrop-blur-sm z-50">
        <div className="flex justify-around items-center py-2">
          <NavItem
            href="/dashboard"
            icon={<BookOpen size={20} />}
            label="경조사"
            active={isActive("/dashboard")}
            onClick={() => logClick(pathname, "nav_tab", { tab: "경조사" })}
          />
          <NavItem
            href="/dashboard/friends"
            icon={<Users size={20} />}
            label="지인"
            active={isActive("/dashboard/friends")}
            onClick={() => logClick(pathname, "nav_tab", { tab: "지인" })}
          />
          <NavItem
            href="/dashboard/chat"
            icon={<MessageCircle size={20} />}
            label="AI 비서"
            active={isActive("/dashboard/chat")}
            onClick={() => logClick(pathname, "nav_tab", { tab: "AI 비서" })}
          />

          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors px-4 py-1 ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
