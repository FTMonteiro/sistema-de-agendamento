
"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";

import { AppointmentList } from "@/components/appointments/AppointmentList";
import { Appointment } from "@/types/appointment";

type Filter =
  | "all"
  | "confirmed"
  | "pending"
  | "completed";

export default function AppointmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeFilter, setActiveFilter] =
    useState<Filter>("all");

  const [search, setSearch] = useState("");

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [client, setClient] = useState("");
  const [service, setService] = useState("");
  const [professional, setProfessional] =
    useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const [formError, setFormError] =
    useState("");

  const [isCreating, setIsCreating] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | BUSCAR
  |--------------------------------------------------------------------------
  */

  async function loadAppointments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/appointments",
        {
          cache: "no-store",
        },
      );

      const text = await response.text();

      let data: {
        appointments?: Appointment[];
        error?: string;
      } = {};

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "A API retornou uma resposta inválida.",
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Erro ao buscar agendamentos.",
        );
      }

      setAppointments(
        data.appointments ?? [],
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao buscar agendamentos.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CRIAR
  |--------------------------------------------------------------------------
  */

  async function handleCreateAppointment() {
    setFormError("");

    if (!client.trim()) {
      setFormError(
        "Preencha o nome do cliente.",
      );
      return;
    }

    if (!service.trim()) {
      setFormError(
        "Preencha o serviço.",
      );
      return;
    }

    if (!professional.trim()) {
      setFormError(
        "Preencha o profissional.",
      );
      return;
    }

    if (!date) {
      setFormError(
        "Selecione a data.",
      );
      return;
    }

    if (!time) {
      setFormError(
        "Selecione o horário.",
      );
      return;
    }

    try {
      setIsCreating(true);

      const response = await fetch(
        "/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            client: client.trim(),
            service: service.trim(),
            professional:
              professional.trim(),
            date,
            time,
            notes: notes.trim(),
          }),
        },
      );

      const text = await response.text();

      let data: {
        appointment?: Appointment;
        error?: string;
      } = {};

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "A API retornou uma resposta inválida.",
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Não foi possível criar o agendamento.",
        );
      }

      /*
       * ADICIONAR DIRETAMENTE NA INTERFACE
       */

      if (data.appointment) {
        setAppointments((current) => [
          data.appointment!,
          ...current,
        ]);
      } else {
        await loadAppointments();
      }

      /*
       * LIMPAR
       */

      setClient("");
      setService("");
      setProfessional("");
      setDate("");
      setTime("");
      setNotes("");
      setFormError("");

      /*
       * FECHAR
       */

      setIsModalOpen(false);
    } catch (error) {
      console.error(
        "Erro ao criar agendamento:",
        error,
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Erro ao criar agendamento.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | EXCLUIR
  |--------------------------------------------------------------------------
  */

  function handleDeleteAppointment(id: string) {
    setAppointments((current) =>
      current.filter(
        (appointment) =>
          appointment.id !== id,
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | EDITAR
  |--------------------------------------------------------------------------
  */

  function handleEditAppointment(
    updated: Appointment,
  ) {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === updated.id
          ? updated
          : appointment,
      ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | FILTROS
  |--------------------------------------------------------------------------
  */

  const filteredAppointments =
    appointments.filter(
      (appointment) => {
        const matchesFilter =
          activeFilter === "all" ||
          appointment.status ===
            activeFilter;

        const searchText =
          search.toLowerCase().trim();

        const matchesSearch =
          !searchText ||
          appointment.client
            .toLowerCase()
            .includes(searchText) ||
          appointment.service
            .toLowerCase()
            .includes(searchText) ||
          appointment.professional
            .toLowerCase()
            .includes(searchText);

        return (
          matchesFilter &&
          matchesSearch
        );
      },
    );

  /*
  |--------------------------------------------------------------------------
  | CONTADORES
  |--------------------------------------------------------------------------
  */

  const confirmedCount =
    appointments.filter(
      (item) =>
        item.status === "confirmed",
    ).length;

  const pendingCount =
    appointments.filter(
      (item) =>
        item.status === "pending",
    ).length;

  const completedCount =
    appointments.filter(
      (item) =>
        item.status === "completed",
    ).length;

  const filters = [
    {
      value: "all" as const,
      label: "Todos",
      count: appointments.length,
    },
    {
      value: "confirmed" as const,
      label: "Confirmados",
      count: confirmedCount,
    },
    {
      value: "pending" as const,
      label: "Aguardando",
      count: pendingCount,
    },
    {
      value: "completed" as const,
      label: "Concluídos",
      count: completedCount,
    },
  ];

  return (
    <div className="min-h-full space-y-8">
      {/* HEADER */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />

            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Gestão
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Agenda
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Organize os seus atendimentos,
            acompanhe os profissionais e
            mantenha a agenda sempre sob
            controlo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError("");
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />

          Novo Agendamento
        </button>
      </section>

      {/* MÉTRICAS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Total"
          value={appointments.length}
          description="Agendamentos registados"
        />

        <Metric
          title="Confirmados"
          value={confirmedCount}
          description="Atendimentos confirmados"
        />

        <Metric
          title="Aguardando"
          value={pendingCount}
          description="Aguardam confirmação"
        />

        <Metric
          title="Concluídos"
          value={completedCount}
          description="Atendimentos concluídos"
        />
      </section>

      {/* FILTROS */}

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const active =
                activeFilter ===
                filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter.value,
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    active
                      ? "bg-gray-950 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {filter.label}

                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Pesquisar cliente, serviço..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </section>

      {/* ERRO */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* RESULTADOS */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-950">
            Agendamentos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {filteredAppointments.length}{" "}
            resultado
            {filteredAppointments.length ===
            1
              ? ""
              : "s"}{" "}
            encontrado
            {filteredAppointments.length ===
            1
              ? ""
              : "s"}
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Carregando agendamentos...
            </p>
          </div>
        ) : (
          <AppointmentList
            appointments={
              filteredAppointments
            }
            onDelete={
              handleDeleteAppointment
            }
            onEdit={
              handleEditAppointment
            }
          />
        )}
      </section>

      {/* MODAL CRIAR */}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isCreating) {
              setIsModalOpen(false);
            }
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="border-b border-gray-100 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Novo atendimento
              </p>

              <h2 className="mt-1 text-xl font-semibold text-gray-950">
                Novo Agendamento
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Preencha os dados do atendimento.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-800">
                    Não foi possível criar
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {formError}
                  </p>
                </div>
              )}

              <Field
                label="Cliente"
                value={client}
                onChange={setClient}
                placeholder="Nome do cliente"
              />

              <Field
                label="Serviço"
                value={service}
                onChange={setService}
                placeholder="Ex.: Corte Premium"
              />

              <Field
                label="Profissional"
                value={professional}
                onChange={setProfessional}
                placeholder="Nome do profissional"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Data"
                  type="date"
                  value={date}
                  onChange={setDate}
                />

                <Field
                  label="Horário"
                  type="time"
                  value={time}
                  onChange={setTime}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Observações
                </label>

                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Observações sobre o atendimento..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isCreating}
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isCreating}
                onClick={
                  handleCreateAppointment
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating
                  ? "Criando..."
                  : "Criar Agendamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MÉTRICA
|--------------------------------------------------------------------------
*/

function Metric({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-gray-950">
        {value}
      </p>

      <p className="mt-4 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| CAMPO
|--------------------------------------------------------------------------
*/

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-800">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

