
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UsersRound,
  Settings,
  X,
  ListChecks,
  WalletCards,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId: string;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  ownerOnly?: boolean;
}

const menuItems: MenuItem[] = [
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
    icon: ListChecks,
  },
  {
    label: "Equipa",
    href: "/equipe",
    icon: UsersRound,
    ownerOnly: true,
  },
  {
    label: "Finança",
    href: "/financeiro",
    icon: WalletCards,
    ownerOnly: true,
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

export function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          if (!cancelled) {
            setUser(null);
          }

          return;
        }

        const contentType =
          response.headers.get(
            "content-type",
          );

        if (
          !contentType?.includes(
            "application/json",
          )
        ) {
          throw new Error(
            "A API /api/auth/me não devolveu JSON.",
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Não foi possível carregar o utilizador.",
          );
        }

        if (!cancelled) {
          setUser(data.user ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Erro ao carregar utilizador no Sidebar:",
            error,
          );

          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  const isOwner =
    user?.role?.toUpperCase() === "OWNER";

  const visibleMenuItems =
    menuItems.filter((item) => {
      if (!item.ownerOnly) {
        return true;
      }

      if (loadingUser) {
        return false;
      }

      return isOwner;
    });

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        id="menu-lateral"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* LOGO */}

        <div className="flex h-[92px] shrink-0 items-center justify-between border-b border-[var(--border)] px-6">
          <Link
            href="/dashboard"
            onClick={onClose}
            aria-label="SLOTIX - Home"
            className="flex h-full items-center"
          >
            <div className="relative flex h-12 w-[155px] items-center">
              <Image
                src="/soltex.png"
                alt="SLOTIX"
                width={155}
                height={48}
                priority
                sizes="155px"
                className="h-auto max-h-12 w-auto max-w-full object-contain object-left"
              />
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-xl p-2 text-[var(--muted)] transition-all duration-200 hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] lg:hidden"
          >
            <X
              size={20}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* MENU */}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav
            aria-label="Menu principal"
            className="flex flex-col gap-1.5"
          >
            {visibleMenuItems.map(
              (item) => {
                const Icon = item.icon;

                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`,
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={
                      isActive
                        ? "page"
                        : undefined
                    }
                    className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                      />
                    )}

                    <Icon
                      size={19}
                      strokeWidth={
                        isActive
                          ? 2.2
                          : 1.8
                      }
                      className={`shrink-0 transition-transform duration-200 ${
                        !isActive
                          ? "group-hover:scale-105"
                          : ""
                      }`}
                    />

                    <span>
                      {item.label}
                    </span>
                  </Link>
                );
              },
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}

