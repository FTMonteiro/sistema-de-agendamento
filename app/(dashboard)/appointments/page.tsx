
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
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Agendamentos
  const [appointments, setAppointments] = useState(
    initialAppointments
  );

  // Filtro atual
  const [activeFilter, setActiveFilter] =
    useState<Filter>("all");

  // Pesquisa
  const [search, setSearch] = useState("");

  // Formulário
  const [client, setClient] = useState("");
  const [service, setService] = useState("");
  const [professional, setProfessional] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");


  // =====================================================
  // FILTRAR E PESQUISAR
  // =====================================================

  const filteredAppointments = appointments.filter(
    (appointment) => {

      const matchesFilter =
        activeFilter === "all" ||
        appointment.status === activeFilter;

      const searchText = search.toLowerCase().trim();

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


  // =====================================================
  // CRIAR AGENDAMENTO
  // =====================================================

  function handleCreateAppointment() {

    if (
      !client ||
      !service ||
      !professional ||
      !date ||
      !time
    ) {
      return;
    }

    const newAppointment = {
      id: Date.now().toString(),

      client,

      service,

      professional,

      date,

      time,

      payment: "pending" as const,

      status: "pending" as const,

      notes,
    };

    setAppointments((current) => [
      ...current,
      newAppointment,
    ]);

    // Limpar formulário
    setClient("");
    setService("");
    setProfessional("");
    setDate("");
    setTime("");
    setNotes("");

    // Fechar modal
    setIsModalOpen(false);
  }


  // =====================================================
  // EXCLUIR AGENDAMENTO
  // =====================================================

  function handleDeleteAppointment(id: string) {

    setAppointments((current) =>
      current.filter(
        (appointment) =>
          appointment.id !== id
      )
    );
  }


  return (
    <div className="space-y-8">


      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-gray-900
            "
          >
            Agenda
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            Gerencie os agendamentos e atendimentos
            do seu estabelecimento.
          </p>

        </div>


        {/* BOTÕES */}

        <div className="flex gap-3">

          <button
            type="button"
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              px-5
              py-3
              text-sm
              font-medium
              text-gray-700
              transition-all
              duration-200
              hover:bg-gray-50
              active:scale-95
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
              rounded-xl
              bg-black
              px-5
              py-3
              text-sm
              font-medium
              text-white
              transition-all
              duration-200
              hover:bg-gray-800
              active:scale-95
            "
          >
            + Novo Agendamento
          </button>

        </div>

      </div>


      {/* =================================================
          RESUMO
      ================================================= */}

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        {/* HOJE */}

        <div
          className="
            rounded-2xl
            border
            bg-white
            p-5
            shadow-sm
            transition
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <p className="text-sm text-gray-500">
            Hoje
          </p>

          <h2
            className="
              mt-2
              text-3xl
              font-bold
              text-gray-900
            "
          >
            {appointments.length}
          </h2>

        </div>


        {/* CONFIRMADOS */}

        <div
          className="
            rounded-2xl
            border
            bg-white
            p-5
            shadow-sm
          "
        >

          <p className="text-sm text-gray-500">
            Confirmados
          </p>

          <h2
            className="
              mt-2
              text-3xl
              font-bold
              text-gray-900
            "
          >
            {
              appointments.filter(
                (appointment) =>
                  appointment.status ===
                  "confirmed"
              ).length
            }
          </h2>

        </div>


        {/* AGUARDANDO */}

        <div
          className="
            rounded-2xl
            border
            bg-white
            p-5
            shadow-sm
          "
        >

          <p className="text-sm text-gray-500">
            Aguardando
          </p>

          <h2
            className="
              mt-2
              text-3xl
              font-bold
              text-gray-900
            "
          >
            {
              appointments.filter(
                (appointment) =>
                  appointment.status ===
                  "pending"
              ).length
            }
          </h2>

        </div>


        {/* CONCLUÍDOS */}

        <div
          className="
            rounded-2xl
            border
            bg-white
            p-5
            shadow-sm
          "
        >

          <p className="text-sm text-gray-500">
            Concluídos
          </p>

          <h2
            className="
              mt-2
              text-3xl
              font-bold
              text-gray-900
            "
          >
            {
              appointments.filter(
                (appointment) =>
                  appointment.status ===
                  "completed"
              ).length
            }
          </h2>

        </div>

      </div>


      {/* =================================================
          PESQUISA + FILTROS
      ================================================= */}

      <div
        className="
          rounded-2xl
          border
          bg-white
          p-4
          shadow-sm
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          {/* FILTROS */}

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >

            {/* TODOS */}

            <button
              type="button"
              onClick={() =>
                setActiveFilter("all")
              }
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition-all
                duration-200
                active:scale-95

                ${
                  activeFilter === "all"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              Todos
            </button>


            {/* CONFIRMADOS */}

            <button
              type="button"
              onClick={() =>
                setActiveFilter("confirmed")
              }
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition-all
                duration-200
                active:scale-95

                ${
                  activeFilter ===
                  "confirmed"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              Confirmados
            </button>


            {/* AGUARDANDO */}

            <button
              type="button"
              onClick={() =>
                setActiveFilter("pending")
              }
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition-all
                duration-200
                active:scale-95

                ${
                  activeFilter === "pending"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              Aguardando
            </button>


            {/* CONCLUÍDOS */}

            <button
              type="button"
              onClick={() =>
                setActiveFilter("completed")
              }
              className={`
                rounded-lg
                px-4
                py-2
                text-sm
                font-medium
                transition-all
                duration-200
                active:scale-95

                ${
                  activeFilter ===
                  "completed"
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              Concluídos
            </button>

          </div>


          {/* PESQUISA */}

          <div
            className="
              relative
              w-full
              md:w-72
            "
          >

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Pesquisar cliente..."
              className="
                w-full
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
                text-sm
                outline-none
                transition-all
                duration-200
                focus:border-gray-400
                focus:bg-white
                focus:ring-2
                focus:ring-gray-100
              "
            />

          </div>

        </div>

      </div>


      {/* =================================================
          RESULTADOS
      ================================================= */}

      <div
        key={`${activeFilter}-${search}`}
        className="
          animate-[fadeIn_200ms_ease-out]
        "
      >

        <AppointmentList
          appointments={
            filteredAppointments
          }
          onDelete={
            handleDeleteAppointment
          }
        />

      </div>


      {/* =================================================
          MODAL NOVO AGENDAMENTO
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
            bg-black/40
            p-4
          "
          onClick={() =>
            setIsModalOpen(false)
          }
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CABEÇALHO */}

            <div
              className="
                mb-6
                flex
                items-center
                justify-between
              "
            >

              <div>

                <h2
                  className="
                    text-xl
                    font-semibold
                    text-gray-900
                  "
                >
                  Novo Agendamento
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Preencha os dados do atendimento.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="
                  rounded-lg
                  px-3
                  py-2
                  text-gray-500
                  transition
                  hover:bg-gray-100
                "
              >
                ✕
              </button>

            </div>


            {/* FORMULÁRIO */}

            <div className="space-y-4">

              {/* CLIENTE */}

              <div>

                <label
                  className="
                    mb-1
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
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
                    rounded-lg
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-gray-400
                  "
                />

              </div>


              {/* SERVIÇO */}

              <div>

                <label
                  className="
                    mb-1
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
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
                  placeholder="Ex: Corte Premium"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-gray-400
                  "
                />

              </div>


              {/* PROFISSIONAL */}

              <div>

                <label
                  className="
                    mb-1
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
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
                    rounded-lg
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-gray-400
                  "
                />

              </div>


              {/* DATA + HORA */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                "
              >

                <div>

                  <label
                    className="
                      mb-1
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
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
                      rounded-lg
                      border
                      border-gray-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </div>


                <div>

                  <label
                    className="
                      mb-1
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    Hora
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
                      rounded-lg
                      border
                      border-gray-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                    "
                  />

                </div>

              </div>


              {/* OBSERVAÇÕES */}

              <div>

                <label
                  className="
                    mb-1
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Observações
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
                    rounded-lg
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-gray-400
                  "
                />

              </div>

            </div>


            {/* BOTÕES DO MODAL */}

            <div
              className="
                mt-6
                flex
                justify-end
                gap-3
              "
            >

              <button
                type="button"
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="
                  rounded-xl
                  border
                  border-gray-200
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-50
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
                  rounded-xl
                  bg-black
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-white
                  transition-all
                  duration-200
                  hover:bg-gray-800
                  active:scale-95
                "
              >
                Criar Agendamento
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

