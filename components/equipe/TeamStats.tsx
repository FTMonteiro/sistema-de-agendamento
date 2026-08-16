"use client";

import { TeamMember } from "@/data/Team";

interface TeamStatsProps {
  members: TeamMember[];
}

const statsConfig = [
  {
    key: "total",
    label: "Total da equipe",
    description: "profissionais cadastrados",
  },
  {
    key: "active",
    label: "Profissionais ativos",
    description: "atualmente ativos",
  },
  {
    key: "inactive",
    label: "Profissionais inativos",
    description: "precisam de atenção",
  },
] as const;

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ActiveIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function InactiveIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export default function TeamStats({ members }: TeamStatsProps) {
  const total = members.length;

  const active = members.filter(
    (member) =>
      member.status.toLowerCase() === "ativo" ||
      member.status.toLowerCase() === "active",
  ).length;

  const inactive = total - active;

  const values = {
    total,
    active,
    inactive,
  };

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {statsConfig.map((stat) => {
        const value = values[stat.key];

        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

        const Icon =
          stat.key === "total"
            ? UsersIcon
            : stat.key === "active"
              ? ActiveIcon
              : InactiveIcon;

        return (
          <article
            key={stat.key}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-gray-100
              bg-white
              p-5
              shadow-sm
              transition-all
              duration-300
              ease-out
              hover:-translate-y-[1px]
              hover:border-gray-200
              hover:shadow-md
            "
          >
            {/* Brilho extremamente discreto */}
            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-gray-200
                opacity-0
                transition-opacity
                duration-300
                group-hover:opacity-100
              "
            />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
                  {value}
                </h2>
              </div>

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-50
                  text-gray-500
                  transition-all
                  duration-300
                  group-hover:bg-gray-100
                  group-hover:text-gray-900
                "
              >
                <Icon />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">{stat.description}</p>

              <span className="whitespace-nowrap text-xs font-semibold text-gray-500">
                {percentage}% da equipe
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
