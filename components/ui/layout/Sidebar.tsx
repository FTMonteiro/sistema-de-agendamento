"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Scissors,
  UsersRound,
  Settings,
  X,
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

interface SidebarProps {
  /** Só tem efeito abaixo de lg, onde o menu é um drawer. */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  /*
   * Escape fecha, e enquanto o drawer está aberto a página por baixo não
   * rola. Ambos só valem quando o drawer está de facto aberto.
   */
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

  return (
    <>
      {/* Fundo escuro do drawer. Existe apenas abaixo de lg e apenas aberto. */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        id="menu-lateral"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-[var(--foreground)] transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-start justify-between px-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              NEVRIX
            </h1>

            <p className="mt-1 text-xs font-medium text-[var(--muted)]">
              Beauty Management
            </p>
          </div>

          {/* Fechar: só no drawer. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="-mr-1 rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href;

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
                className={`sidebar-link relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
                }`}
              >
                {/* Indicador do item activo. Não anima — não é o ícone. */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                  />
                )}

                {/* A animação vive aqui: ver .sidebar-icon em globals.css. */}
                <Icon
                  size={19}
                  strokeWidth={
                    isActive ? 2.2 : 1.8
                  }
                  className="sidebar-icon shrink-0"
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
