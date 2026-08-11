
"use client";

import { useState } from "react";

export function ReceivePayment() {
  const [open, setOpen] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Aqui poderás futuramente enviar o pagamento para a API.
    setOpen(false);
  }

  return (
    <>
      {/* Botão principal */}
      <button
        type="button"
        onClick={() => setOpen(true)}
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
          text-gray-700
          shadow-sm
          transition-all
          duration-200
          hover:border-gray-300
          hover:bg-gray-50
          hover:shadow-md
          active:scale-[0.98]
          sm:w-auto
        "
      >
        <span className="text-base">₿</span>
        <span>Receber Pagamento</span>
      </button>

      {/* Modal */}
      {open && (
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
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
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
            onClick={(event) => event.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between px-5 py-5 sm:px-6">
              <div className="flex min-w-0 gap-4">
                {/* Ícone */}
                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 sm:flex">
                  <span className="text-lg font-bold">
                    Kz
                  </span>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-600">
                    Financeiro
                  </p>

                  <h2
                    id="payment-title"
                    className="text-xl font-semibold tracking-tight text-gray-900"
                  >
                    Receber pagamento
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Registe o pagamento de um atendimento.
                  </p>
                </div>
              </div>

              {/* Fechar */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar modal"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
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

            {/* Separador */}
            <div className="h-px bg-gray-100" />

            {/* Formulário */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto px-5 py-6 sm:px-6"
            >
              <div className="space-y-5">

                {/* Cliente */}
                <div>
                  <label
                    htmlFor="payment-client"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Cliente
                  </label>

                  <input
                    id="payment-client"
                    type="text"
                    placeholder="Ex.: João Silva"
                    required
                    autoComplete="name"
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

                {/* Agendamento */}
                <div>
                  <label
                    htmlFor="payment-appointment"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Agendamento
                  </label>

                  <select
                    id="payment-appointment"
                    required
                    defaultValue=""
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
                  >
                    <option value="" disabled>
                      Selecionar agendamento
                    </option>

                    <option value="1">
                      João Silva — Corte Premium
                    </option>

                    <option value="2">
                      Maria Santos — Barba
                    </option>

                    <option value="3">
                      Pedro Manuel — Coloração
                    </option>
                  </select>
                </div>

                {/* Valor */}
                <div>
                  <label
                    htmlFor="payment-amount"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Valor recebido
                  </label>

                  <div className="relative">
                    <input
                      id="payment-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-4
                        py-3
                        pr-14
                        text-sm
                        font-medium
                        text-gray-900
                        outline-none
                        transition-all
                        placeholder:text-gray-400
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                      Kz
                    </span>
                  </div>
                </div>

                {/* Método */}
                <div>
                  <label
                    htmlFor="payment-method"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Método de pagamento
                  </label>

                  <select
                    id="payment-method"
                    required
                    defaultValue=""
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
                  >
                    <option value="" disabled>
                      Selecionar método
                    </option>

                    <option value="cash">
                      Dinheiro
                    </option>

                    <option value="transfer">
                      Transferência bancária
                    </option>

                    <option value="card">
                      Cartão
                    </option>

                    <option value="multicaixa">
                      Multicaixa Express
                    </option>
                  </select>
                </div>

                {/* Observações */}
                <div>
                  <label
                    htmlFor="payment-notes"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Observações
                    <span className="ml-1 font-normal text-gray-400">
                      (opcional)
                    </span>
                  </label>

                  <textarea
                    id="payment-notes"
                    rows={3}
                    placeholder="Adicione alguma observação..."
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

                {/* Resumo */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Estado do pagamento
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      A receber
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
                  type="submit"
                  className="
                    w-full
                    rounded-xl
                    bg-green-600
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:bg-green-700
                    hover:shadow-md
                    active:scale-[0.98]
                    sm:w-auto
                  "
                >
                  Confirmar pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

