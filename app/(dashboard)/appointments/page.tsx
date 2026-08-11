
"use client";

import { useState } from "react";
import { AppointmentList } from "@/components/scheduling/AppointmentList";
import { appointments as initialAppointments } from "@/data/appointments";

type Filter =
  | "all"
  | "confirmed"
  | "pending"
  | "completed";

export default function AppointmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [appointments, setAppointments] = useState(
    initialAppointments
  );

  const [activeFilter, setActiveFilter] =
    useState<Filter>("all");

  const [search, setSearch] = useState("");

  const [client, setClient] = useState("");
  const [service, setService] = useState("");
  const [professional, setProfessional] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  /*
   * =====================================================
   * FILTROS
   * =====================================================
   */

  const filteredAppointments = appointments.filter(
    (appointment) => {
      const matchesFilter =
        activeFilter === "all" ||
        appointment.status === activeFilter;

      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        appointment.client
          .toLowerCase()
          .includes(searchText) ||
        appointment.service
          .toLowerCase()
          .includes(searchText) ||
        appointment.professional
          .toLowerCase()
          .includes(searchText);

      return matchesFilter && matchesSearch;
    }
  );

  /*
   * =====================================================
   * CRIAR AGENDAMENTO
   * =====================================================
   */

  function handleCreateAppointment() {
    if (
      !client.trim() ||
      !service.trim() ||
      !professional.trim() ||
      !date ||
      !time
    ) {
      return;
    }

    const newAppointment = {
      id: Date.now().toString(),
      client: client.trim(),
      service: service.trim(),
      professional: professional.trim(),
      date,
      time,
      payment: "pending" as const,
      status: "pending" as const,
      notes: notes.trim(),
    };

    setAppointments((current) => [
      ...current,
      newAppointment,
    ]);

    setClient("");
    setService("");
    setProfessional("");
    setDate("");
    setTime("");
    setNotes("");

    setIsModalOpen(false);
  }

  /*
   * =====================================================
   * EXCLUIR
   * =====================================================
   */

  function handleDeleteAppointment(id: string) {
    setAppointments((current) =>
      current.filter(
        (appointment) =>
          appointment.id !== id
      )
    );
  }

  /*
   * =====================================================
   * CONTADORES
   * =====================================================
   */

  const confirmedCount = appointments.filter(
    (appointment) =>
      appointment.status === "confirmed"
  ).length;

  const pendingCount = appointments.filter(
    (appointment) =>
      appointment.status === "pending"
  ).length;

  const completedCount = appointments.filter(
    (appointment) =>
      appointment.status === "completed"
  ).length;

  /*
   * =====================================================
   * FILTROS
   * =====================================================
   */

  const filters: {
    value: Filter;
    label: string;
    count: number;
  }[] = [
    {
      value: "all",
      label: "Todos",
      count: appointments.length,
    },
    {
      value: "confirmed",
      label: "Confirmados",
      count: confirmedCount,
    },
    {
      value: "pending",
      label: "Aguardando",
      count: pendingCount,
    },
    {
      value: "completed",
      label: "Concluídos",
      count: completedCount,
    },
  ];

  return (
    <div className="min-h-full space-y-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <section
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />

            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Gestão
            </span>
          </div>

          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-gray-950
              sm:text-4xl
            "
          >
            Agenda
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Organize os seus atendimentos, acompanhe
            os profissionais e mantenha a agenda
            sempre sob controlo.
          </p>
        </div>

        <div className="flex w-full gap-3 sm:w-auto">

          <button
            type="button"
            className="
              flex-1
              rounded-xl
              border
              border-gray-200
              bg-white
              px-5
              py-3
              text-sm
              font-semibold
              text-gray-700
              shadow-sm
              transition-all
              hover:border-gray-300
              hover:bg-gray-50
              hover:shadow-md
              active:scale-[0.98]
              sm:flex-none
            "
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={() =>
              setIsModalOpen(true)
            }
            className="
              flex-1
              rounded-xl
              bg-gray-950
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              hover:bg-gray-800
              hover:shadow-md
              active:scale-[0.98]
              sm:flex-none
            "
          >
            + Novo Agendamento
          </button>

        </div>
      </section>

      {/* =================================================
          MÉTRICAS
      ================================================= */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        {/* Total */}

        <div
          className="
            group
            rounded-2xl
            border
            border-gray-100
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total hoje
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
                {appointments.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-700">
              A
            </div>

          </div>

          <p className="mt-4 text-xs text-gray-400">
            Agendamentos registados
          </p>
        </div>

        {/* Confirmados */}

        <div
          className="
            group
            rounded-2xl
            border
            border-gray-100
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Confirmados
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
                {confirmedCount}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-sm font-bold text-green-600">
              ✓
            </div>

          </div>

          <p className="mt-4 text-xs text-green-600">
            Atendimento confirmado
          </p>
        </div>

        {/* Aguardando */}

        <div
          className="
            group
            rounded-2xl
            border
            border-gray-100
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Aguardando
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
                {pendingCount}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-sm font-bold text-amber-600">
              !
            </div>

          </div>

          <p className="mt-4 text-xs text-amber-600">
            Aguardam confirmação
          </p>
        </div>

        {/* Concluídos */}

        <div
          className="
            group
            rounded-2xl
            border
            border-gray-100
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Concluídos
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
                {completedCount}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
              ✓
            </div>

          </div>

          <p className="mt-4 text-xs text-blue-600">
            Atendimentos concluídos
          </p>
        </div>

      </section>

      {/* =================================================
          FILTROS + PESQUISA
      ================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-gray-100
          bg-white
          p-4
          shadow-sm
          sm:p-5
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >

          {/* Filtros */}

          <div className="flex flex-wrap gap-2">

            {filters.map((filter) => {
              const active =
                activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter.value
                    )
                  }
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    px-3.5
                    py-2.5
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    active:scale-[0.97]

                    ${
                      active
                        ? "bg-gray-950 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                    }
                  `}
                >
                  {filter.label}

                  <span
                    className={`
                      rounded-full
                      px-1.5
                      py-0.5
                      text-[11px]
                      font-semibold

                      ${
                        active
                          ? "bg-white/15 text-white"
                          : "bg-gray-100 text-gray-500"
                      }
                    `}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}

          </div>

          {/* Pesquisa */}

          <div className="relative w-full xl:max-w-sm">

            <span
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            >
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Pesquisar cliente, serviço..."
              className="
                w-full
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                py-3
                pl-10
                pr-4
                text-sm
                text-gray-900
                outline-none
                transition-all
                placeholder:text-gray-400
                hover:border-gray-300
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

          </div>

        </div>

      </section>

      {/* =================================================
          RESULTADOS
      ================================================= */}

      <section
        key={`${activeFilter}-${search}`}
        className="animate-[fadeIn_200ms_ease-out]"
      >

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              Agendamentos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredAppointments.length}{" "}
              {filteredAppointments.length === 1
                ? "resultado encontrado"
                : "resultados encontrados"}
            </p>
          </div>

        </div>

        <AppointmentList
          appointments={
            filteredAppointments
          }
          onDelete={
            handleDeleteAppointment
          }
        />

      </section>

      {/* =================================================
          MODAL
      ================================================= */}

      {isModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-gray-950/50
            p-4
            backdrop-blur-sm
          "
          onClick={() =>
            setIsModalOpen(false)
          }
        >

          <div
            role="dialog"
            aria-modal="true"
            className="
              flex
              max-h-[90vh]
              w-full
              max-w-xl
              flex-col
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
              ring-1
              ring-black/5
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div
              className="
                flex
                items-start
                justify-between
                px-5
                py-5
                sm:px-6
              "
            >

              <div className="flex gap-4">

                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                  <span className="text-lg font-bold">
                    +
                  </span>
                </div>

                <div>

                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Novo atendimento
                  </p>

                  <h2 className="text-xl font-semibold tracking-tight text-gray-950">
                    Novo Agendamento
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Preencha os dados do atendimento.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setIsModalOpen(false)
                }
                aria-label="Fechar"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-lg
                  text-gray-400
                  transition-colors
                  hover:bg-gray-100
                  hover:text-gray-900
                "
              >
                ×
              </button>

            </div>

            <div className="h-px bg-gray-100" />

            {/* Formulário */}

            <div className="overflow-y-auto px-5 py-6 sm:px-6">

              <div className="space-y-5">

                {/* Cliente */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Cliente
                  </label>

                  <input
                    type="text"
                    value={client}
                    onChange={(event) =>
                      setClient(
                        event.target.value
                      )
                    }
                    placeholder="Nome do cliente"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-gray-900
                      outline-none
                      transition-all
                      placeholder:text-gray-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>

                {/* Serviço */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Serviço
                  </label>

                  <input
                    type="text"
                    value={service}
                    onChange={(event) =>
                      setService(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: Corte Premium"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-gray-900
                      outline-none
                      transition-all
                      placeholder:text-gray-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>

                {/* Profissional */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Profissional
                  </label>

                  <input
                    type="text"
                    value={professional}
                    onChange={(event) =>
                      setProfessional(
                        event.target.value
                      )
                    }
                    placeholder="Nome do profissional"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-gray-900
                      outline-none
                      transition-all
                      placeholder:text-gray-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>

                {/* Data e hora */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      Data
                    </label>

                    <input
                      type="date"
                      value={date}
                      onChange={(event) =>
                        setDate(
                          event.target.value
                        )
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        py-3
                        text-sm
                        text-gray-900
                        outline-none
                        transition-all
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      Horário
                    </label>

                    <input
                      type="time"
                      value={time}
                      onChange={(event) =>
                        setTime(
                          event.target.value
                        )
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        py-3
                        text-sm
                        text-gray-900
                        outline-none
                        transition-all
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>

                </div>

                {/* Observações */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Observações
                    <span className="ml-1 font-normal text-gray-400">
                      (opcional)
                    </span>
                  </label>

                  <textarea
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    placeholder="Observações sobre o atendimento..."
                    rows={3}
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-gray-900
                      outline-none
                      transition-all
                      placeholder:text-gray-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>

              </div>

              {/* Ações */}

              <div
                className="
                  mt-7
                  flex
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                  sm:justify-end
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                    transition-colors
                    hover:bg-gray-50
                    sm:w-auto
                  "
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={
                    handleCreateAppointment
                  }
                  className="
                    w-full
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:bg-blue-700
                    hover:shadow-md
                    active:scale-[0.98]
                    sm:w-auto
                  "
                >
                  Criar Agendamento
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

