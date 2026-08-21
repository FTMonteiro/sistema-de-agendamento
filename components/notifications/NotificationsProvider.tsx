"use client";

import {
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  clearAll,
  getServerSnapshot,
  getSnapshot,
  markAllAsRead,
  notify,
  subscribe,
  type AppNotification,
  type NotificationKind,
} from "./notificationsStore";

export type {
  AppNotification,
  NotificationKind,
};

/*
 * O estado vive na store do módulo, não em contexto. O provider fica apenas
 * porque o layout já o monta e para deixar claro onde as notificações entram
 * na árvore — qualquer componente pode chamar useNotifications directamente.
 */
export function NotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

export function useNotifications() {
  const notifications =
    useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot,
    );

  const unreadCount =
    notifications.filter(
      (item) => !item.read,
    ).length;

  return {
    notifications,
    unreadCount,
    notify,
    markAllAsRead,
    clearAll,
  };
}
