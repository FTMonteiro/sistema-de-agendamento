"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Clock,
  Users,
  UsersRound,
  Scissors,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

import { BusinessSettings } from "./BusinessSettings";
import { BusinessHours, type HoursForm } from "./BusinessHours";

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

const EMPTY_HOURS: HoursForm = {
  openingTime: "",
  closingTime: "",
  workingDays: [1, 2, 3, 4, 5, 6],
  slotInterval: 30,
  rules: "",
};

type Tab = "dados" | "horario";

export function SettingsPage() {
  const [business, setBusiness] = useState<BusinessForm>(EMPTY_FORM);

  const [saved, setSaved] = useState<BusinessForm>(EMPTY_FORM);

  const [hours, setHours] = useState<HoursForm>(EMPTY_HOURS);

  const [savedHours, setSavedHours] = useState<HoursForm>(EMPTY_HOURS);

  const [tab, setTab] = useState<Tab>("dados");

  const [counts, setCounts] = useState<BusinessCounts | null>(null);

  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/business", {
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error("A API /api/business não devolveu JSON.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível carregar o estabelecimento.",
        );
      }

      const form: BusinessForm = {
        name: data.name ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        logo: data.logo ?? "",
      };

      const loadedHours: HoursForm = {
        openingTime: data.openingTime ?? "",
        closingTime: data.closingTime ?? "",
        workingDays: Array.isArray(data.workingDays)
          ? data.workingDays
          : EMPTY_HOURS.workingDays,
        slotInterval: Number(data.slotInterval) || EMPTY_HOURS.slotInterval,
        rules: data.rules ?? "",
      };

      setBusiness(form);
      setSaved(form);

      setHours(loadedHours);
      setSavedHours(loadedHours);

      setCounts(data._count ?? null);

      setCreatedAt(data.createdAt ?? null);

      setUpdatedAt(data.updatedAt ?? null);

      /*Atualiza também o Header quando*/
      window.dispatchEvent(
        new CustomEvent("business-profile-updated", {
          detail: {
            logo: form.logo || null,
            name: form.name,
          },
        }),
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
    JSON.stringify(business) !== JSON.stringify(saved) ||
    JSON.stringify(hours) !== JSON.stringify(savedHours);

  async function handleSave() {
    if (!business.name.trim()) {
      toast.error("O nome do estabelecimento é obrigatório.");

      setTab("dados");

      return;
    }

    if (
      hours.openingTime &&
      hours.closingTime &&
      hours.openingTime >= hours.closingTime
    ) {
      toast.error("A hora de fecho tem de ser depois da hora de abertura.");

      setTab("horario");

      return;
    }

    if (hours.workingDays.length === 0) {
      toast.error("Escolha pelo menos um dia de funcionamento.");

      setTab("horario");

      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/business", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...business,
          ...hours,
        }),
      });

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error("A API /api/business não devolveu JSON.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível salvar.");
      }

      /*DADOS SALVOS */

      const form: BusinessForm = {
        name: data.name ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        logo: data.logo ?? "",
      };

      const savedFormHours: HoursForm = {
        openingTime: data.openingTime ?? "",

        closingTime: data.closingTime ?? "",

        workingDays: Array.isArray(data.workingDays)
          ? data.workingDays
          : EMPTY_HOURS.workingDays,

        slotInterval: Number(data.slotInterval) || EMPTY_HOURS.slotInterval,

        rules: data.rules ?? "",
      };

      /*ATUALIZAR SETTINGS*/

      setBusiness(form);
      setSaved(form);

      setHours(savedFormHours);
      setSavedHours(savedFormHours);

      setUpdatedAt(data.updatedAt ?? null);

      /* ATUALIZAR HEADER IMEDIATAMENTE*/

      window.dispatchEvent(
        new CustomEvent("business-profile-updated", {
          detail: {
            logo: data.logo ?? null,
            name: data.name ?? "",
          },
        }),
      );

      /*SUCESSO*/

      toast.success("Alterações salvas.");
    } catch (caught) {
      console.error("Erro ao salvar configurações:", caught);

      toast.error(
        caught instanceof Error ? caught.message : "Não foi possível salvar.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl">
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
            <p className="text-sm text-red-800">{error}</p>

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
              icon={<Users size={18} />}
            />

            <CountCard
              label="Profissionais"
              value={counts.professionals}
              icon={<UsersRound size={18} />}
            />

            <CountCard
              label="Serviços"
              value={counts.services}
              icon={<Scissors size={18} />}
            />

            <CountCard
              label="Agendamentos"
              value={counts.appointments}
              icon={<CalendarDays size={18} />}
            />
          </div>
        )}

        <div className="mb-8 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
          <TabButton
            active={tab === "dados"}
            onClick={() => setTab("dados")}
            icon={<Building2 size={17} />}
            label="Dados do estabelecimento"
          />

          <TabButton
            active={tab === "horario"}
            onClick={() => setTab("horario")}
            icon={<Clock size={17} />}
            label="Horário e regras"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
            Carregando dados do estabelecimento...
          </div>
        ) : tab === "dados" ? (
          <BusinessSettings business={business} setBusiness={setBusiness} />
        ) : (
          <BusinessHours hours={hours} setHours={setHours} />
        )}

        {/* METADADOS */}

        {(createdAt || updatedAt) && (
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            {createdAt && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Criado em
                </dt>

                <dd className="mt-1">{formatDateTime(createdAt)}</dd>
              </div>
            )}

            {updatedAt && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Última alteração
                </dt>

                <dd className="mt-1">{formatDateTime(updatedAt)}</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* BARRA INFERIOR */}

      <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur sm:-mx-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-sm text-[var(--muted)]">
            {isDirty ? "Há alterações não salvas" : "Tudo salvo"}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!isDirty || isSaving}
              onClick={() => {
                setBusiness(saved);
                setHours(savedHours);
              }}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={loading || isSaving || !isDirty}
              onClick={handleSave}
              className="rounded-xl bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-[var(--background)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-5 pb-3 text-sm font-medium transition ${
        active
          ? "border-primary text-[var(--foreground)]"
          : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      {icon}
      {label}
    </button>
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
          <p className="text-sm text-[var(--muted)]">{label}</p>

          <p className="mt-2 text-2xl font-bold">{value}</p>
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
