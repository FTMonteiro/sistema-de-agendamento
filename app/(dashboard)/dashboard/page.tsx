"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ListChecks,
  Sparkles,
  UsersRound,
  WalletCards,
  XCircle,
} from "lucide-react";

import { ReceivePayment } from "@/components/appointments/ReceivePayment";
import { Appointment } from "@/types/appointment";

/*
|--------------------------------------------------------------------------
| TIPOS
|--------------------------------------------------------------------------
*/

interface ServiceRecord {
  id: string;
  name: string;
  price: number | string;
  active?: boolean;
}

/*
|--------------------------------------------------------------------------
| FORMATADORES
|--------------------------------------------------------------------------
*/

function formatPrice(value: number) {
  const safeValue = Number.isFinite(value)
    ? value
    : 0;

  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeValue);
}

function todayKey() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatToday() {
  return new Intl.DateTimeFormat("pt-AO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

const STATUS_STYLES: Record<
  string,
  {
    label: string;
    badge: string;
    icon: typeof CheckCircle2;
  }
> = {
  confirmed: {
    label: "Confirmado",
    badge:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    icon: CheckCircle2,
  },

  pending: {
    label: "Aguardando",
    badge:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    icon: Clock3,
  },

  completed: {
    label: "Concluído",
    badge:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    icon: CheckCircle2,
  },

  cancelled: {
    label: "Cancelado",
    badge:
      "bg-red-50 text-red-700 ring-1 ring-red-100",
    icon: XCircle,
  },

  no_show: {
    label: "Não compareceu",
    badge:
      "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
    icon: XCircle,
  },
};

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

export default function DashboardPage() {
  const router = useRouter();

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [clientCount, setClientCount] =
    useState(0);

  const [services, setServices] =
    useState<ServiceRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [appointmentsLoading, setAppointmentsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [appointmentsError, setAppointmentsError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | CARREGAR DADOS
  |--------------------------------------------------------------------------
  */

  const load = useCallback(async () => {
    setLoading(true);

    setAppointmentsLoading(true);

    setError("");

    setAppointmentsError("");

    /*
    |--------------------------------------------------------------------------
    | APPOINTMENTS
    |--------------------------------------------------------------------------
    */

    try {
      const response = await fetch(
        "/api/appointments",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        console.error(
          "/api/appointments:",
          {
            status: response.status,
            data,
          },
        );

        throw new Error(
          data?.error ||
            `Erro ao carregar agendamentos (${response.status}).`,
        );
      }

      const list =
        Array.isArray(
          data?.appointments,
        )
          ? data.appointments
          : [];

      setAppointments(list);
    } catch (caught) {
      console.error(
        " Erro ao carregar agendamentos:",
        caught,
      );

      setAppointments([]);

      setAppointmentsError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível carregar os agendamentos.",
      );
    } finally {
      setAppointmentsLoading(false);
    }

    /*
    |--------------------------------------------------------------------------
    | CLIENTES
    |--------------------------------------------------------------------------
    */

    try {
      const response = await fetch(
        "/api/clients",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Erro ao carregar clientes (${response.status}).`,
        );
      }

      if (Array.isArray(data)) {
        setClientCount(data.length);
      } else if (
        Array.isArray(data?.clients)
      ) {
        setClientCount(
          data.clients.length,
        );
      } else {
        setClientCount(0);
      }
    } catch (caught) {
      console.error(
        "Erro ao carregar clientes:",
        caught,
      );

      setClientCount(0);

      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível carregar os clientes.",
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SERVIÇOS
    |--------------------------------------------------------------------------
    */

    try {
      const response = await fetch(
        "/api/services",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Erro ao carregar serviços (${response.status}).`,
        );
      }

      if (Array.isArray(data)) {
        setServices(data);
      } else if (
        Array.isArray(data?.services)
      ) {
        setServices(data.services);
      } else {
        setServices([]);
      }
    } catch (caught) {
      console.error(
        "Erro ao carregar serviços:",
        caught,
      );

      setServices([]);

      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível carregar os serviços.",
      );
    }

    setLoading(false);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | PRIMEIRO CARREGAMENTO
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    void load();
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | ATUALIZAR DEPOIS DE PAGAMENTO
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    function handleAppointmentsChanged() {
      void load();
    }

    window.addEventListener(
      "appointments:changed",
      handleAppointmentsChanged,
    );

    return () => {
      window.removeEventListener(
        "appointments:changed",
        handleAppointmentsChanged,
      );
    };
  }, [load]);

  /*
  |--------------------------------------------------------------------------
  | MÉTRICAS
  |--------------------------------------------------------------------------
  */

  const metrics = useMemo(() => {
    const completed =
      appointments.filter(
        (item) =>
          item.status === "completed",
      ).length;

    const revenue =
      appointments.reduce(
        (total, item) => {
          if (
            item.payment !== "paid"
          ) {
            return total;
          }

          const amount = Number(
            item.paymentAmount ?? 0,
          );

          if (!Number.isFinite(amount)) {
            return total;
          }

          return total + amount;
        },
        0,
      );

    const paidCount =
      appointments.filter(
        (item) =>
          item.payment === "paid",
      ).length;

    const activeServices =
      services.filter(
        (service) =>
          service.active !== false,
      ).length;

    return {
      clients: clientCount,
      appointments:
        appointments.length,
      completed,
      revenue,
      paidCount,
      activeServices,
    };
  }, [
    appointments,
    clientCount,
    services,
  ]);

  /*
  |--------------------------------------------------------------------------
  | HOJE
  |--------------------------------------------------------------------------
  */

  const today = todayKey();

  /*
  |--------------------------------------------------------------------------
  | AGENDA DE HOJE
  |--------------------------------------------------------------------------
  */

  const todayAppointments =
    useMemo(() => {
      return appointments
        .filter(
          (item) =>
            item.date === today,
        )
        .sort((a, b) =>
          a.time.localeCompare(
            b.time,
          ),
        );
    }, [appointments, today]);

  /*
  |--------------------------------------------------------------------------
  | RESUMO
  |--------------------------------------------------------------------------
  */

  const todaySummary =
    useMemo(() => {
      const count = (
        status: string,
      ) =>
        todayAppointments.filter(
          (item) =>
            item.status === status,
        ).length;

      return {
        total:
          todayAppointments.length,

        confirmed:
          count("confirmed"),

        pending:
          count("pending"),

        completed:
          count("completed"),

        cancelled:
          count("cancelled"),
      };
    }, [todayAppointments]);

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-full bg-[#f7f8fa]">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <div className="space-y-7">

          {/* ======================================================
              HERO
          ====================================================== */}

          <section className="relative overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.045)]">

            <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-gray-100 blur-3xl" />

            <div className="pointer-events-none absolute bottom-[-140px] right-32 h-64 w-64 rounded-full bg-gray-50 blur-3xl" />

            <div className="relative flex flex-col gap-7 px-5 py-6 sm:px-7 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:px-9">

              <div className="min-w-0">

                <div className="mb-4 flex items-center gap-2.5">

                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-950 text-white shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Visão geral
                  </span>

                </div>

                <h1 className="text-2xl font-bold tracking-[-0.03em] text-gray-950 sm:text-3xl lg:text-[36px]">
                  Resumo do negócio
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-[15px]">
                  Tudo o que precisa para acompanhar
                  a operação do seu negócio em um só lugar.
                </p>

                <div className="mt-4 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <p className="text-xs font-medium capitalize text-gray-400">
                    {formatToday()}
                  </p>

                </div>

              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:shrink-0">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/appointments",
                    )
                  }
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 sm:w-auto"
                >
                  <CalendarDays className="h-4 w-4" />

                  <span>
                    Novo Agendamento
                  </span>

                  <ArrowUpRight className="h-4 w-4 opacity-50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>

                <ReceivePayment
                  onPaymentCreated={() => {
                    void load();
                  }}
                />

              </div>

            </div>
          </section>

          {/* ======================================================
              ERRO GERAL
          ====================================================== */}

          {error && (
            <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-red-600">
                  <XCircle className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Não foi possível carregar alguns dados.
                  </p>

                  <p className="mt-0.5 text-xs text-red-700">
                    {error}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  void load();
                }}
                className="w-fit rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-800 shadow-sm ring-1 ring-red-200 transition hover:bg-red-50"
              >
                Tentar novamente
              </button>

            </div>
          )}

          {/* ======================================================
              INDICADORES
          ====================================================== */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <MetricCard
              label="Clientes"
              value={String(
                metrics.clients,
              )}
              description="clientes cadastrados"
              icon={
                <UsersRound className="h-5 w-5" />
              }
              loading={loading}
              href="/clientes"
            />

            <MetricCard
              label="Agendamentos"
              value={String(
                metrics.appointments,
              )}
              description="atendimentos registados"
              icon={
                <CalendarDays className="h-5 w-5" />
              }
              loading={loading}
              href="/appointments"
            />

            <MetricCard
              label="Serviços realizados"
              value={String(
                metrics.completed,
              )}
              description={`${metrics.activeServices} serviços ativos`}
              icon={
                <ListChecks className="h-5 w-5" />
              }
              loading={loading}
              href="/services"
            />

            <MetricCard
              label="Receita recebida"
              value={formatPrice(
                metrics.revenue,
              )}
              description={
                metrics.paidCount === 1
                  ? "1 pagamento recebido"
                  : `${metrics.paidCount} pagamentos recebidos`
              }
              icon={
                <WalletCards className="h-5 w-5" />
              }
              loading={loading}
              href="/payments"
              money
            />

          </section>

          {/* ======================================================
              ÁREA PRINCIPAL
          ====================================================== */}

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

            {/* ====================================================
                AGENDA
            ==================================================== */}

            <div className="overflow-hidden rounded-[26px] border border-gray-200/80 bg-white shadow-[0_8px_35px_rgba(15,23,42,0.04)]">

              <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <CalendarDays className="h-4 w-4" />
                  </div>

                  <div>

                    <h2 className="text-base font-semibold tracking-tight text-gray-950">
                      Agenda de hoje
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Próximos atendimentos
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/appointments",
                    )
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950"
                >
                  Ver agenda

                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

              </div>

              {appointmentsLoading ? (
                <AgendaSkeleton />
              ) : appointmentsError ? (
                <AppointmentError
                  error={
                    appointmentsError
                  }
                  onRetry={() => {
                    void load();
                  }}
                />
              ) : todayAppointments.length ===
                0 ? (
                <EmptyAgenda
                  onCreate={() =>
                    router.push(
                      "/appointments",
                    )
                  }
                />
              ) : (
                <div className="divide-y divide-gray-100">

                  {todayAppointments.map(
                    (appointment) => (
                      <AppointmentRow
                        key={
                          appointment.id
                        }
                        appointment={
                          appointment
                        }
                      />
                    ),
                  )}

                </div>
              )}

            </div>

            {/* ====================================================
                RESUMO DO DIA
            ==================================================== */}

            <div className="relative overflow-hidden rounded-[26px] bg-gray-950 text-white shadow-[0_15px_45px_rgba(15,23,42,0.16)]">

              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/[0.045] blur-3xl" />

              <div className="pointer-events-none absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-white/[0.025] blur-3xl" />

              <div className="relative p-6 sm:p-7">

                <div className="flex items-start justify-between">

                  <div>

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                      Hoje
                    </span>

                    <h2 className="mt-2 text-lg font-semibold tracking-tight">
                      Resumo do dia
                    </h2>

                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] text-white/80 ring-1 ring-white/[0.06]">
                    <CalendarDays className="h-4 w-4" />
                  </div>

                </div>

                <div className="mt-9">

                  <p className="text-5xl font-bold tracking-[-0.04em]">
                    {appointmentsLoading
                      ? "—"
                      : todaySummary.total}
                  </p>

                  <p className="mt-2 text-sm text-white/35">
                    atendimentos programados
                  </p>

                </div>

                <div className="my-7 h-px bg-white/10" />

                <div className="space-y-4">

                  <DarkSummaryRow
                    label="Confirmados"
                    value={
                      todaySummary.confirmed
                    }
                    icon={
                      <CheckCircle2 className="h-4 w-4" />
                    }
                    loading={
                      appointmentsLoading
                    }
                  />

                  <DarkSummaryRow
                    label="Aguardando"
                    value={
                      todaySummary.pending
                    }
                    icon={
                      <Clock3 className="h-4 w-4" />
                    }
                    loading={
                      appointmentsLoading
                    }
                  />

                  <DarkSummaryRow
                    label="Concluídos"
                    value={
                      todaySummary.completed
                    }
                    icon={
                      <CheckCircle2 className="h-4 w-4" />
                    }
                    loading={
                      appointmentsLoading
                    }
                  />

                  <DarkSummaryRow
                    label="Cancelados"
                    value={
                      todaySummary.cancelled
                    }
                    icon={
                      <XCircle className="h-4 w-4" />
                    }
                    loading={
                      appointmentsLoading
                    }
                  />

                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/appointments",
                    )
                  }
                  className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-gray-950 transition-all hover:bg-gray-100 active:scale-[0.99]"
                >
                  Abrir agenda

                  <ArrowUpRight className="h-4 w-4" />
                </button>

              </div>
            </div>

          </section>

        </div>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| METRIC CARD
