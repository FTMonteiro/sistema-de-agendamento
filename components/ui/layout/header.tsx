
"use client";

import { Menu } from "lucide-react";

interface HeaderProps {
  onOpenMenu: () => void;
}

export function Header({
  onOpenMenu,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

        {/* Lado esquerdo */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">

          {/* Abre o menu lateral. Acima de lg o menu é fixo, então desaparece. */}
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menu"
            aria-controls="menu-lateral"
            className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 active:scale-95 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
              Dashboard
            </h2>

            <p className="hidden text-xs text-gray-500 sm:block">
              Visão geral do seu negócio
            </p>
          </div>
        </div>

        {/* Lado direito */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Notificações */}
          <button
            type="button"
            aria-label="Notificações"
            className="
              relative
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-gray-500
              transition-all
              duration-200
              hover:bg-gray-100
              hover:text-gray-900
              active:scale-95
            "
          >
            <span className="text-lg">🔔</span>

            {/* Indicador de notificação */}
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* Separador visual */}
          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          {/* Utilizador */}
          <button
            type="button"
            className="
              flex
              items-center
              gap-2
              rounded-xl
              p-1.5
              transition-colors
              hover:bg-gray-50
            "
          >
            {/* Avatar */}
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-600
                text-sm
                font-semibold
                text-white
                shadow-sm
              "
            >
              F
            </div>

            {/* Informações */}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-4 text-gray-900">
                Faustino
              </p>

              <p className="mt-1 text-xs leading-3 text-gray-500">
                Administrador
              </p>
            </div>

            {/* Seta */}
            <span className="hidden text-xs text-gray-400 sm:block">
              ▾
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

