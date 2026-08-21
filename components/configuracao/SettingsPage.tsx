"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Building2,
  Users,
  UsersRound,
  Scissors,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

import { BusinessSettings } from "./BusinessSettings";

interface BusinessForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  logo: string;
}

interface BusinessCounts {
  clients: number;
  professionals: number;
  services: number;
  appointments: number;
}

const EMPTY_FORM: BusinessForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  logo: "",
};

export function SettingsPage() {
  const [business, setBusiness] =
    useState<BusinessForm>(EMPTY_FORM);

  /*
   * Guardamos o que veio do banco para saber se há alterações pendentes e
   * para o botão Cancelar poder voltar atrás.
   */
  const [saved, setSaved] =
    useState<BusinessForm>(EMPTY_FORM);

  const [counts, setCounts] =
    useState<BusinessCounts | null>(null);

  const [createdAt, setCreatedAt] =
    useState<string | null>(null);

  const [updatedAt, setUpdatedAt] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/business",
        { cache: "no-store" },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível carregar o estabelecimento.",
        );
      }

      const form: BusinessForm = {
        name: data.name ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        logo: data.logo ?? "",
      };

      setBusiness(form);
      setSaved(form);
      setCounts(data._count ?? null);
      setCreatedAt(
        data.createdAt ?? null,
      );
      setUpdatedAt(
        data.updatedAt ?? null,
      );
    } catch (caught) {
      console.error(caught);

      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível carregar o estabelecimento.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isDirty =
    JSON.stringify(business) !==
    JSON.stringify(saved);

  async function handleSave() {
    if (!business.name.trim()) {
      toast.error(
        "O nome do estabelecimento é obrigatório.",
      );
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        "/api/business",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(business),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível salvar.",
        );
      }

      const form: BusinessForm = {
        name: data.name ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        logo: data.logo ?? "",
      };

      setBusiness(form);
      setSaved(form);
      setUpdatedAt(
        data.updatedAt ?? null,
      );

      toast.success(
        "Alterações salvas.",
      );
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-[var(--muted)]">
          <span>Admin</span>

          <span>›</span>

          <span className="font-medium text-[var(--foreground)]">
            Configurações
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Configurações
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Gerencie as informações do seu estabelecimento.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              {error}
            </p>

            <button
              type="button"
              onClick={load}
              className="mt-2 text-sm font-semibold text-red-900 underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* DADOS CADASTRADOS */}
        {counts && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CountCard
              label="Clientes"
              value={counts.clients}
              icon={
                <Users size={18} />
              }
            />

            <CountCard
              label="Profissionais"
              value={
                counts.professionals
              }
              icon={
                <UsersRound size={18} />
              }
            />

            <CountCard
              label="Serviços"
              value={counts.services}
              icon={
                <Scissors size={18} />
              }
            />

            <CountCard
              label="Agendamentos"
              value={
                counts.appointments
              }
              icon={
                <CalendarDays
                  size={18}
                />
              }
            />
          </div>
        )}

        <div className="mb-8 flex border-b border-[var(--border)]">
          <div className="flex items-center gap-2 border-b-2 border-primary px-5 pb-3 text-sm font-medium text-[var(--foreground)]">
            <Building2 size={17} />
            Dados do estabelecimento
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
            Carregando dados do estabelecimento...
          </div>
        ) : (
          <BusinessSettings
            business={business}
            setBusiness={setBusiness}
          />
        )}

        {/* METADADOS */}
        {(createdAt || updatedAt) && (
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            {createdAt && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Criado em
                </dt>

                <dd className="mt-1">
                  {formatDateTime(
                    createdAt,
                  )}
                </dd>
              </div>
            )}

            {updatedAt && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Última alteração
                </dt>

                <dd className="mt-1">
                  {formatDateTime(
                    updatedAt,
                  )}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* BARRA INFERIOR */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur sm:-mx-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm text-[var(--muted)]">
            {isDirty
              ? "Há alterações não salvas"
              : "Tudo salvo"}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={
                !isDirty || isSaving
              }
              onClick={() =>
                setBusiness(saved)
              }
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={
                loading ||
                isSaving ||
                !isDirty
              }
              onClick={handleSave}
              className="rounded-xl bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-[var(--background)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Salvando..."
                : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CountCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold">
            {value}
          </p>
        </div>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
