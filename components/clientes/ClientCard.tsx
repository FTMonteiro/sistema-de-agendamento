
import { Client } from "@/types/clients";

interface Props {
  client: Client;
}

export function ClientCard({ client }: Props) {
  const initial = client.name.charAt(0).toUpperCase();

  const isActive =
    client.status.toLowerCase() === "ativo";

  return (
    <article
      className="
        group
        rounded-2xl
        bg-white
        p-5
        shadow-sm
        ring-1
        ring-gray-100
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* Avatar */}
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-50
              text-sm
              font-semibold
              text-blue-600
            "
          >
            {initial}
          </div>

          {/* Informações */}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-900">
              {client.name}
            </h2>

            <p className="mt-0.5 truncate text-xs text-gray-500">
              {client.email}
            </p>
          </div>
        </div>

        {/* Menu */}
        <button
          type="button"
          aria-label={`Mais opções para ${client.name}`}
          className="
            flex
            h-8
            w-8
            shrink-0
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
      </div>

      {/* Informações */}
      <div className="mt-5 space-y-3">
        {/* Telefone */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Telefone
          </span>

          <span className="text-sm font-medium text-gray-900">
            {client.phone}
          </span>
        </div>

        {/* Visitas */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Visitas
          </span>

          <span className="text-sm font-semibold text-gray-900">
            {client.visits}
          </span>
        </div>
      </div>

      {/* Separador */}
      <div className="my-4 h-px bg-gray-100" />

      {/* Rodapé */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          Estado
        </span>

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
      </div>
    </article>
  );
}

