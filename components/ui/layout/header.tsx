"use client";

import { usePathname } from "next/navigation";
import { Menu, Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme/ThemeProvider";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";

interface HeaderProps {
  onOpenMenu: () => void;
}

/*
 * Título e subtítulo da página actual. As chaves acompanham as rotas do menu
 * lateral.
 */
const PAGES: Record<
  string,
  { title: string; subtitle: string }
> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle:
      "Visão geral do seu negócio",
  },
  "/clientes": {
    title: "Clientes",
    subtitle:
      "Gerencie a sua base de clientes",
  },
  "/appointments": {
    title: "Agenda",
    subtitle:
      "Agendamentos e atendimentos",
  },
  "/services": {
    title: "Serviços",
    subtitle:
      "Serviços oferecidos e preços",
  },
  "/equipe": {
    title: "Equipa",
    subtitle:
      "Profissionais do estabelecimento",
  },
  "/configuracoes": {
    title: "Configurações",
    subtitle:
      "Dados do estabelecimento",
  },
};

const FALLBACK = {
  title: "Nevrix",
  subtitle: "Beauty Management",
};

export function Header({
  onOpenMenu,
}: HeaderProps) {
  const pathname = usePathname();

  const { theme, toggleTheme } =
    useTheme();

  /*
   * Correspondência por prefixo, para que sub-rotas (ex.: /clientes/123)
   * continuem a mostrar o título da secção.
   */
  const page =
    PAGES[pathname] ??
    Object.entries(PAGES).find(
      ([href]) =>
        pathname.startsWith(`${href}/`),
    )?.[1] ??
    FALLBACK;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Abre o menu lateral. Acima de lg o menu é fixo, então desaparece. */}
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menu"
            aria-controls="menu-lateral"
            className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] active:scale-95 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-lg">
              {page.title}
            </h2>

            <p className="hidden truncate text-xs text-[var(--muted)] sm:block">
              {page.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* TEMA */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Mudar para modo claro"
                : "Mudar para modo escuro"
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted)] transition-all duration-200 hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] active:scale-95"
          >
            {theme === "dark" ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </button>

          {/* NOTIFICAÇÕES */}
          <NotificationsBell />

          <div className="mx-1 hidden h-8 w-px bg-[var(--border)] sm:block" />

          {/* UTILIZADOR */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-[var(--surface-secondary)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm">
              F
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-4 text-[var(--foreground)]">
                Faustino
              </p>

              <p className="mt-1 text-xs leading-3 text-[var(--muted)]">
                Administrador
              </p>
            </div>

            <span className="hidden text-xs text-[var(--muted)] sm:block">
              ▾
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
