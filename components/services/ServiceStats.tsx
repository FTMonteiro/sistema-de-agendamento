
export default function ServiceStats() {
  const stats = [
    {
      label: "Total de serviços",
      value: "12",
      description: "+2 este mês",
      descriptionClass: "text-emerald-600",
      icon: "Σ",
    },
    {
      label: "Serviços ativos",
      value: "10",
      description: "83% do total",
      descriptionClass: "text-gray-500",
      icon: "✓",
    },
    {
      label: "Serviços inativos",
      value: "2",
      description: "Atualmente",
      descriptionClass: "text-gray-500",
      icon: "−",
    },
  ];

  return (
    <section
      className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        xl:grid-cols-3
      "
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-gray-200/80
            bg-white
            p-5
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >
          {/* Indicador lateral */}
          <div
            className="
              absolute
              left-0
              top-0
              h-full
              w-1
              bg-gray-900
              opacity-0
              transition-opacity
              duration-200
              group-hover:opacity-100
            "
          />

          {/* Conteúdo principal */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="
                  text-sm
                  font-medium
                  text-gray-500
                "
              >
                {stat.label}
              </p>

              <h2
                className="
                  mt-3
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-gray-950
                "
              >
                {stat.value}
              </h2>
            </div>

            {/* Ícone */}
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gray-50
                text-gray-600
                transition-colors
                duration-200
                group-hover:bg-gray-100
              "
            >
              <span className="text-sm font-semibold">
                {stat.icon}
              </span>
            </div>
          </div>

          {/* Informação inferior */}
          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              border-t
              border-gray-100
              pt-4
            "
          >
            <span
              className={`
                text-sm
                font-medium
                ${stat.descriptionClass}
              `}
            >
              {stat.description}
            </span>

            <span
              className="
                text-xs
                text-gray-400
                transition-colors
                duration-200
                group-hover:text-gray-500
              "
            >
              Serviços
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}

