import Link from "next/link";
import { BookOpen, Users, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* 하단 탭바 */}
      <nav className="border-t bg-background">
        <div className="flex justify-around items-center py-2">
          <NavItem href="/dashboard" icon={<BookOpen size={20} />} label="경조사" />
          <NavItem href="/dashboard/friends" icon={<Users size={20} />} label="지인" />
          <NavItem href="/dashboard/chat" icon={<MessageCircle size={20} />} label="AI 비서" />
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors px-4 py-1"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}
