"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useNotifications } from "@/components/notifications/NotificationsProvider";

import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Clock,
  UserRound,
  Scissors,
  Save,
  AlertTriangle,
} from "lucide-react";

import { Appointment } from "@/types/appointment";

interface AppointmentListProps {
  appointments?: Appointment[];
  onDelete?: (id: string) => void;
  onEdit?: (appointment: Appointment) => void;
}

export function AppointmentList({
  appointments: externalAppointments,
  onDelete,
  onEdit,
}: AppointmentListProps) {
  const [appointments, setAppointments] = useState<
    Appointment[]
  >(externalAppointments ?? []);

  const [loading, setLoading] = useState(true);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const [deletingAppointment, setDeletingAppointment] =
    useState<Appointment | null>(null);

  const { notify } = useNotifications();

  const [openMenu, setOpenMenu] = useState<string | null>(
    null,
  );

  const [isDeleting, setIsDeleting] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [validationError, setValidationError] =
    useState<string>("");

  /*
  |--------------------------------------------------------------------------
  | BUSCAR AGENDAMENTOS
  |--------------------------------------------------------------------------
  */

  async function loadAppointments() {
    try {
      setLoading(true);

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
            "Erro ao carregar agendamentos.",
        );
      }

      setAppointments(
        data.appointments ?? [],
      );
    } catch (error) {
      console.error(
        "Erro ao buscar agendamentos:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CARREGAMENTO INICIAL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadAppointments();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | ATUALIZAÇÃO DINÂMICA
  |--------------------------------------------------------------------------
  |
  | Quando outro componente criar/editar/excluir,
  | ele vai disparar:
  |
  | window.dispatchEvent(
  |   new Event("appointments:changed")
  | )
  |
  */

  useEffect(() => {
    function handleAppointmentsChanged() {
      loadAppointments();
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
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SINCRONIZAR COM PROPS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      externalAppointments &&
      externalAppointments.length !== appointments.length
    ) {
      setAppointments(
        externalAppointments,
      );
    }
  }, [
    externalAppointments,
  ]);

  /*
  |--------------------------------------------------------------------------
  | EXCLUIR
  |--------------------------------------------------------------------------
  */

  function requestDelete(
    appointment: Appointment,
  ) {
    setOpenMenu(null);

    setValidationError("");

    setDeletingAppointment(
      appointment,
    );
  }

  async function confirmDelete() {
    if (!deletingAppointment) {
      return;
    }

    try {
      setIsDeleting(true);

      setValidationError("");

      const response = await fetch(
        `/api/appointments/${deletingAppointment.id}`,
        {
          method: "DELETE",
        },
      );

      const text = await response.text();

      let data: {
        success?: boolean;
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
            "Não foi possível excluir o agendamento.",
        );
      }

      /*
      |------------------------------------------------------------
      | ATUALIZA IMEDIATAMENTE
      |------------------------------------------------------------
      */

      setAppointments(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              deletingAppointment.id,
          ),
      );

      onDelete?.(
        deletingAppointment.id,
      );

      notify({
        kind: "deleted",
        title: "Agendamento apagado",
        description: `${deletingAppointment.client} — ${deletingAppointment.date} às ${deletingAppointment.time}`,
      });

      toast.success(
        "Agendamento apagado.",
      );

      /*
      |------------------------------------------------------------
      | AVISA OUTROS COMPONENTES
      |------------------------------------------------------------
      */

      window.dispatchEvent(
        new Event(
          "appointments:changed",
        ),
      );

      setDeletingAppointment(null);
    } catch (error) {
      console.error(
        "Erro ao excluir:",
        error,
      );

      setValidationError(
        error instanceof Error
          ? error.message
          : "Erro ao excluir agendamento.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | EDITAR
  |--------------------------------------------------------------------------
  */

  function handleEdit(
    appointment: Appointment,
  ) {
    setOpenMenu(null);

    setValidationError("");

    /*
    |------------------------------------------------------------
    | IMPORTANTE
    |------------------------------------------------------------
    | Não vamos mais depender do onEdit do pai
    | para abrir a edição.
    */

    setEditingAppointment({
      ...appointment,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SALVAR EDIÇÃO
  |--------------------------------------------------------------------------
  */

  async function saveEdit() {
    if (!editingAppointment) {
      return;
    }

    /*
    |------------------------------------------------------------
    | VALIDAÇÃO
    |------------------------------------------------------------
    */

    if (
      !editingAppointment.client?.trim()
    ) {
      setValidationError(
        "Preencha o nome do cliente.",
      );

      return;
    }

    if (
      !editingAppointment.service?.trim()
    ) {
      setValidationError(
        "Preencha o serviço.",
      );

      return;
    }

    if (
      !editingAppointment.professional?.trim()
    ) {
      setValidationError(
        "Preencha o profissional.",
      );

      return;
    }

    if (
      !editingAppointment.date
    ) {
      setValidationError(
        "Selecione a data.",
      );

      return;
    }

    if (
      !editingAppointment.time
    ) {
      setValidationError(
        "Selecione o horário.",
      );

      return;
    }

    try {
      setIsSaving(true);

      setValidationError("");

      const response = await fetch(
        `/api/appointments/${editingAppointment.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            client:
              editingAppointment.client,

            service:
              editingAppointment.service,

            professional:
              editingAppointment.professional,

            date:
              editingAppointment.date,

            time:
              editingAppointment.time,

            status:
              editingAppointment.status,

            payment:
              editingAppointment.payment,
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
            "Não foi possível atualizar o agendamento.",
        );
      }

      /*
      |------------------------------------------------------------
      | ATUALIZA IMEDIATAMENTE
      |------------------------------------------------------------
      */

      if (data.appointment) {
        setAppointments(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                data.appointment!.id
                  ? data.appointment!
                  : item,
            ),
        );
      } else {
        /*
        |----------------------------------------------------------
        | FALLBACK
        |----------------------------------------------------------
        */

        setAppointments(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                editingAppointment.id
                  ? editingAppointment
                  : item,
            ),
        );
      }

      /*
      |------------------------------------------------------------
      | AVISA OUTROS COMPONENTES
      |------------------------------------------------------------
      */

      window.dispatchEvent(
        new Event(
          "appointments:changed",
        ),
      );

      onEdit?.(
        data.appointment ??
          editingAppointment,
      );

      const saved =
        data.appointment ??
        editingAppointment;

      notify({
        kind: "updated",
        title: "Agendamento editado",
        description: `${saved.client} — ${saved.date} às ${saved.time}`,
      });

      toast.success(
        "Agendamento atualizado.",
      );

      setEditingAppointment(null);
    } catch (error) {
      console.error(
        "Erro ao editar:",
        error,
      );

      setValidationError(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar agendamento.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  function getStatusLabel(
    status: Appointment["status"],
  ) {
    switch (status) {
      case "confirmed":
        return "Confirmado";

      case "completed":
        return "Concluído";

      case "cancelled":
        return "Cancelado";

      default:
        return "Aguardando";
    }
  }

  function getStatusClass(
    status: Appointment["status"],
  ) {
    switch (status) {
      case "confirmed":
        return "bg-blue-50 text-blue-700";

      case "completed":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  function formatDate(
    date: string,
  ) {
    if (!date) {
      return "-";
    }

    const [
      year,
      month,
      day,
    ] = date.split("-");

    if (
      !year ||
      !month ||
      !day
    ) {
      return date;
    }

    return `${day}/${month}/${year}`;
  }

  /*
  |--------------------------------------------------------------------------
  | ORDENAÇÃO
  |--------------------------------------------------------------------------
  */

  const sortedAppointments =
    useMemo(() => {
      return [...appointments].sort(
        (a, b) => {
          const dateA =
            `${a.date} ${a.time}`;

          const dateB =
            `${b.date} ${b.time}`;

          return dateA.localeCompare(
            dateB,
          );
        },
      );
    }, [appointments]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          Carregando agendamentos...
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LISTA
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {sortedAppointments.length ===
      0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />

          <h3 className="mt-4 text-base font-semibold text-gray-900">
            Nenhum agendamento encontrado
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Os novos agendamentos aparecerão
            aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAppointments.map(
            (appointment) => (
              <div
                key={appointment.id}
                className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-gray-200 hover:shadow-md sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-gray-950">
                        {
                          appointment.client
                        }
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          appointment.status,
                        )}`}
                      >
                        {getStatusLabel(
                          appointment.status,
                        )}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-gray-500 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-gray-400" />

                        <span className="truncate">
                          {
                            appointment.service
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-gray-400" />

                        <span className="truncate">
                          {
                            appointment.professional
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" />

                        <span>
                          {formatDate(
                            appointment.date,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />

                        <span>
                          {
                            appointment.time
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MENU */}

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(
                          openMenu ===
                            appointment.id
                            ? null
                            : appointment.id,
                        )
                      }
                      className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>

                    {openMenu ===
                      appointment.id && (
                      <div className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(
                              null,
                            );

                            setSelectedAppointment(
                              appointment,
                            );
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                          Ver detalhes
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              appointment,
                            )
                          }
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            requestDelete(
                              appointment,
                            )
                          }
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* =========================================================
          DETALHES
      ========================================================= */}

      {selectedAppointment && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedAppointment(null)
          }
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Detalhes
                </p>

                <h2 className="mt-1 text-xl font-semibold text-gray-950">
                  Agendamento
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAppointment(
                    null,
                  )
                }
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <Detail
                icon={
                  <UserRound className="h-4 w-4" />
                }
                label="Cliente"
                value={
                  selectedAppointment.client
                }
              />

              <Detail
                icon={
                  <Scissors className="h-4 w-4" />
                }
                label="Serviço"
                value={
                  selectedAppointment.service
                }
              />

              <Detail
                icon={
                  <UserRound className="h-4 w-4" />
                }
                label="Profissional"
                value={
                  selectedAppointment.professional
                }
              />

              <Detail
                icon={
                  <CalendarDays className="h-4 w-4" />
                }
                label="Data"
                value={formatDate(
                  selectedAppointment.date,
                )}
              />

              <Detail
                icon={
                  <Clock className="h-4 w-4" />
                }
                label="Horário"
                value={
                  selectedAppointment.time
                }
              />

              {selectedAppointment.notes && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Observações
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    {
                      selectedAppointment.notes
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          EDITAR
      ========================================================= */}

      {editingAppointment && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isSaving) {
              setEditingAppointment(
                null,
              );
              setValidationError("");
            }
          }}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Editar
                </p>

                <h2 className="mt-1 text-xl font-semibold text-gray-950">
                  Editar Agendamento
                </h2>
              </div>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setEditingAppointment(
                    null,
                  );

                  setValidationError("");
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {/* ERRO DENTRO DO MODAL */}

              {validationError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Verifique os dados
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      {validationError}
                    </p>
                  </div>
                </div>
              )}

              <EditField
                label="Cliente"
                value={
                  editingAppointment.client
                }
                onChange={(value) => {
                  setValidationError("");

                  setEditingAppointment({
                    ...editingAppointment,
                    client: value,
                  });
                }}
              />

              <EditField
                label="Serviço"
                value={
                  editingAppointment.service
                }
                onChange={(value) => {
                  setValidationError("");

                  setEditingAppointment({
                    ...editingAppointment,
                    service: value,
                  });
                }}
              />

              <EditField
                label="Profissional"
                value={
                  editingAppointment.professional
                }
                onChange={(value) => {
                  setValidationError("");

                  setEditingAppointment({
                    ...editingAppointment,
                    professional:
                      value,
                  });
                }}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <EditField
                  label="Data"
                  type="date"
                  value={
                    editingAppointment.date
                  }
                  onChange={(value) => {
                    setValidationError("");

                    setEditingAppointment({
                      ...editingAppointment,
                      date: value,
                    });
                  }}
                />

                <EditField
                  label="Horário"
                  type="time"
                  value={
                    editingAppointment.time
                  }
                  onChange={(value) => {
                    setValidationError("");

                    setEditingAppointment({
                      ...editingAppointment,
                      time: value,
                    });
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Status
                </label>

                <select
                  value={
                    editingAppointment.status
                  }
                  onChange={(event) => {
                    setValidationError("");

                    setEditingAppointment({
                      ...editingAppointment,
                      status:
                        event.target
                          .value as Appointment["status"],
                    });
                  }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="pending">
                    Aguardando
                  </option>

                  <option value="confirmed">
                    Confirmado
                  </option>

                  {/* Concluído sai do pagamento, não da mão do utilizador. */}
                  <option
                    value="completed"
                    disabled={
                      editingAppointment.payment !==
                      "paid"
                    }
                  >
                    Concluído
                    {editingAppointment.payment !==
                      "paid" &&
                      " (requer pagamento)"}
                  </option>

                  <option value="cancelled">
                    Cancelado
                  </option>
                </select>

                {editingAppointment.payment !==
                  "paid" && (
                  <p className="mt-2 text-xs text-gray-500">
                    O agendamento passa a Concluído ao receber o pagamento.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setEditingAppointment(
                    null,
                  );

                  setValidationError("");
                }}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={saveEdit}
                className="flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />

                {isSaving
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CONFIRMAÇÃO DE EXCLUSÃO
      ========================================================= */}

      {deletingAppointment && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isDeleting) {
              setDeletingAppointment(
                null,
              );
            }
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-950">
                    Excluir agendamento?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Tem certeza de que deseja
                    excluir este agendamento?
                    Esta ação não pode ser
                    desfeita.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">
                  {
                    deletingAppointment.client
                  }
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {
                    deletingAppointment.service
                  }
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />

                    {formatDate(
                      deletingAppointment.date,
                    )}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />

                    {
                      deletingAppointment.time
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() =>
                  setDeletingAppointment(
                    null,
                  )
                }
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />

                {isDeleting
                  ? "Excluindo..."
                  : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/*
|--------------------------------------------------------------------------
| DETALHE
|--------------------------------------------------------------------------
*/

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-400">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-medium text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| CAMPO
|--------------------------------------------------------------------------
*/

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-800">
        {label}
      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}