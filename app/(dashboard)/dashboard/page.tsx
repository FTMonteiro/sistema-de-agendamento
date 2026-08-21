"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { ReceivePayment } from "@/components/appointments/ReceivePayment";
import { Appointment } from "@/types/appointment";

interface ServiceRecord {
  id: string;
  name: string;
  price: number | string;
  active?: boolean;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(value);
}

function todayKey() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(
      2,
      "0",
    ),
    String(now.getDate()).padStart(
      2,
      "0",
    ),
  ].join("-");
}

const STATUS_STYLES: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  confirmed: {
    label: "Confirmado",
    badge: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  pending: {
    label: "Aguardando",
    badge: "bg-yellow-50 text-yellow-700",
    dot: "bg-yellow-500",
  },
  completed: {
    label: "Concluído",
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  cancelled: {
    label: "Cancelado",
    badge: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
};

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

  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        appointmentsResponse,
        clientsResponse,
        servicesResponse,
      ] = await Promise.all([
        fetch("/api/appointments", {
          cache: "no-store",
        }),
        fetch("/api/clients", {
          cache: "no-store",
        }),
        fetch("/api/services", {
          cache: "no-store",
        }),
      ]);

      if (
        !appointmentsResponse.ok ||
        !clientsResponse.ok ||
        !servicesResponse.ok
      ) {
        throw new Error(
          "Não foi possível carregar os dados do dashboard.",
        );
      }

      const [
        appointmentsData,
        clientsData,
        servicesData,
      ] = await Promise.all([
        appointmentsResponse.json(),
        clientsResponse.json(),
        servicesResponse.json(),
      ]);

      setAppointments(
        appointmentsData.appointments ??
          [],
      );

      setClientCount(
        Array.isArray(clientsData)
          ? clientsData.length
          : 0,
      );

      setServices(
        Array.isArray(servicesData)
          ? servicesData
          : [],
      );
    } catch (caught) {
      console.error(caught);

      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível carregar os dados.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /*
   * Criar, editar, apagar agendamento ou receber pagamento noutra tela emite
   * este evento — o dashboard tem de refletir sem recarregar a página.
   */
  useEffect(() => {
    window.addEventListener(
      "appointments:changed",
      load,
    );

    return () =>
      window.removeEventListener(
        "appointments:changed",
        load,
      );
  }, [load]);

  /*
   * Métricas derivadas dos agendamentos reais. "Receita" conta apenas o que
   * foi efectivamente pago, para não inflar o número com agendamentos por
   * confirmar.
   */
  const metrics = useMemo(() => {
    const completed =
      appointments.filter(
        (item) =>
          item.status === "completed",
      ).length;

    /*
     * Soma o que foi recebido, nao o preco do servico: quem registou o
     * pagamento pode ter lancado outro valor.
     */
    const revenue =
      appointments.reduce(
        (total, item) =>
          total +
          (Number(item.paidAmount) ||
            0),
        0,
      );

    const paidCount =
      appointments.filter(
        (item) =>
          item.payment === "paid",
      ).length;

    return {
      clients: clientCount,
      appointments: appointments.length,
      completed,
      revenue,
      paidCount,
      activeServices:
        services.filter(
          (service) =>
            service.active !== false,
        ).length,
    };
  }, [
    appointments,
    clientCount,
    services,
  ]);

  const today = todayKey();

  const todayAppointments = useMemo(
    () =>
      appointments
        .filter(
          (item) =>
            item.date === today,
        )
        .sort((a, b) =>
          a.time.localeCompare(b.time),
        ),
    [appointments, today],
  );

  const todaySummary = useMemo(() => {
    const count = (status: string) =>
      todayAppointments.filter(
        (item) =>
          item.status === status,
      ).length;

    return {
      total: todayAppointments.length,
      confirmed: count("confirmed"),
      pending: count("pending"),
      completed: count("completed"),
    };
  }, [todayAppointments]);

  return (
    <div className="min-h-full space-y-8">
      {/* CABEÇALHO */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-600">
            Visão geral
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
            Acompanhe o desempenho do seu negócio e os próximos atendimentos.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() =>
              router.push("/appointments")
            }
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md active:scale-[0.98] sm:w-auto"
          >
            + Novo Agendamento
          </button>

          {/* Recarrega para a receita refletir o pagamento na hora. */}
          <ReceivePayment
            onPaymentCreated={load}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
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

      {/* ESTATÍSTICAS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Clientes"
          value={String(metrics.clients)}
          description="cadastrados"
          loading={loading}
        />

        <StatCard
          label="Agendamentos"
          value={String(
            metrics.appointments,
          )}
          description="no total"
          loading={loading}
        />

        <StatCard
          label="Serviços realizados"
          value={String(
            metrics.completed,
          )}
          description={`${metrics.activeServices} serviços activos`}
          loading={loading}
        />

        <StatCard
          label="Receita recebida"
          value={formatPrice(
            metrics.revenue,
          )}
          description={
            metrics.paidCount === 1
              ? "1 pagamento recebido"
              : `${metrics.paidCount} pagamentos recebidos`
          }
          loading={loading}
        />
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* AGENDA DE HOJE */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Agenda de hoje
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Carregando..."
                  : `${todaySummary.total} atendimento${
                      todaySummary.total ===
                      1
                        ? ""
                        : "s"
                    } para hoje`}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/appointments",
                )
              }
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 sm:w-auto"
            >
              Ver agenda
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Carregando agendamentos...
            </div>
          ) : todayAppointments.length ===
            0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-gray-700">
                Nenhum atendimento hoje
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Os agendamentos de hoje aparecem aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {todayAppointments.map(
                (appointment) => {
                  const style =
                    STATUS_STYLES[
                      appointment.status
                    ] ??
                    STATUS_STYLES.pending;

                  return (
                    <div
                      key={
                        appointment.id
                      }
                      className="flex flex-col gap-4 p-5 transition-colors hover:bg-gray-50/70 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {
                              appointment.client
                            }
                          </p>

                          <p className="mt-1 truncate text-sm text-gray-500">
                            {
                              appointment.service
                            }

                            <span className="mx-1.5 text-gray-300">
                              •
                            </span>

                            {
                              appointment.professional
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className="text-sm font-semibold text-gray-900">
                          {
                            appointment.time
                          }
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>

        {/* RESUMO DO DIA */}
        <div className="rounded-2xl bg-gray-900 p-6 text-white shadow-sm">
          <p className="text-sm font-medium text-gray-400">
            Resumo do dia
          </p>

          <h3 className="mt-3 text-3xl font-bold">
            {loading
              ? "—"
              : todaySummary.total}
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            agendamentos hoje
          </p>

          <div className="my-6 h-px bg-white/10" />

          <div className="space-y-5">
            <SummaryRow
              label="Confirmados"
              value={
                todaySummary.confirmed
              }
              loading={loading}
            />

            <SummaryRow
              label="Aguardando"
              value={
                todaySummary.pending
              }
              loading={loading}
            />

            <SummaryRow
              label="Concluídos"
              value={
                todaySummary.completed
              }
              loading={loading}
            />
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/appointments")
            }
            className="mt-7 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
          >
            Ver detalhes
          </button>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  loading,
}: {
  label: string;
  value: string;
  description: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {loading ? "—" : value}
          </h2>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <span className="text-sm font-bold">
            ↗
          </span>
        </div>
      </div>

      <div className="mt-4">
        <span className="text-xs text-gray-400">
          {description}
        </span>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">
        {label}
      </span>

      <span className="text-sm font-semibold text-white">
        {loading ? "—" : value}
      </span>
    </div>
  );
}
