"use client";

import { useState } from "react";

export const Appointments = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão Novo Agendamento */}
      <button
        type="button"
        onClick={() => setOpen(true)}
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
                  Novo agendamento
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Preencha as informações do agendamento.
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

              {/* Serviço */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Serviço
                </label>

                <input
                  type="text"
                  placeholder="Ex.: Corte Premium"
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

              {/* Profissional */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Profissional
                </label>

                <input
                  type="text"
                  placeholder="Nome do profissional"
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

              {/* Data e horário */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Data
                  </label>

                  <input
                    type="date"
                    className="
                      w-full
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Horário
                  </label>

                  <input
                    type="time"
                    className="
                      w-full
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
              </div>

              {/* Observações */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Observações
                </label>

                <textarea
                  rows={3}
                  placeholder="Observações sobre o agendamento..."
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

              {/* Ações */}
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
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}