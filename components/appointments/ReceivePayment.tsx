"use client";

import { useState } from "react";

export function ReceivePayment() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão Receber Pagamento */}
      <button
        type="button"
        onClick={() => setOpen(true)}
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
          transition
          hover:bg-gray-50
        "
      >
        Receber Pagamento
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
            bg-black/20
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-2xl
              bg-white
              p-6
              shadow-xl
            "
          >
            {/* Cabeçalho */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Receber pagamento
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Registe um novo pagamento.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 transition hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            {/* Formulário */}
            <form className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Cliente
                </label>

                <input
                  type="text"
                  placeholder="Nome do cliente"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />
              </div>

              {/* Agendamento */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Agendamento
                </label>

                <select
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:ring-2
                    focus:ring-blue-500
                  "
                >
                  <option value="">Selecionar agendamento</option>
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
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Valor
                </label>

                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-gray-200
                      px-4
                      py-3
                      pr-14
                      outline-none
                      transition
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    Kz
                  </span>
                </div>
              </div>

              {/* Método de pagamento */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Método de pagamento
                </label>

                <select
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:ring-2
                    focus:ring-blue-500
                  "
                >
                  <option value="">Selecionar método</option>
                  <option value="cash">Dinheiro</option>
                  <option value="transfer">Transferência</option>
                  <option value="card">Cartão</option>
                  <option value="multicaixa">Multicaixa Express</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Observações
                </label>

                <textarea
                  rows={3}
                  placeholder="Observações sobre o pagamento..."
                  className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
                    transition
                    hover:bg-gray-50
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
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