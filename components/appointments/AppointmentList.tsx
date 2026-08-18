"use client";

import { useEffect, useState } from "react";
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
  CreditCard,
  Save,
} from "lucide-react";

import { Appointment } from "@/types/appointment";

interface AppointmentListProps {
  appointments: Appointment[];

  onDelete: (id: string) => void;

  onEdit?: (appointment: Appointment) => void;
}

const statusLabels = {
  confirmed: "Confirmado",
  pending: "Aguardando",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusStyles = {
  confirmed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
};

function getInitials(name: string) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getPaymentLabel(payment: Appointment["payment"]) {
  if (payment === "paid") {
    return "Pago";
  }

  if (payment === "partial") {
    return "Parcial";
  }

  return "Pendente";
}

function formatPrice(price: number | undefined | null) {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "0 Kz";
  }

  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function AppointmentList({
  appointments,
  onDelete,
  onEdit,
}: AppointmentListProps) {
  /*ESTADO DA LISTA*/

  const [localAppointments, setLocalAppointments] =
    useState<Appointment[]>(appointments);

  /*altere os agendamentos.*/
  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  /* MENU DOS TRÊS PONTINHOS*/

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /*MODAL VER MAIS*/

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  /* MODAL DE EDIÇÃO*/

  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  /* CAMPOS DO FORMULÁRIO*/

  const [editClient, setEditClient] = useState("");
  const [editService, setEditService] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editProfessional, setEditProfessional] = useState("");

  const [editPayment, setEditPayment] =
    useState<Appointment["payment"]>("pending");

  const [editStatus, setEditStatus] =
    useState<Appointment["status"]>("confirmed");

  /* VER MAIS */

  function handleView(appointment: Appointment) {
    setOpenMenu(null);
    setSelectedAppointment(appointment);
  }

  /* ABRIR EDIÇÃO*/

  function handleEdit(appointment: Appointment) {
    setOpenMenu(null);
    setSelectedAppointment(null);

    /*Guardamos o agendamento que está sendo editado.*/
    setEditingAppointment(appointment);

    /* Preenchemos todos os campos.*/
    setEditClient(appointment.client ?? "");
    setEditService(appointment.service ?? "");

    /* Evita NaN no campo preço.*/
    const price = Number(appointment.price);

    setEditPrice(Number.isFinite(price) ? String(price) : "0");

    setEditDate(appointment.date ?? "");
    setEditTime(appointment.time ?? "");
    setEditProfessional(appointment.professional ?? "");

    setEditPayment(appointment.payment ?? "pending");

    setEditStatus(appointment.status ?? "confirmed");
  }

  /*SALVAR EDIÇÃO */

  function handleSaveEdit() {
    if (!editingAppointment) {
      return;
    }

    const price = Number(editPrice);

    const updatedAppointment: Appointment = {
      ...editingAppointment,

      client: editClient,
      service: editService,

      /* Garante que o preço seja número.*/
      price: Number.isFinite(price) ? price : 0,

      date: editDate,
      time: editTime,
      professional: editProfessional,

      payment: editPayment,
      status: editStatus,
    };

    /*Atualiza imediatamente a lista. */
    setLocalAppointments((current) =>
      current.map((appointment) =>
        appointment.id === updatedAppointment.id
          ? updatedAppointment
          : appointment,
      ),
    );

    /* Também informa o componente pai.*/
    if (onEdit) {
      onEdit(updatedAppointment);
    }

    /* Fecha a edição.*/
    setEditingAppointment(null);
  }

  /* EXCLUIR*/

  function handleDelete(id: string) {
    setOpenMenu(null);

    setLocalAppointments((current) =>
      current.filter((appointment) => appointment.id !== id),
    );

    onDelete(id);
  }

  /* ABRIR / FECHAR MENU*/

  function toggleMenu(id: string) {
    setOpenMenu((current) => (current === id ? null : id));
  }

  /* RENDER*/

  return (
    <>
      {/*LISTA DE AGENDAMENTOS*/}

      <section className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-gray-100
            px-5
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
          "
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Agendamentos
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Próximos atendimentos do estabelecimento
            </p>
          </div>

          <div className="w-fit rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {localAppointments.length}
            </span>

            <span className="ml-1">
              {localAppointments.length === 1 ? "agendamento" : "agendamentos"}
            </span>
          </div>
        </div>

        {/* LISTA */}

        <div className="divide-y divide-gray-100">
          {localAppointments.length === 0 ? (
            <div
              className="
                flex
                min-h-[260px]
                flex-col
                items-center
                justify-center
                px-6
                py-12
                text-center
              "
            >
              <div
                className="
                  mb-4
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-100
                  text-gray-500
                "
              >
                <CalendarDays className="h-6 w-6" />
              </div>

              <p className="font-medium text-gray-900">
                Nenhum agendamento encontrado
              </p>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Crie um novo agendamento para começar a organizar os
                atendimentos.
              </p>
            </div>
          ) : (
            localAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="
                  relative
                  px-5
                  py-5
                  transition
                  hover:bg-gray-50
                  sm:px-6
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-5
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                  "
                >
                  {/* CLIENTE */}

                  <div className="flex min-w-0 items-center gap-4">
                    {/* HORA */}

                    <div className="hidden w-16 shrink-0 sm:block">
                      <p className="text-sm font-semibold text-gray-900">
                        {appointment.time}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">Horário</p>
                    </div>

                    {/* AVATAR */}

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-gray-100
                        text-sm
                        font-semibold
                        text-gray-700
                      "
                    >
                      {getInitials(appointment.client)}
                    </div>

                    {/* DADOS */}

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

                        <span className="mx-2 text-gray-300">•</span>

                        {appointment.professional}
                      </p>

                      {/* MOBILE */}

                      <div className="mt-2 flex items-center gap-2 sm:hidden">
                        <span className="text-xs text-gray-500">
                          {appointment.time}
                        </span>

                        <span
                          className={`
                            rounded-full
                            px-2
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

                  {/* PAGAMENTO + MENU */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-t
                      border-gray-100
                      pt-4
                      lg:border-0
                      lg:pt-0
                    "
                  >
                    {/* PAGAMENTO */}

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Pagamento
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {getPaymentLabel(appointment.payment)}
                      </p>
                    </div>

                    {/* MENU */}

                    <div className="relative ml-6">
                      <button
                        type="button"
                        onClick={() => toggleMenu(appointment.id)}
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          text-gray-500
                          shadow-sm
                          transition
                          hover:border-gray-300
                          hover:bg-gray-50
                          hover:text-gray-900
                          active:scale-95
                        "
                        aria-label="Abrir opções"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>

                      {/* MENU */}

                      {openMenu === appointment.id && (
                        <div
                          className="
                            absolute
                            right-0
                            top-12
                            z-[999]
                            w-52
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            p-1.5
                            shadow-2xl
                          "
                        >
                          {/* VER MAIS */}

                          <button
                            type="button"
                            onClick={() => handleView(appointment)}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-lg
                              px-3
                              py-3
                              text-left
                              text-sm
                              font-medium
                              text-gray-700
                              transition
                              hover:bg-gray-100
                            "
                          >
                            <Eye className="h-4 w-4" />

                            <span>Ver mais</span>
                          </button>

                          <div className="my-1 border-t border-gray-100" />

                          {/* EXCLUIR */}

                          <button
                            type="button"
                            onClick={() => handleDelete(appointment.id)}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-lg
                              px-3
                              py-3
                              text-left
                              text-sm
                              font-medium
                              text-red-600
                              transition
                              hover:bg-red-50
                            "
                          >
                            <Trash2 className="h-4 w-4" />

                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* MODAL — VER MAIS */}

      {selectedAppointment && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/40
            px-4
            py-6
            backdrop-blur-sm
          "
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="
              max-h-[90vh]
              w-full
              max-w-lg
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-6
                py-5
              "
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalhes do agendamento
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Informações do atendimento
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-900
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CLIENTE */}

            <div
              className="
                flex
                items-center
                gap-4
                border-b
                border-gray-100
                px-6
                py-5
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-100
                  font-semibold
                  text-gray-700
                "
              >
                {getInitials(selectedAppointment.client)}
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  {selectedAppointment.client}
                </p>

                <span
                  className={`
                    mt-1
                    inline-flex
                    rounded-full
                    px-2.5
                    py-1
                    text-[11px]
                    font-medium
                    ${statusStyles[selectedAppointment.status]}
                  `}
                >
                  {statusLabels[selectedAppointment.status]}
                </span>
              </div>
            </div>

            {/* INFORMAÇÕES */}

            <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2">
              {/* SERVIÇO */}

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Scissors className="h-4 w-4" />

                  <span className="text-xs font-medium uppercase tracking-wide">
                    Serviço
                  </span>
                </div>

                <p className="mt-2 font-semibold text-gray-900">
                  {selectedAppointment.service}
                </p>
              </div>

              {/* PREÇO */}

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <CreditCard className="h-4 w-4" />

                  <span className="text-xs font-medium uppercase tracking-wide">
                    Preço
                  </span>
                </div>

                <p className="mt-2 font-semibold text-gray-900">
                  {formatPrice(selectedAppointment.price)}
                </p>
              </div>

              {/* DIA */}

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <CalendarDays className="h-4 w-4" />

                  <span className="text-xs font-medium uppercase tracking-wide">
                    Dia
                  </span>
                </div>

                <p className="mt-2 font-semibold text-gray-900">
                  {selectedAppointment.date}
                </p>
              </div>

              {/* HORA */}

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />

                  <span className="text-xs font-medium uppercase tracking-wide">
                    Hora
                  </span>
                </div>

                <p className="mt-2 font-semibold text-gray-900">
                  {selectedAppointment.time}
                </p>
              </div>

              {/* PROFISSIONAL */}

              <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <UserRound className="h-4 w-4" />

                  <span className="text-xs font-medium uppercase tracking-wide">
                    Profissional
                  </span>
                </div>

                <p className="mt-2 font-semibold text-gray-900">
                  {selectedAppointment.professional}
                </p>
              </div>

              {/* PAGAMENTO */}

              <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <CreditCard className="h-4 w-4" />

                  <span className="text-xs font-medium uppercase tracking-wide">
                    Pagamento
                  </span>
                </div>

                <p className="mt-2 font-semibold text-gray-900">
                  {getPaymentLabel(selectedAppointment.payment)}
                </p>
              </div>
            </div>

            {/* FOOTER */}

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                border-t
                border-gray-100
                px-6
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* EDITAR */}

              <button
                type="button"
                onClick={() => handleEdit(selectedAppointment)}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                  hover:text-gray-900
                "
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>

              {/* FECHAR */}

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="
                  rounded-xl
                  bg-gray-900
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/*MODAL — EDITAR AGENDAMENTO*/}

      {editingAppointment && (
        <div
          className="
            fixed
            inset-0
            z-[10000]
            flex
            items-center
            justify-center
            bg-black/40
            px-4
            py-6
            backdrop-blur-sm
          "
          onClick={() => setEditingAppointment(null)}
        >
          <div
            className="
              max-h-[92vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-6
                py-5
              "
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Editar agendamento
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Altere as informações do atendimento.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingAppointment(null)}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-900
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORMULÁRIO */}

            <div className="space-y-5 px-6 py-6">
              {/* CLIENTE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Cliente
                </label>

                <input
                  type="text"
                  value={editClient}
                  onChange={(event) => setEditClient(event.target.value)}
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
                    transition
                    focus:border-gray-900
                    focus:ring-2
                    focus:ring-gray-900/10
                  "
                />
              </div>

              {/* SERVIÇO + PREÇO */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Serviço
                  </label>

                  <div className="relative">
                    <Scissors className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={editService}
                      onChange={(event) => setEditService(event.target.value)}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        py-3
                        pl-10
                        pr-4
                        text-sm
                        text-gray-900
                        outline-none
                        transition
                        focus:border-gray-900
                        focus:ring-2
                        focus:ring-gray-900/10
                      "
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Preço
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={editPrice}
                      onChange={(event) => setEditPrice(event.target.value)}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        py-3
                        pr-12
                        text-sm
                        text-gray-900
                        outline-none
                        transition
                        focus:border-gray-900
                        focus:ring-2
                        focus:ring-gray-900/10
                      "
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                      Kz
                    </span>
                  </div>
                </div>
              </div>

              {/* DATA + HORA */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Dia
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="date"
                      value={editDate}
                      onChange={(event) => setEditDate(event.target.value)}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        py-3
                        pl-10
                        pr-4
                        text-sm
                        text-gray-900
                        outline-none
                        transition
                        focus:border-gray-900
                        focus:ring-2
                        focus:ring-gray-900/10
                      "
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Hora
                  </label>

                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="time"
                      value={editTime}
                      onChange={(event) => setEditTime(event.target.value)}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        py-3
                        pl-10
                        pr-4
                        text-sm
                        text-gray-900
                        outline-none
                        transition
                        focus:border-gray-900
                        focus:ring-2
                        focus:ring-gray-900/10
                      "
                    />
                  </div>
                </div>
              </div>

              {/* PROFISSIONAL */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Profissional
                </label>

                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    value={editProfessional}
                    onChange={(event) =>
                      setEditProfessional(event.target.value)
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      py-3
                      pl-10
                      pr-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:border-gray-900
                      focus:ring-2
                      focus:ring-gray-900/10
                    "
                  />
                </div>
              </div>

              {/* PAGAMENTO + STATUS */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Pagamento
                  </label>

                  <select
                    value={editPayment}
                    onChange={(event) =>
                      setEditPayment(
                        event.target.value as Appointment["payment"],
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
                      transition
                      focus:border-gray-900
                      focus:ring-2
                      focus:ring-gray-900/10
                    "
                  >
                    <option value="pending">Pendente</option>

                    <option value="partial">Parcial</option>

                    <option value="paid">Pago</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <select
                    value={editStatus}
                    onChange={(event) =>
                      setEditStatus(event.target.value as Appointment["status"])
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
                      transition
                      focus:border-gray-900
                      focus:ring-2
                      focus:ring-gray-900/10
                    "
                  >
                    <option value="confirmed">Confirmado</option>

                    <option value="pending">Aguardando</option>

                    <option value="completed">Concluído</option>

                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                border-t
                border-gray-100
                px-6
                py-4
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={() => setEditingAppointment(null)}
                className="
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gray-900
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-gray-800
                  active:scale-[0.98]
                "
              >
                <Save className="h-4 w-4" />
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
