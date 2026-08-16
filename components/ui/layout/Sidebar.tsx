"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Scissors,
  UsersRound,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    label: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    label: "Agenda",
    href: "/appointments",
    icon: CalendarDays,
  },
  {
    label: "Serviços",
    href: "/services",
    icon: Scissors,
  },
  {
    label: "Equipa",
    href: "/equipe",
    icon: UsersRound,
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-[var(--foreground)] transition-colors duration-200">

      {/* LOGO */}
      <div className="mb-10 px-3">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          NEVRIX
        </h1>

        <p className="mt-1 text-xs font-medium text-[var(--muted)]">
          Beauty Management
        </p>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.2 : 1.8}
                className="shrink-0 transition-transform duration-200 group-hover:scale-105"
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}