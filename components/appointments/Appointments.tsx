
"use client";

import { useState } from "react";

export const Appointments = () => {
  const [open, setOpen] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Aqui poderás futuramente enviar os dados para a API.
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
        <span className="text-lg leading-none">+</span>
        <span>Novo Agendamento</span>
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
            aria-labelledby="appointment-title"
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
                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                  <span className="text-lg font-semibold">+</span>
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Agenda
                  </p>

                  <h2
                    id="appointment-title"
                    className="text-xl font-semibold tracking-tight text-gray-900"
                  >
                    Novo agendamento
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Preencha os dados para criar um novo atendimento.
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

            {/* Conteúdo */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto px-5 py-6 sm:px-6"
            >
              <div className="space-y-5">

                {/* Cliente */}
                <div>
                  <label
                    htmlFor="appointment-client"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Cliente
                  </label>

                  <input
                    id="appointment-client"
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

                {/* Serviço */}
                <div>
                  <label
                    htmlFor="appointment-service"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Serviço
                  </label>

                  <select
                    id="appointment-service"
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
                      Selecione um serviço
                    </option>

                    <option value="corte">
                      Corte Premium
                    </option>

                    <option value="barba">
                      Barba
                    </option>

                    <option value="coloracao">
                      Coloração
                    </option>

                    <option value="tratamento">
                      Tratamento
                    </option>
                  </select>
                </div>

                {/* Profissional */}
                <div>
                  <label
                    htmlFor="appointment-professional"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Profissional
                  </label>

                  <select
                    id="appointment-professional"
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
                      Selecione um profissional
                    </option>

                    <option value="carlos">
                      Carlos
                    </option>

                    <option value="pedro">
                      Pedro
                    </option>

                    <option value="ana">
                      Ana
                    </option>
                  </select>
                </div>

                {/* Data e horário */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="appointment-date"
                      className="mb-2 block text-sm font-medium text-gray-800"
                    >
                      Data
                    </label>

                    <input
                      id="appointment-date"
                      type="date"
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
                        transition-all
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-500/10
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="appointment-time"
                      className="mb-2 block text-sm font-medium text-gray-800"
                    >
                      Horário
                    </label>

                    <input
                      id="appointment-time"
                      type="time"
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
                  <label
                    htmlFor="appointment-notes"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    Observações
                    <span className="ml-1 font-normal text-gray-400">
                      (opcional)
                    </span>
                  </label>

                  <textarea
                    id="appointment-notes"
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
            </form>
          </div>
        </div>
      )}
    </>
  );
};

