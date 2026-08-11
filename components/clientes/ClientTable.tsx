
import { clients } from "@/data/Clients";

export function ClientTable() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      {/* Cabeçalho da tabela */}
      <div className="flex flex-col gap-1 px-5 py-5 sm:px-6">
        <h2 className="text-base font-semibold tracking-tight text-gray-900">
          Lista de clientes
        </h2>

        <p className="text-sm text-gray-500">
          Clientes cadastrados no seu estabelecimento.
        </p>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-y border-gray-100 bg-gray-50/70">
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Cliente
              </th>

              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Telefone
              </th>

              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Visitas
              </th>

              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado
              </th>

              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {clients.map((client) => {
              const initial = client.name.charAt(0).toUpperCase();

              const isActive =
                client.status.toLowerCase() === "ativo";

              return (
                <tr
                  key={client.id}
                  className="group transition-colors duration-150 hover:bg-gray-50/70"
                >
                  {/* Cliente */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {client.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {client.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Telefone */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {client.phone}
                    </span>
                  </td>

                  {/* Visitas */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {client.visits}
                      </span>

                      <span className="text-xs text-gray-400">
                        visitas
                      </span>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    <span
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        ${
                          isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }
                      `}
                    >
                      <span
                        className={`
                          h-1.5
                          w-1.5
                          rounded-full
                          ${
                            isActive
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }
                        `}
                      />

                      {client.status}
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      aria-label={`Mais opções para ${client.name}`}
                      className="
                        inline-flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        text-gray-400
                        opacity-0
                        transition-all
                        duration-150
                        hover:bg-gray-100
                        hover:text-gray-900
                        group-hover:opacity-100
                      "
                    >
                      <span className="text-lg leading-none">
                        ⋮
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 sm:px-6">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">
            {clients.length}
          </span>{" "}
          clientes cadastrados
        </p>

        <button
          type="button"
          className="
            text-sm
            font-medium
            text-blue-600
            transition-colors
            hover:text-blue-700
          "
        >
          Ver todos
        </button>
      </div>
    </div>
  );
}

