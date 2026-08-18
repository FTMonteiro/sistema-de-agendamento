"use client";

import { useRouter } from "next/navigation";
import { ReceivePayment } from "@/components/appointments/ReceivePayment";

const stats = [
  {
    label: "Clientes",
    value: "120",
    change: "+12%",
    description: "vs. mês anterior",
  },
  {
    label: "Agendamentos",
    value: "25",
    change: "+8%",
    description: "vs. mês anterior",
  },
  {
    label: "Serviços realizados",
    value: "15",
    change: "+5%",
    description: "vs. mês anterior",
  },
  {
    label: "Receita",
    value: "250.000 Kz",
    change: "+15%",
    description: "vs. mês anterior",
  },
];

const appointments = [
  {
    client: "João Silva",
    service: "Corte Premium",
    professional: "Carlos",
    time: "09:00",
    status: "Confirmado",
    statusStyle: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  {
    client: "Maria Santos",
    service: "Barba",
    professional: "Pedro",
    time: "10:30",
    status: "Aguardando",
    statusStyle: "bg-yellow-50 text-yellow-700",
    dot: "bg-yellow-500",
  },
  {
    client: "Pedro Manuel",
    service: "Coloração",
    professional: "Ana",
    time: "14:00",
    status: "Confirmado",
    statusStyle: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  function handleNewAppointment() {
    router.push("/appointments");
  }

  function handleViewAgenda() {
    router.push("/appointments");
  }

  function handleViewDetails() {
    router.push("/appointments");
  }

  return (
    <div className="min-h-full space-y-8">
      {/* =====================================================
          CABEÇALHO
      ====================================================== */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        {/* TÍTULO */}

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

        {/* =================================================
            AÇÕES
        ================================================== */}

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {/* NOVO AGENDAMENTO */}

          <button
            type="button"
            onClick={handleNewAppointment}
            className="
              inline-flex
              w-full
              items-center
              justify-center
              rounded-xl
              bg-gray-900
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-gray-800
              hover:shadow-md
              active:scale-[0.98]
              sm:w-auto
            "
          >
            + Novo Agendamento
          </button>

          {/* RECEBER PAGAMENTO */}

          <ReceivePayment />
        </div>
      </section>

      {/* =====================================================
          ESTATÍSTICAS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="
              rounded-2xl
              bg-white
              p-5
              shadow-sm
              ring-1
              ring-gray-100
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-md
            "
          >
            <div className="flex items-start justify-between gap-4">
              {/* INFORMAÇÃO */}

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {stat.value}
                </h2>
              </div>

              {/* ÍCONE */}

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-blue-50
                  text-blue-600
                "
              >
                <span className="text-sm font-bold">
                  ↗
                </span>
              </div>
            </div>

            {/* CRESCIMENTO */}

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-green-600">
                {stat.change}
              </span>

              <span className="text-xs text-gray-400">
                {stat.description}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* =====================================================
          CONTEÚDO PRINCIPAL
      ====================================================== */}

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* =================================================
            AGENDA DE HOJE
        ================================================== */}

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {/* CABEÇALHO */}

          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-gray-100
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-6
            "
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Agenda de hoje
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Próximos atendimentos do dia
              </p>
            </div>

            {/* VER AGENDA */}

            <button
              type="button"
              onClick={handleViewAgenda}
              className="
                w-full
                rounded-lg
                bg-gray-900
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                transition-colors
                hover:bg-gray-800
                sm:w-auto
              "
            >
              Ver agenda
            </button>
          </div>

          {/* =================================================
              LISTA
          ================================================== */}

          <div className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <div
                key={`${appointment.client}-${appointment.time}`}
                className="
                  flex
                  flex-col
                  gap-4
                  p-5
                  transition-colors
                  hover:bg-gray-50/70
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:p-6
                "
              >
                {/* CLIENTE */}

                <div className="flex min-w-0 items-center gap-4">
                  {/* INDICADOR */}

                  <div
                    className={`
                      h-2.5
                      w-2.5
                      shrink-0
                      rounded-full
                      ${appointment.dot}
                    `}
                  />

                  {/* DADOS */}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {appointment.client}
                    </p>

                    <p className="mt-1 truncate text-sm text-gray-500">
                      {appointment.service}

                      <span className="mx-1.5 text-gray-300">
                        •
                      </span>

                      {appointment.professional}
                    </p>
                  </div>
                </div>

                {/* HORÁRIO + ESTADO */}

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <p className="text-sm font-semibold text-gray-900">
                    {appointment.time}
                  </p>

                  <span
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-medium
                      ${appointment.statusStyle}
                    `}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================
            RESUMO DO DIA
        ================================================== */}

        <div className="rounded-2xl bg-gray-900 p-6 text-white shadow-sm">
          <p className="text-sm font-medium text-gray-400">
            Resumo do dia
          </p>

          <h3 className="mt-3 text-3xl font-bold">
            25
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            agendamentos hoje
          </p>

          {/* SEPARADOR */}

          <div className="my-6 h-px bg-white/10" />

          {/* ESTATÍSTICAS */}

          <div className="space-y-5">
            {/* CONFIRMADOS */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Confirmados
              </span>

              <span className="text-sm font-semibold text-white">
                18
              </span>
            </div>

            {/* AGUARDANDO */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Aguardando
              </span>

              <span className="text-sm font-semibold text-white">
                5
              </span>
            </div>

            {/* CONCLUÍDOS */}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Concluídos
              </span>

              <span className="text-sm font-semibold text-white">
                2
              </span>
            </div>
          </div>

          {/* VER DETALHES */}

          <button
            type="button"
            onClick={handleViewDetails}
            className="
              mt-7
              w-full
              rounded-lg
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-gray-900
              transition-colors
              hover:bg-gray-100
            "
          >
            Ver detalhes
          </button>
        </div>
      </section>
    </div>
  );
}