
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
  confirmed: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
};

export function AppointmentList({
  appointments,
  onDelete,
}: AppointmentListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

      {/* Cabeçalho */}
      <div className="border-b px-6 py-5">
        <h2 className="text-lg font-semibold">
          Agendamentos
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Próximos atendimentos
        </p>
      </div>

      {/* Lista */}
      <div className="divide-y">

        {appointments.length === 0 ? (
          <div className="px-6 py-10 text-center">

            <p className="font-medium text-gray-900">
              Nenhum agendamento
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Crie um novo agendamento para começar.
            </p>

          </div>
        ) : (
          appointments.map((appointment) => (

            <div
              key={appointment.id}
              className="
                flex
                items-center
                justify-between
                px-6
                py-5
                transition
                hover:bg-gray-50
              "
            >

              {/* Cliente */}
              <div className="flex items-center gap-5">

                {/* Hora */}
                <div className="w-16">
                  <p className="font-semibold">
                    {appointment.time}
                  </p>
                </div>

                {/* Informações */}
                <div>
                  <p className="font-medium text-gray-900">
                    {appointment.client}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {appointment.service}
                    {" • "}
                    {appointment.professional}
                  </p>
                </div>

              </div>

              {/* Informações do lado direito */}
              <div className="flex items-center gap-6">

                {/* Pagamento */}
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Pagamento
                  </p>

                  <p className="text-sm font-medium">
                    {appointment.payment === "paid"
                      ? "Pago"
                      : appointment.payment === "partial"
                      ? "Parcial"
                      : "Pendente"}
                  </p>
                </div>

                {/* Status */}
                <span
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium
                    ${statusStyles[appointment.status]}
                  `}
                >
                  {statusLabels[appointment.status]}
                </span>

                {/* Excluir */}
                <button
                  type="button"
                  onClick={() => onDelete(appointment.id)}
                  className="
                    rounded-lg
                    border
                    border-red-200
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-red-600
                    transition
                    hover:bg-red-50
                  "
                >
                  Excluir
                </button>

              </div>

            </div>

          ))
        )}

      </div>

    </div>
  );
}

