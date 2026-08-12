"use client";

import { useMemo, useState } from "react";

type Service = {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: string;
  active: boolean;
};

const initialServices: Service[] = [
  {
    id: 1,
    name: "Corte Premium",
    description: "Corte de cabelo profissional",
    duration: "45 min",
    price: "10.000 Kz",
    active: true,
  },
  {
    id: 2,
    name: "Barba",
    description: "Barba completa",
    duration: "30 min",
    price: "5.000 Kz",
    active: true,
  },
  {
    id: 3,
    name: "Coloração",
    description: "Coloração completa",
    duration: "90 min",
    price: "25.000 Kz",
    active: true,
  },
];

type Filter = "all" | "active" | "inactive";

export default function ServicesList() {
  const [services, setServices] =
    useState<Service[]>(initialServices);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [deletingService, setDeletingService] =
    useState<Service | null>(null);

  const filteredServices = useMemo(() => {
    const query = search.toLowerCase().trim();

    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && service.active) ||
        (filter === "inactive" && !service.active);

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, services]);

  // EDITAR
  function handleEdit(service: Service) {
    setEditingService({ ...service });
    setOpenMenu(null);
  }

  // GUARDAR EDIÇÃO
  function handleSaveEdit() {
    if (!editingService) return;

    setServices((current) =>
      current.map((service) =>
        service.id === editingService.id
          ? editingService
          : service
      )
    );

    setEditingService(null);
  }

  // DUPLICAR
  function handleDuplicate(service: Service) {
    const duplicatedService: Service = {
      ...service,
      id: Date.now(),
      name: `${service.name} (cópia)`,
      active: false,
    };

    setServices((current) => [
      ...current,
      duplicatedService,
    ]);

    setOpenMenu(null);
  }

  // ATIVAR / DESATIVAR
  function handleToggleStatus(service: Service) {
    setServices((current) =>
      current.map((item) =>
        item.id === service.id
          ? {
              ...item,
              active: !item.active,
            }
          : item
      )
    );

    setOpenMenu(null);
  }

  // ELIMINAR
  function handleDelete() {
    if (!deletingService) return;

    setServices((current) =>
      current.filter(
        (service) => service.id !== deletingService.id
      )
    );

    setDeletingService(null);
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Toolbar */}
        <div className="border-b border-gray-100 p-5 sm:p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Pesquisa */}
            <div className="relative w-full lg:max-w-md">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-gray-400
                "
              >
                <circle cx="11" cy="11" r="7" />
                <path
                  strokeLinecap="round"
                  d="m20 20-4-4"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Pesquisar serviços..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  py-3
                  pl-11
                  pr-4
                  text-sm
                  text-gray-900
                  outline-none
                  transition-all
                  duration-200
                  placeholder:text-gray-400
                  hover:border-gray-300
                  focus:border-gray-900
                  focus:bg-white
                  focus:ring-4
                  focus:ring-gray-100
                "
              />

            </div>

            {/* Filtro */}
            <div className="flex w-full items-center gap-3 sm:w-auto">

              <span className="hidden text-sm font-medium text-gray-500 sm:block">
                Filtrar:
              </span>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value as Filter
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-3
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  outline-none
                  transition-all
                  duration-200
                  hover:border-gray-300
                  focus:border-gray-900
                  focus:ring-4
                  focus:ring-gray-100
                  sm:w-44
                "
              >
                <option value="all">
                  Todos os serviços
                </option>

                <option value="active">
                  Apenas ativos
                </option>

                <option value="inactive">
                  Apenas inativos
                </option>
              </select>

            </div>
          </div>

          {/* Resultado */}
          {(search || filter !== "all") && (
            <div className="mt-4 flex items-center justify-between">

              <p className="text-sm text-gray-500">
                {filteredServices.length}{" "}
                {filteredServices.length === 1
                  ? "serviço encontrado"
                  : "serviços encontrados"}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="
                  text-sm
                  font-medium
                  text-gray-500
                  transition
                  hover:text-gray-900
                "
              >
                Limpar filtros
              </button>

            </div>
          )}

        </div>

        {/* Cabeçalho */}
        <div
          className="
            hidden
            grid-cols-[minmax(0,2fr)_120px_140px_120px_48px]
            gap-6
            border-b
            border-gray-100
            bg-gray-50/60
            px-6
            py-3.5
            text-[11px]
            font-semibold
            uppercase
            tracking-wider
            text-gray-400
            md:grid
          "
        >
          <span>Serviço</span>
          <span>Duração</span>
          <span>Preço</span>
          <span>Status</span>
          <span />
        </div>

        {/* Lista */}
        <div className="divide-y divide-gray-100">

          {filteredServices.length === 0 ? (

            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path
                    strokeLinecap="round"
                    d="m20 20-4-4"
                  />
                </svg>
              </div>

              <p className="font-semibold text-gray-900">
                Nenhum serviço encontrado
              </p>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Tente alterar a pesquisa ou remover os
                filtros aplicados.
              </p>

            </div>

          ) : (

            filteredServices.map((service) => (

              <article
                key={service.id}
                className="
                  group
                  px-5
                  py-5
                  transition-colors
                  duration-200
                  hover:bg-gray-50/70
                  sm:px-6
                "
              >

                <div
                  className="
                    grid
                    gap-5
                    md:grid-cols-[minmax(0,2fr)_120px_140px_120px_48px]
                    md:items-center
                    md:gap-6
                  "
                >

                  {/* Serviço */}
                  <div className="min-w-0">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          flex
                          h-10
                          w-10
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
                        {service.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-semibold text-gray-900">
                          {service.name}
                        </p>

                        <p className="mt-1 truncate text-sm text-gray-500">
                          {service.description}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Duração */}
                  <div className="flex items-center justify-between md:block">

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400 md:hidden">
                      Duração
                    </span>

                    <span className="text-sm font-medium text-gray-700">
                      {service.duration}
                    </span>

                  </div>

                  {/* Preço */}
                  <div className="flex items-center justify-between md:block">

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400 md:hidden">
                      Preço
                    </span>

                    <span className="text-sm font-semibold text-gray-900">
                      {service.price}
                    </span>

                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between md:block">

                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400 md:hidden">
                      Status
                    </span>

                    {service.active ? (

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          bg-emerald-50
                          px-3
                          py-1.5
                          text-xs
                          font-semibold
                          text-emerald-700
                        "
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Ativo
                      </span>

                    ) : (

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          bg-gray-100
                          px-3
                          py-1.5
                          text-xs
                          font-semibold
                          text-gray-600
                        "
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        Inativo
                      </span>

                    )}

                  </div>

                  {/* AÇÕES */}
                  <div className="relative flex justify-end">

                    <button
                      type="button"
                      aria-label={`Ações para ${service.name}`}
                      onClick={() =>
                        setOpenMenu(
                          openMenu === service.id
                            ? null
                            : service.id
                        )
                      }
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        text-gray-400
                        transition-all
                        duration-200
                        hover:bg-gray-100
                        hover:text-gray-900
                        lg:opacity-0
                        lg:group-hover:opacity-100
                      "
                    >
                      <span className="text-xl leading-none">
                        ⋯
                      </span>
                    </button>

                    {/* MENU */}
                    {openMenu === service.id && (

                      <div
                        className="
                          absolute
                          right-0
                          top-11
                          z-40
                          w-52
                          overflow-hidden
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          p-1.5
                          shadow-xl
                          shadow-gray-200/50
                        "
                      >

                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(service)
                          }
                          className="
                            w-full
                            rounded-lg
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            font-medium
                            text-gray-700
                            transition
                            hover:bg-gray-50
                          "
                        >
                          Editar serviço
                        </button>

                        {/* Duplicar */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDuplicate(service)
                          }
                          className="
                            w-full
                            rounded-lg
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            font-medium
                            text-gray-700
                            transition
                            hover:bg-gray-50
                          "
                        >
                          Duplicar serviço
                        </button>

                        {/* Ativar / Desativar */}
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(service)
                          }
                          className="
                            w-full
                            rounded-lg
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            font-medium
                            text-gray-700
                            transition
                            hover:bg-gray-50
                          "
                        >
                          {service.active
                            ? "Desativar serviço"
                            : "Ativar serviço"}
                        </button>

                        <div className="my-1.5 border-t border-gray-100" />

                        {/* Eliminar */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingService(service);
                            setOpenMenu(null);
                          }}
                          className="
                            w-full
                            rounded-lg
                            px-3
                            py-2.5
                            text-left
                            text-sm
                            font-medium
                            text-red-600
                            transition
                            hover:bg-red-50
                          "
                        >
                          Eliminar serviço
                        </button>

                      </div>
                    )}

                  </div>

                </div>

              </article>

            ))

          )}

        </div>

        {/* Rodapé */}
        <footer className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <p className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-medium text-gray-900">
              {filteredServices.length}
            </span>{" "}
            de{" "}
            <span className="font-medium text-gray-900">
              {services.length}
            </span>{" "}
            serviços
          </p>

        </footer>

      </section>

      {/* ==================================================
          MODAL EDITAR
      ================================================== */}

      {editingService && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            px-4
          "
        >

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Editar serviço
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Atualize as informações do serviço.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingService(null)
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-xl
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-700
                "
              >
                ×
              </button>

            </div>

            <div className="space-y-5">

              {/* Nome */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nome do serviço
                </label>

                <input
                  type="text"
                  value={editingService.name}
                  onChange={(event) =>
                    setEditingService({
                      ...editingService,
                      name: event.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-gray-900
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />

              </div>

              {/* Descrição */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Descrição
                </label>

                <textarea
                  rows={3}
                  value={editingService.description}
                  onChange={(event) =>
                    setEditingService({
                      ...editingService,
                      description:
                        event.target.value,
                    })
                  }
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-gray-900
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />

              </div>

              {/* Preço / Duração */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Preço
                  </label>

                  <input
                    type="text"
                    value={editingService.price}
                    onChange={(event) =>
                      setEditingService({
                        ...editingService,
                        price: event.target.value,
                      })
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-gray-900
                      focus:ring-4
                      focus:ring-gray-100
                    "
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Duração
                  </label>

                  <select
                    value={editingService.duration}
                    onChange={(event) =>
                      setEditingService({
                        ...editingService,
                        duration:
                          event.target.value,
                      })
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
                      outline-none
                      focus:border-gray-900
                      focus:ring-4
                      focus:ring-gray-100
                    "
                  >
                    <option>30 min</option>
                    <option>45 min</option>
                    <option>60 min</option>
                    <option>90 min</option>
                    <option>120 min</option>
                  </select>

                </div>

              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setEditingService(null)
                }
                className="
                  rounded-xl
                  border
                  border-gray-200
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="
                  rounded-xl
                  bg-gray-950
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-white
                  hover:bg-gray-800
                "
              >
                Guardar alterações
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ==================================================
          CONFIRMAR ELIMINAÇÃO
      ================================================== */}

      {deletingService && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            px-4
          "
        >

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6">

              <div
                className="
                  mb-4
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-50
                  font-bold
                  text-red-600
                "
              >
                !
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                Eliminar serviço?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">

                Tem certeza que deseja eliminar{" "}

                <span className="font-semibold text-gray-900">
                  {deletingService.name}
                </span>

                ? Esta ação não poderá ser desfeita.

              </p>

            </div>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setDeletingService(null)
                }
                className="
                  rounded-xl
                  border
                  border-gray-200
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="
                  rounded-xl
                  bg-red-600
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-white
                  hover:bg-red-700
                "
              >
                Eliminar
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}