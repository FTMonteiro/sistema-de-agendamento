
import { Appointment } from "@/types/appointment";

interface AppointmentListProps {
  appointments: Appointment[];
  onDelete: (id: string) => void;
}

const statusLabels = {
  confirmed: "Confirmado",
  pending: "Aguardando",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusStyles = {
  confirmed:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10",

  pending:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10",

  completed:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10",

  cancelled:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getPaymentLabel(payment: Appointment["payment"]) {
  switch (payment) {
    case "paid":
      return "Pago";

    case "partial":
      return "Parcial";

    default:
      return "Pendente";
  }
}

function getPaymentStyle(payment: Appointment["payment"]) {
  switch (payment) {
    case "paid":
      return "text-emerald-600";

    case "partial":
      return "text-amber-600";

    default:
      return "text-gray-600";
  }
}

export function AppointmentList({
  appointments,
  onDelete,
}: AppointmentListProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            Agendamentos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Próximos atendimentos do estabelecimento
          </p>
        </div>

        <div className="inline-flex w-fit items-center rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          <span className="font-medium text-gray-900">
            {appointments.length}
          </span>

          <span className="ml-1">
            {appointments.length === 1
              ? "agendamento"
              : "agendamentos"}
          </span>
        </div>

      </div>

      {/* Lista */}
      <div className="divide-y divide-gray-100">

        {appointments.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                />
              </svg>
            </div>

            <p className="font-medium text-gray-900">
              Nenhum agendamento encontrado
            </p>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Crie um novo agendamento para começar a organizar
              os atendimentos.
            </p>

          </div>
        ) : (
          appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="
                group
                px-5
                py-5
                transition-colors
                duration-200
                hover:bg-gray-50/70
                sm:px-6
              "
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                {/* Informações principais */}
                <div className="flex min-w-0 items-center gap-4">

                  {/* Hora */}
                  <div className="hidden w-16 shrink-0 sm:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {appointment.time}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Horário
                    </p>
                  </div>

                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-700">
                    {getInitials(appointment.client)}
                  </div>

                  {/* Cliente */}
                  <div className="min-w-0">

                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-gray-900">
                        {appointment.client}
                      </p>

                      <span
                        className={`
                          hidden
                          rounded-full
                          px-2.5
                          py-1
                          text-[11px]
                          font-medium
                          sm:inline-flex
                          ${statusStyles[appointment.status]}
                        `}
                      >
                        {statusLabels[appointment.status]}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-sm text-gray-500">
                      {appointment.service}
                      <span className="mx-1.5 text-gray-300">
                        •
                      </span>
                      {appointment.professional}
                    </p>

                    <div className="mt-2 flex items-center gap-2 sm:hidden">
                      <span className="text-xs font-medium text-gray-500">
                        {appointment.time}
                      </span>

                      <span
                        className={`
                          rounded-full
                          px-2.5
                          py-1
                          text-[11px]
                          font-medium
                          ${statusStyles[appointment.status]}
                        `}
                      >
                        {statusLabels[appointment.status]}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Informações secundárias */}
                <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:gap-6 lg:border-0 lg:pt-0">

                  {/* Pagamento */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Pagamento
                    </p>

                    <p
                      className={`
                        mt-1
                        text-sm
                        font-semibold
                        ${getPaymentStyle(
                          appointment.payment
                        )}
                      `}
                    >
                      {getPaymentLabel(
                        appointment.payment
                      )}
                    </p>
                  </div>

                  {/* Ações */}
                  <button
                    type="button"
                    onClick={() =>
                      onDelete(appointment.id)
                    }
                    className="
                      rounded-lg
                      border
                      border-gray-200
                      bg-white
                      px-3
                      py-2
                      text-sm
                      font-medium
                      text-gray-500
                      opacity-100
                      transition-all
                      duration-200
                      hover:border-red-200
                      hover:bg-red-50
                      hover:text-red-600
                      lg:opacity-0
                      lg:group-hover:opacity-100
                    "
                  >
                    Excluir
                  </button>

                </div>

              </div>

            </article>
          ))
        )}

      </div>
    </section>
  );
}

