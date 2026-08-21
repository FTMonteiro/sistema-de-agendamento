"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bell,
  BellOff,
  CalendarPlus,
  CalendarX2,
  PencilLine,
} from "lucide-react";

import {
  useNotifications,
  type NotificationKind,
} from "./NotificationsProvider";

const ICONS: Record<
  NotificationKind,
  typeof CalendarPlus
> = {
  created: CalendarPlus,
  updated: PencilLine,
  deleted: CalendarX2,
};

const TONES: Record<
  NotificationKind,
  string
> = {
  created:
    "bg-emerald-50 text-emerald-700",
  updated: "bg-blue-50 text-blue-700",
  deleted: "bg-red-50 text-red-700",
};

export function NotificationsBell() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const [open, setOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  /*
   * Fecha ao clicar fora e com Escape — comportamento esperado de um popover.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open]);

  function handleToggle() {
    const next = !open;

    setOpen(next);

    // Abrir é o momento em que as notificações são de facto vistas.
    if (next && unreadCount > 0) {
      markAllAsRead();
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          unreadCount > 0
            ? `Notificações (${unreadCount} não lidas)`
            : "Notificações"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted)] transition-all duration-200 hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] active:scale-95"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-[var(--surface)]">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificações"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Notificações
            </p>

            {notifications.length >
              0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-[var(--muted)] underline transition-colors hover:text-[var(--foreground)]"
              >
                Limpar
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            /* ESTADO VAZIO */
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-secondary)]">
                <BellOff
                  size={22}
                  className="text-[var(--muted)]"
                />
              </div>

              <p className="text-sm font-medium text-[var(--foreground)]">
                Nenhuma notificação
              </p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Quando criar, editar ou apagar um agendamento, aparece aqui.
              </p>
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-[var(--border)] overflow-y-auto">
              {notifications.map(
                (item) => {
                  const Icon =
                    ICONS[item.kind];

                  return (
                    <li
                      key={item.id}
                      className="flex gap-3 px-4 py-3"
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          TONES[item.kind]
                        }`}
                      >
                        <Icon
                          size={16}
                        />
                      </span>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {
                            item.description
                          }
                        </p>

                        <p className="mt-1 text-[11px] text-[var(--muted)]">
                          {formatRelative(
                            item.createdAt,
                          )}
                        </p>
                      </div>
                    </li>
                  );
                },
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function formatRelative(
  isoDate: string,
) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const seconds = Math.round(
    (Date.now() - date.getTime()) / 1000,
  );

  if (seconds < 60) {
    return "agora mesmo";
  }

  const minutes = Math.round(
    seconds / 60,
  );

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `há ${hours} h`;
  }

  return date.toLocaleDateString(
    "pt-PT",
    {
      day: "2-digit",
      month: "short",
    },
  );
}
