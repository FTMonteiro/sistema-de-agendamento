export type NotificationKind =
  | "created"
  | "updated"
  | "deleted";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  /** ISO. Guardado como string para sobreviver ao JSON do localStorage. */
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY =
  "nevrix-notifications";

const MAX_ITEMS = 30;

/*
 * Store fora do React, consumida com useSyncExternalStore. Estar fora permite
 * ler o localStorage sem sincronizar estado num efeito, e dá um snapshot
 * separado para o servidor — onde a lista é sempre vazia — evitando
 * descasamento na hidratação do contador do sino.
 *
 * Sem tabela no banco, as notificações vivem no browser de quem usa: sobrevivem
 * a recargas e à navegação, mas são locais a este dispositivo. Um histórico
 * partilhado exigiria um modelo no Prisma.
 */
let items: AppNotification[] = [];

let hydrated = false;

/* Referência estável: o snapshot do servidor não pode mudar entre chamadas. */
const SERVER_SNAPSHOT: AppNotification[] =
  [];

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function persist() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    );
  } catch {
    // Storage indisponível: mantemos apenas em memória.
  }
}

function readStored(): AppNotification[] {
  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is AppNotification =>
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.kind === "string",
    );
  } catch {
    return [];
  }
}

export function subscribe(
  onStoreChange: () => void,
) {
  /*
   * A primeira subscrição acontece depois da hidratação, e é aí que o conteúdo
   * guardado entra — nunca durante a renderização.
   */
  if (!hydrated) {
    hydrated = true;

    const stored = readStored();

    if (stored.length > 0) {
      items = stored;

      // Fora do ciclo actual, para não avisar durante a renderização.
      queueMicrotask(emit);
    }
  }

  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getSnapshot() {
  return items;
}

export function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function notify(
  input: Omit<
    AppNotification,
    "id" | "createdAt" | "read"
  >,
) {
  const item: AppNotification = {
    ...input,
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    createdAt:
      new Date().toISOString(),
    read: false,
  };

  items = [item, ...items].slice(
    0,
    MAX_ITEMS,
  );

  persist();
  emit();
}

export function markAllAsRead() {
  if (items.every((item) => item.read)) {
    return;
  }

  items = items.map((item) => ({
    ...item,
    read: true,
  }));

  persist();
  emit();
}

export function clearAll() {
  if (items.length === 0) {
    return;
  }

  items = [];

  persist();
  emit();
}