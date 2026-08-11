"use client";

import { useState } from "react";

export default function ServicesHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        {/* Informações */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
              Serviços
            </h1>

            <span className="hidden rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 sm:inline-flex">
              Gestão
            </span>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Gerencie os serviços, preços e duração do seu estabelecimento.
          </p>
        </div>

        {/* Ação principal */}
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
            bg-gray-950
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-all
            duration-200
            hover:bg-gray-800
            hover:shadow-md
            active:scale-[0.98]
            focus:outline-none
            focus:ring-2
            focus:ring-gray-950
            focus:ring-offset-2
            sm:w-auto
          "
        >
          <span className="text-lg leading-none">+</span>
          Novo serviço
        </button>
      </header>

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
            className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-2xl
              animate-[fadeIn_180ms_ease-out]
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 5v14M5 12h14"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-950">
                      Novo serviço
                    </h2>

                    <p className="mt-0.5 text-sm text-gray-500">
                      Adicione um novo serviço ao estabelecimento.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar modal"
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
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            {/* Formulário */}
            <div className="space-y-5 px-6 py-6">
              {/* Nome */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Nome do serviço
                </label>

                <input
                  type="text"
                  placeholder="Ex.: Corte Premium"
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
                    placeholder:text-gray-400
                    outline-none
                    transition-all
                    duration-200
                    hover:border-gray-300
                    focus:border-gray-900
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />
              </div>

              {/* Descrição */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-800">
                    Descrição
                  </label>

                  <span className="text-xs text-gray-400">Opcional</span>
                </div>

                <textarea
                  placeholder="Descreva brevemente o serviço..."
                  rows={3}
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
                    leading-6
                    text-gray-900
                    placeholder:text-gray-400
                    outline-none
                    transition-all
                    duration-200
                    hover:border-gray-300
                    focus:border-gray-900
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />
              </div>

              {/* Preço + duração */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Preço */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Preço
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      placeholder="10.000"
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
                        placeholder:text-gray-400
                        outline-none
                        transition-all
                        duration-200
                        hover:border-gray-300
                        focus:border-gray-900
                        focus:ring-4
                        focus:ring-gray-100
                      "
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                      Kz
                    </span>
                  </div>
                </div>

                {/* Duração */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Duração
                  </label>

                  <select
                    defaultValue=""
                    className="
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-gray-700
                      outline-none
                      transition-all
                      duration-200
                      hover:border-gray-300
                      focus:border-gray-900
                      focus:ring-4
                      focus:ring-gray-100
                    "
                  >
                    <option value="" disabled>
                      Selecionar duração
                    </option>

                    <option value="30">30 minutos</option>

                    <option value="45">45 minutos</option>

                    <option value="60">1 hora</option>

                    <option value="90">1h 30min</option>

                    <option value="120">2 horas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-5 sm:flex-row sm:justify-end">
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
                  transition-all
                  duration-200
                  hover:bg-gray-50
                  hover:text-gray-900
                  active:scale-[0.98]
                  sm:w-auto
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                className="
                  w-full
                  rounded-xl
                  bg-gray-950
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:bg-gray-800
                  hover:shadow-md
                  active:scale-[0.98]
                  sm:w-auto
                "
              >
                Criar serviço
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