|--------------------------------------------------------------------------
*/

function MetricCard({
  label,
  value,
  description,
  icon,
  loading,
  href,
  money = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
  href: string;
  money?: boolean;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() =>
        router.push(href)
      }
      className="group relative overflow-hidden rounded-[22px] border border-gray-200/80 bg-white p-5 text-left shadow-[0_6px_25px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]"
    >

      <div className="flex items-start justify-between gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition-all duration-200 group-hover:bg-gray-950 group-hover:text-white">
          {icon}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition group-hover:bg-gray-50 group-hover:text-gray-700">
          <ArrowUpRight className="h-4 w-4" />
        </div>

      </div>

      <div className="mt-6">

        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
          {label}
        </p>

        <p
          className={`
            mt-2
            truncate
            font-bold
            tracking-[-0.03em]
            text-gray-950
            ${
              money
                ? "text-xl sm:text-2xl"
                : "text-3xl"
            }
          `}
        >
          {loading
            ? "—"
            : value}
        </p>

        <p className="mt-2 text-xs text-gray-400">
          {description}
        </p>

      </div>

    </button>
  );
}

/*
|--------------------------------------------------------------------------
| APPOINTMENT ERROR
|--------------------------------------------------------------------------
*/

function AppointmentError({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <XCircle className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-sm font-semibold tracking-tight text-gray-900">
        Não foi possível carregar os agendamentos.
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-5 text-gray-400">
        {error}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800"
      >
        Tentar novamente
      </button>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| APPOINTMENT ROW
|--------------------------------------------------------------------------
*/

function AppointmentRow({
  appointment,
}: {
  appointment: Appointment;
}) {
  const style =
    STATUS_STYLES[
      appointment.status
    ] ?? STATUS_STYLES.pending;

  const StatusIcon = style.icon;

  return (
    <div className="group flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-gray-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-7">

      <div className="flex min-w-0 items-center gap-4">

        <div className="flex h-12 w-[68px] shrink-0 flex-col items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100 transition group-hover:bg-white group-hover:shadow-sm">

          <Clock3 className="mb-1 h-3.5 w-3.5 text-gray-400" />

          <span className="text-xs font-bold tracking-tight text-gray-800">
            {appointment.time}
          </span>

        </div>

        <div className="min-w-0">

          <p className="truncate text-sm font-semibold tracking-tight text-gray-950">
            {appointment.client}
          </p>

          <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-gray-400">

            <ListChecks className="h-3.5 w-3.5 shrink-0" />

            <span className="truncate">
              {appointment.service}
            </span>

            <span className="text-gray-300">
              •
            </span>

            <span className="truncate">
              {appointment.professional}
            </span>

          </div>

        </div>

      </div>

      <div className="flex items-center justify-between sm:justify-end">

        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            px-3
            py-1.5
            text-[11px]
            font-semibold
            ${style.badge}
          `}
        >
          <StatusIcon className="h-3.5 w-3.5" />

          {style.label}
        </span>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| DARK SUMMARY ROW
|--------------------------------------------------------------------------
*/

function DarkSummaryRow({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.07] text-white/55">
          {icon}
        </div>

        <span className="text-sm text-white/50">
          {label}
        </span>

      </div>

      <span className="text-sm font-bold text-white">
        {loading
          ? "—"
          : value}
      </span>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| AGENDA VAZIA
|--------------------------------------------------------------------------
*/

function EmptyAgenda({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center px-6 py-12 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <CalendarDays className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-sm font-semibold tracking-tight text-gray-900">
        Agenda livre
      </h3>

      <p className="mt-1.5 max-w-xs text-xs leading-5 text-gray-400">
        Ainda não existem atendimentos
        programados para hoje.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800"
      >
        <CalendarDays className="h-3.5 w-3.5" />

        Criar agendamento

        <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
      </button>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SKELETON
|--------------------------------------------------------------------------
*/

function AgendaSkeleton() {
  return (
    <div className="divide-y divide-gray-100">

      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 px-5 py-5 sm:px-7"
        >

          <div className="h-12 w-[68px] animate-pulse rounded-xl bg-gray-100" />

          <div className="flex-1 space-y-2">

            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />

            <div className="h-3 w-52 animate-pulse rounded bg-gray-100" />

          </div>

          <div className="h-7 w-24 animate-pulse rounded-full bg-gray-100" />

        </div>
      ))}

    </div>
  );
}