"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  X,
  UserRound,
  Banknote,
  CalendarDays,
  Scissors,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface PaymentAppointment {
  id: string;
  date: string;

  client: {
    id: string;
    name: string;
  };

  professional: {
    id: string;
    name: string;
  };

  service: {
    id: string;
    name: string;
    price: number | string | null;
    duration: number;
  };

  payment: {
    id: string;
    amount: number | string;
    method: string;
    status: string;
  } | null;

  // Compatibilidade caso a API devolva estes campos
  paymentAmount?: number | string | null;
  paymentMethod?: string | null;
}

interface ServiceRecord {
  id: string;
  name: string;
  price: number | string | null;
  active?: boolean;
}

type PaymentMethod =
  | "CASH"
  | "CARD"
  | "TRANSFER"
  | "MOBILE_MONEY";

interface ReceivePaymentProps {
  onPaymentCreated?: () => void;
}

function getNumericPrice(
  value: number | string | null | undefined,
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return numberValue;
}

function formatPrice(
  value: number | string | null | undefined,
) {
  const numericValue = getNumericPrice(value);

  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getPaymentMethodLabel(
  method?: string | null,
) {
  switch (method) {
    case "CASH":
      return "Dinheiro";

    case "CARD":
      return "Cartão";

    case "TRANSFER":
      return "Transferência";

    case "MOBILE_MONEY":
      return "Multicaixa Express";

    default:
      return method || "—";
  }
}

export function ReceivePayment({
  onPaymentCreated,
}: ReceivePaymentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [appointments, setAppointments] =
    useState<PaymentAppointment[]>([]);

  const [services, setServices] =
    useState<ServiceRecord[]>([]);

  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | CARREGAR AGENDAMENTOS + SERVIÇOS
  |--------------------------------------------------------------------------
  */

  async function loadAppointments() {
    try {
      setIsLoading(true);
      setError("");

      const [
        appointmentsResponse,
        servicesResponse,
      ] = await Promise.all([
        fetch(
          "/api/appointments/payments",
          {
            method: "GET",
            cache: "no-store",
          },
        ),

        fetch("/api/services", {
          method: "GET",
          cache: "no-store",
        }),
      ]);

      const appointmentsData =
        await appointmentsResponse.json();

      const servicesData =
        await servicesResponse.json();

      if (!appointmentsResponse.ok) {
        throw new Error(
          appointmentsData?.error ||
            "Não foi possível carregar os agendamentos.",
        );
      }

      if (!servicesResponse.ok) {
        throw new Error(
          servicesData?.error ||
            "Não foi possível carregar os serviços.",
        );
      }

      const apiAppointments =
        Array.isArray(
          appointmentsData?.appointments,
        )
          ? appointmentsData.appointments
          : [];

      const apiServices: ServiceRecord[] =
        Array.isArray(servicesData)
          ? servicesData
          : Array.isArray(
                servicesData?.services,
              )
            ? servicesData.services
            : [];

      setServices(apiServices);

      /*
       * ============================================================
       * CORREÇÃO DO PREÇO
       * ============================================================
       *
       * A prioridade será:
       *
       * 1. service.price vindo da API de pagamentos
       * 2. price vindo diretamente do agendamento
       * 3. preço encontrado em /api/services pelo service.id
       *
       * Assim evitamos que a modal mostre 0 Kz quando o serviço
       * realmente possui preço cadastrado.
       */

      const normalizedAppointments: PaymentAppointment[] =
        apiAppointments.map(
          (appointment: any) => {
            const serviceId =
              appointment?.service?.id ??
              appointment?.serviceId ??
              "";

            const serviceFromApi =
              apiServices.find(
                (service) =>
                  service.id === serviceId,
              );

            const nestedPrice =
              getNumericPrice(
                appointment?.service?.price,
              );

            const directPrice =
              getNumericPrice(
                appointment?.price,
              );

            const servicePrice =
              getNumericPrice(
                serviceFromApi?.price,
              );

            let finalPrice = nestedPrice;

            /*
             * Se o preço que veio da API de pagamento for 0,
             * tenta encontrar o preço real no endpoint de serviços.
             */
            if (finalPrice <= 0) {
              if (directPrice > 0) {
                finalPrice = directPrice;
              } else if (servicePrice > 0) {
                finalPrice = servicePrice;
              }
            }

            return {
              ...appointment,

              service: {
                ...appointment.service,

                id:
                  appointment?.service?.id ??
                  serviceId,

                name:
                  appointment?.service?.name ??
                  serviceFromApi?.name ??
                  "Serviço",

                price: finalPrice,

                duration:
                  Number(
                    appointment?.service
                      ?.duration,
                  ) || 0,
              },
            };
          },
        );

      setAppointments(
        normalizedAppointments,
      );
    } catch (err) {
      console.error(
        "Erro ao carregar pagamentos:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar os agendamentos.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ABRIR
  |--------------------------------------------------------------------------
  */

  function handleOpen() {
    setIsOpen(true);

    setError("");
    setSuccess("");

    setSelectedAppointmentId("");

    setPaymentMethod("CASH");

    loadAppointments();
  }

  /*
  |--------------------------------------------------------------------------
  | FECHAR
  |--------------------------------------------------------------------------
  */

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);

    setError("");
    setSuccess("");

    setSelectedAppointmentId("");

    setPaymentMethod("CASH");
  }

  /*
  |--------------------------------------------------------------------------
  | AGENDAMENTO SELECIONADO
  |--------------------------------------------------------------------------
  */

  const selectedAppointment =
    useMemo(() => {
      return (
        appointments.find(
          (appointment) =>
            appointment.id ===
            selectedAppointmentId,
        ) ?? null
      );
    }, [
      appointments,
      selectedAppointmentId,
    ]);

  /*
  |--------------------------------------------------------------------------
  | PREÇO SELECIONADO
  |--------------------------------------------------------------------------
  */

  const selectedPrice = useMemo(() => {
    if (!selectedAppointment) {
      return 0;
    }

    return getNumericPrice(
      selectedAppointment.service?.price,
    );
  }, [selectedAppointment]);

  /*
  |--------------------------------------------------------------------------
  | ALTERAR AGENDAMENTO
  |--------------------------------------------------------------------------
  */

  function handleAppointmentChange(
    appointmentId: string,
  ) {
    setSelectedAppointmentId(
      appointmentId,
    );

    setError("");
    setSuccess("");
  }

  /*
  |--------------------------------------------------------------------------
  | REGISTRAR PAGAMENTO
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedAppointment) {
      setError(
        "Selecione um agendamento.",
      );

      return;
    }

    if (!selectedPrice || selectedPrice <= 0) {
      setError(
        `O serviço "${selectedAppointment.service.name}" está sem preço. Defina o preço em Serviços antes de receber o pagamento.`,
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "/api/appointments/payments",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            appointmentId:
              selectedAppointment.id,

            method: paymentMethod,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível registrar o pagamento.",
        );
      }

      setSuccess(
        data?.message ||
          "Pagamento registrado com sucesso!",
      );

      /*
       * Remove imediatamente da lista.
       *
       * Como o pagamento foi criado, ele não deve aparecer
       * novamente na lista de pagamentos pendentes.
       */

      setAppointments(
        (current) =>
          current.filter(
            (appointment) =>
              appointment.id !==
              selectedAppointment.id,
          ),
      );

      toast.success(
        `Pagamento de ${formatPrice(
          selectedPrice,
        )} recebido.`,
      );

      /*
       * Atualizar dashboard e agenda.
       */

      onPaymentCreated?.();

      window.dispatchEvent(
        new Event(
          "appointments:changed",
        ),
      );

      /*
       * Limpar seleção.
       */

      setSelectedAppointmentId("");

      setPaymentMethod("CASH");

      /*
       * Fechar depois de um pequeno intervalo.
       */

      window.setTimeout(() => {
        setIsOpen(false);
        setSuccess("");
      }, 1000);
    } catch (err) {
      console.error(
        "Erro ao registrar pagamento:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o pagamento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RECARREGAR QUANDO MODAL ABRIR
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    loadAppointments();
  }, [isOpen]);

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* ==========================================================
          BOTÃO
      ========================================================== */}

      <button
        type="button"
        onClick={handleOpen}
        className="
          inline-flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-gray-200
          bg-white
          px-5
          py-3
          text-sm
          font-semibold
          text-gray-900
          shadow-sm
          transition-all
          duration-200
          hover:bg-gray-50
          hover:shadow-md
          active:scale-[0.98]

          dark:border-gray-800
          dark:bg-gray-900
          dark:text-white
          dark:hover:bg-gray-800

          sm:w-auto
        "
      >
        <CreditCard className="h-4 w-4" />

        Receber Pagamento
      </button>

      {/* ==========================================================
          MODAL
      ========================================================== */}

      {isOpen && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/50
            px-4
            py-6
            backdrop-blur-sm

            dark:bg-black/75
          "
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !isSubmitting
            ) {
              handleClose();
            }
          }}
        >
          <div
            className="
              flex
              max-h-[90vh]
              w-full
              max-w-lg
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              text-gray-900
              shadow-2xl

              dark:border-gray-800
              dark:bg-gray-950
              dark:text-white
            "
          >
            {/* ==================================================
                HEADER
            ================================================== */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-gray-100
                px-6
                py-5

                dark:border-gray-800
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-semibold
                    text-gray-900

                    dark:text-white
                  "
                >
                  Receber pagamento
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500

                    dark:text-gray-400
                  "
                >
                  Registe um pagamento.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Fechar"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-400
                  transition

                  hover:bg-gray-100
                  hover:text-gray-900

                  dark:hover:bg-gray-800
                  dark:hover:text-white

                  disabled:opacity-50
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ==================================================
                CONTEÚDO COM SCROLL
            ================================================== */}

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                overscroll-contain
                px-6
                py-6

                [scrollbar-width:thin]
                [scrollbar-color:#d1d5db_transparent]

                dark:[scrollbar-color:#4b5563_transparent]
              "
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* ==================================================
                    ERRO
                ================================================== */}

                {error && (
                  <div
                    className="
                      rounded-xl
                      border
                      border-red-200
                      bg-red-50
                      px-4
                      py-3
                      text-sm
                      text-red-700

                      dark:border-red-900/50
                      dark:bg-red-950/40
                      dark:text-red-300
                    "
                  >
                    {error}
                  </div>
                )}

                {/* ==================================================
                    SUCESSO
                ================================================== */}

                {success && (
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-emerald-200
                      bg-emerald-50
                      px-4
                      py-3
                      text-sm
                      text-emerald-700

                      dark:border-emerald-900/50
                      dark:bg-emerald-950/40
                      dark:text-emerald-300
                    "
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />

                    {success}
                  </div>
                )}

                {/* ==================================================
                    AGENDAMENTO
                ================================================== */}

                <div>
                  <label
                    htmlFor="payment-appointment"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-gray-700

                      dark:text-gray-300
                    "
                  >
                    Agendamento
                  </label>

                  <select
                    id="payment-appointment"
                    value={
                      selectedAppointmentId
                    }
                    onChange={(event) =>
                      handleAppointmentChange(
                        event.target.value,
                      )
                    }
                    disabled={
                      isLoading ||
                      isSubmitting
                    }
                    required
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

                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10

                      disabled:bg-gray-50

                      dark:border-gray-800
                      dark:bg-gray-900
                      dark:text-white
                      dark:disabled:bg-gray-900
                    "
                  >
                    <option value="">
                      {isLoading
                        ? "Carregando agendamentos..."
                        : appointments.length ===
                            0
                          ? "Nenhum agendamento confirmado"
                          : "Selecione o agendamento"}
                    </option>

                    {appointments.map(
                      (appointment) => {
                        const price =
                          getNumericPrice(
                            appointment
                              .service
                              ?.price,
                          );

                        return (
                          <option
                            key={
                              appointment.id
                            }
                            value={
                              appointment.id
                            }
                          >
                            {
                              appointment
                                .client
                                .name
                            }
                            {" — "}
                            {
                              appointment
                                .service
                                .name
                            }
                            {" — "}
                            {formatPrice(
                              price,
                            )}
                          </option>
                        );
                      },
                    )}
                  </select>

                  {!isLoading &&
                    appointments.length ===
                      0 && (
                      <p
                        className="
                          mt-2
                          text-xs
                          text-gray-500

                          dark:text-gray-400
                        "
                      >
                        Só agendamentos
                        confirmados e sem
                        pagamento aparecem
                        aqui.
                      </p>
                    )}
                </div>

                {/* ==================================================
                    DADOS DO AGENDAMENTO
                ================================================== */}

                {selectedAppointment && (
                  <div
                    className="
                      space-y-4
                      rounded-2xl
                      border
                      border-gray-200
                      bg-gray-50
                      p-5

                      dark:border-gray-800
                      dark:bg-gray-900
                    "
                  >
                    {/* CLIENTE */}

                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-white
                          text-gray-600
                          shadow-sm

                          dark:bg-gray-800
                          dark:text-gray-300
                        "
                      >
                        <UserRound className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-xs
                            text-gray-400
                          "
                        >
                          Cliente
                        </p>

                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-gray-900

                            dark:text-white
                          "
                        >
                          {
                            selectedAppointment
                              .client
                              .name
                          }
                        </p>
                      </div>
                    </div>

                    {/* SERVIÇO */}

                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-white
                          text-gray-600
                          shadow-sm

                          dark:bg-gray-800
                          dark:text-gray-300
                        "
                      >
                        <Scissors className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-xs
                            text-gray-400
                          "
                        >
                          Serviço
                        </p>

                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-gray-900

                            dark:text-white
                          "
                        >
                          {
                            selectedAppointment
                              .service
                              .name
                          }
                        </p>
                      </div>
                    </div>

                    {/* DATA */}

                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-white
                          text-gray-600
                          shadow-sm

                          dark:bg-gray-800
                          dark:text-gray-300
                        "
                      >
                        <CalendarDays className="h-4 w-4" />
                      </div>

                      <div>
                        <p
                          className="
                            text-xs
                            text-gray-400
                          "
                        >
                          Data
                        </p>

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-gray-900

                            dark:text-white
                          "
                        >
                          {formatDate(
                            selectedAppointment.date,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* PROFISSIONAL */}

                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-white
                          text-gray-600
                          shadow-sm

                          dark:bg-gray-800
                          dark:text-gray-300
                        "
                      >
                        <Clock className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-xs
                            text-gray-400
                          "
                        >
                          Profissional
                        </p>

                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-gray-900

                            dark:text-white
                          "
                        >
                          {
                            selectedAppointment
                              .professional
                              .name
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================
                    VALOR A RECEBER
                ================================================== */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-blue-100
                    bg-blue-50
                    p-5

                    dark:border-blue-900/40
                    dark:bg-blue-950/30
                  "
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p
                        className="
                          text-sm
                          font-medium
                          text-blue-700

                          dark:text-blue-300
                        "
                      >
                        Valor a receber
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-blue-600/70

                          dark:text-blue-400/70
                        "
                      >
                        Preço definido no
                        serviço
                      </p>
                    </div>

                    <Banknote
                      className="
                        h-5
                        w-5
                        text-blue-600

                        dark:text-blue-400
                      "
                    />
                  </div>

                  <div
                    className="
                      mt-4
                      text-3xl
                      font-bold
                      tracking-tight
                      text-gray-950

                      dark:text-white
                    "
                  >
                    {selectedAppointment
                      ? formatPrice(
                          selectedPrice,
                        )
                      : "—"}
                  </div>

                  {selectedAppointment && (
                    <p
                      className="
                        mt-2
                        text-xs
                        text-blue-700/70

                        dark:text-blue-300/70
                      "
                    >
                      Serviço:{" "}
                      <strong>
                        {
                          selectedAppointment
                            .service
                            .name
                        }
                      </strong>
                    </p>
                  )}
                </div>

                {/* ==================================================
                    MÉTODO DE PAGAMENTO
                ================================================== */}

                <div>
                  <label
                    htmlFor="payment-method"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-gray-700

                      dark:text-gray-300
                    "
                  >
                    Método de pagamento
                  </label>

                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target
                          .value as PaymentMethod,
                      )
                    }
                    disabled={isSubmitting}
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

                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10

                      dark:border-gray-800
                      dark:bg-gray-900
                      dark:text-white
                    "
                  >
                    <option value="CASH">
                      Dinheiro
                    </option>

                    <option value="TRANSFER">
                      Transferência
                    </option>

                    <option value="CARD">
                      Cartão
                    </option>

                    <option value="MOBILE_MONEY">
                      Multicaixa Express
                    </option>
                  </select>
                </div>

                {/* ==================================================
                    RESUMO
                ================================================== */}

                {selectedAppointment &&
                  selectedPrice > 0 && (
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        border
                        border-gray-200
                        px-4
                        py-3

                        dark:border-gray-800
                      "
                    >
                      <div>
                        <p
                          className="
                            text-xs
                            text-gray-500

                            dark:text-gray-400
                          "
                        >
                          Total a pagar
                        </p>

                        <p
                          className="
                            text-sm
                            font-medium
                            text-gray-900

                            dark:text-white
                          "
                        >
                          {
                            selectedAppointment
                              .service
                              .name
                          }
                        </p>
                      </div>

                      <p
                        className="
                          text-lg
                          font-bold
                          text-gray-900

                          dark:text-white
                        "
                      >
                        {formatPrice(
                          selectedPrice,
                        )}
                      </p>
                    </div>
                  )}

                {/* ==================================================
                    BOTÕES
                ================================================== */}

                <div
                  className="
                    flex
                    flex-col-reverse
                    gap-3
                    border-t
                    border-gray-100
                    pt-5

                    dark:border-gray-800

                    sm:flex-row
                    sm:justify-end
                  "
                >
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-5
                      py-3
                      text-sm
                      font-medium
                      text-gray-700
                      transition

                      hover:bg-gray-50

                      dark:border-gray-800
                      dark:bg-gray-900
                      dark:text-gray-300
                      dark:hover:bg-gray-800

                      disabled:cursor-not-allowed
                      disabled:opacity-50

                      sm:w-auto
                    "
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !selectedAppointmentId ||
                      selectedPrice <= 0
                    }
                    className="
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gray-900
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      transition

                      hover:bg-gray-800
                      active:scale-[0.98]

                      dark:bg-white
                      dark:text-gray-900
                      dark:hover:bg-gray-100

                      disabled:cursor-not-allowed
                      disabled:opacity-50

                      sm:w-auto
                    "
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="
                            h-4
                            w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-white/30
                            border-t-white

                            dark:border-gray-400/30
                            dark:border-t-gray-900
                          "
                        />

                        Registrando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />

                        Confirmar pagamento
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}