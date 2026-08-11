"use client";

interface AppointmentHeaderProps {
  onNewAppointment: () => void;
}

export function AppointmentHeader({
  onNewAppointment,
}: AppointmentHeaderProps) {
  return (
    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Agenda
        </h1>

        <p className="mt-2 text-gray-500">
          Gerencie os agendamentos do seu estabelecimento.
        </p>
      </div>

      <button
        type="button"
        onClick={onNewAppointment}
        className="
          rounded-xl
          bg-black
          px-5
          py-3
          text-sm
          font-medium
          text-white
          transition
          hover:bg-gray-800
        "
      >
        + Novo Agendamento
      </button>

    </div>
  );
}