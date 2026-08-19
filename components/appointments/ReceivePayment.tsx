"use client";

import { useEffect, useState } from "react";
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
    price: number | string;
    duration: number;
  };

  payment: {
    id: string;
    amount: number | string;
    method: string;
    status: string;
  } | null;
}

type PaymentMethod =
  | "CASH"
  | "CARD"
  | "TRANSFER"
  | "MOBILE_MONEY";

interface ReceivePaymentProps {
  onPaymentCreated?: () => void;
}

export function ReceivePayment({
  onPaymentCreated,
}: ReceivePaymentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [appointments, setAppointments] = useState<
    PaymentAppointment[]
  >([]);

  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState("");

  const [amount, setAmount] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");

  const [isLoading, setIsLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  function formatPrice(value: number | string) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "0 Kz";
    }

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

  async function loadAppointments() {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/appointments", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível carregar os agendamentos."
        );
      }

      const apiAppointments: PaymentAppointment[] =
        data?.appointments ?? [];

      const unpaidAppointments = apiAppointments.filter(
        (appointment) => {
          return (
            appointment.payment === null ||
            appointment.payment === undefined
          );
        }
      );

      setAppointments(unpaidAppointments);
    } catch (err) {
      console.error("Erro ao carregar pagamentos:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar os agendamentos."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpen() {
    setIsOpen(true);
    setError("");
    setSuccess("");
    setSelectedAppointmentId("");
    setAmount("");
    setPaymentMethod("CASH");

    loadAppointments();
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
    setError("");
    setSuccess("");
    setSelectedAppointmentId("");
    setAmount("");
    setPaymentMethod("CASH");
  }

  const selectedAppointment =
    appointments.find(
      (appointment) =>
        appointment.id === selectedAppointmentId
    ) ?? null;

  function handleAppointmentChange(
    appointmentId: string
  ) {
    setSelectedAppointmentId(appointmentId);
    setError("");
    setSuccess("");

    const appointment = appointments.find(
      (item) => item.id === appointmentId
    );

    if (!appointment) {
      setAmount("");
      return;
    }

    setAmount(String(appointment.service.price));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedAppointmentId) {
      setError("Selecione um agendamento.");
      return;
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Informe um valor válido.");
      return;
    }

    try {
      setIsSubmitting(true);

      /*
       * IMPORTANTE:
       *
       * Sua API está em:
       *
       * /api/appointments/payments
       *
       * e NÃO em:
       *
       * /api/payments
       */

      const response = await fetch(
        "/api/appointments/payments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId: selectedAppointmentId,
            amount: numericAmount,
            method: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível registrar o pagamento."
        );
      }

      setSuccess(
        data?.message ||
          "Pagamento registrado com sucesso!"
      );

      /*
       * Remove da lista porque agora
       * o agendamento já possui pagamento.
       */

      setAppointments((current) =>
        current.filter(
          (appointment) =>
            appointment.id !== selectedAppointmentId
        )
      );

      setSelectedAppointmentId("");
      setAmount("");
      setPaymentMethod("CASH");

      /*
       * Atualiza a página pai.
       */

      onPaymentCreated?.();

      /*
       * Fecha o modal depois de 1 segundo.
       */

      window.setTimeout(() => {
        setIsOpen(false);
        setSuccess("");
      }, 1000);
    } catch (err) {
      console.error(
        "Erro ao registrar pagamento:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o pagamento."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * Atualiza os agendamentos sempre que o modal abre.
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    loadAppointments();
  }, [isOpen]);

  return (
    <>
      {/* BOTÃO RECEBER PAGAMENTO */}

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
          sm:w-auto
        "
      >
        <CreditCard className="h-4 w-4" />
        Receber Pagamento
      </button>

      {/* MODAL */}

      {isOpen && (
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
          onClick={handleClose}
        >
          <div
            className="
              max-h-[92vh]
              w-full
              max-w-md
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) => {
              event.stopPropagation();
            }}
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
                  Receber pagamento
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Registe um pagamento.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
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
                  disabled:opacity-50
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORMULÁRIO */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6"
            >
              {/* ERRO */}

              {error && (
                <div
                  className="
                    rounded-xl
                    border
                    border-red-100
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-700
                  "
                >
                  {error}
                </div>
              )}

              {/* SUCESSO */}

              {success && (
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-emerald-100
                    bg-emerald-50
                    px-4
                    py-3
                    text-sm
                    text-emerald-700
                  "
                >
                  <CheckCircle2 className="h-4 w-4" />

                  {success}
                </div>
              )}

              {/* AGENDAMENTO */}

              <div>
                <label
                  htmlFor="payment-appointment"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Agendamento
                </label>

                <select
                  id="payment-appointment"
                  value={selectedAppointmentId}
                  onChange={(event) => {
                    handleAppointmentChange(
                      event.target.value
                    );
                  }}
                  disabled={
                    isLoading || isSubmitting
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
                  "
                >
                  <option value="">
                    {isLoading
                      ? "Carregando agendamentos..."
                      : appointments.length === 0
                        ? "Nenhum pagamento pendente"
                        : "Selecione o agendamento"}
                  </option>

                  {appointments.map(
                    (appointment) => (
                      <option
                        key={appointment.id}
                        value={appointment.id}
                      >
                        {appointment.client.name}
                        {" — "}
                        {appointment.service.name}
                        {" — "}
                        {formatPrice(
                          appointment.service.price
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DADOS DO AGENDAMENTO */}

              {selectedAppointment && (
                <div
                  className="
                    space-y-3
                    rounded-xl
                    border
                    border-gray-100
                    bg-gray-50
                    p-4
                  "
                >
                  {/* CLIENTE */}

                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        text-gray-600
                        shadow-sm
                      "
                    >
                      <UserRound className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Cliente
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {selectedAppointment.client.name}
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
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        text-gray-600
                        shadow-sm
                      "
                    >
                      <Scissors className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Serviço
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {selectedAppointment.service.name}
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
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        text-gray-600
                        shadow-sm
                      "
                    >
                      <CalendarDays className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Data
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(
                          selectedAppointment.date
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
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        text-gray-600
                        shadow-sm
                      "
                    >
                      <Clock className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Profissional
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {
                          selectedAppointment
                            .professional.name
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* VALOR */}

              <div>
                <label
                  htmlFor="payment-amount"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Valor
                </label>

                <div className="relative">
                  <Banknote
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    id="payment-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                    }}
                    placeholder="0"
                    required
                    disabled={
                      !selectedAppointment ||
                      isSubmitting
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      py-3
                      pl-10
                      pr-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                      disabled:bg-gray-50
                    "
                  />
                </div>

                {selectedAppointment && (
                  <p className="mt-2 text-xs text-gray-400">
                    Valor do serviço:{" "}
                    <strong>
                      {formatPrice(
                        selectedAppointment.service.price
                      )}
                    </strong>
                  </p>
                )}
              </div>

              {/* MÉTODO DE PAGAMENTO */}

              <div>
                <label
                  htmlFor="payment-method"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Método de pagamento
                </label>

                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(event) => {
                    setPaymentMethod(
                      event.target.value as PaymentMethod
                    );
                  }}
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
                    disabled:bg-gray-50
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

              {/* BOTÕES */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  border-t
                  border-gray-100
                  pt-5
                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-50
                    disabled:opacity-50
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !selectedAppointmentId ||
                    !amount
                  }
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
                    disabled:cursor-not-allowed
                    disabled:opacity-50
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
      )}
    </>
  );
}
