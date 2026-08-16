"use client";

import {
  Monitor,
  Moon,
  Palette,
  Save,
  Sun,
} from "lucide-react";

//import { useTheme } from "@/components/theme/ThemeProvider";

interface AppearanceData {
  primaryColor: string;
}

interface AppearanceSettingsProps {
  appearance: AppearanceData;
  setAppearance: React.Dispatch<
    React.SetStateAction<AppearanceData>
  >;
  onSave: () => void;
}

const colors = [
  "#009685",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#16A34A",
];

export function AppearanceSettings({
  appearance,
  setAppearance,
  onSave,
}: AppearanceSettingsProps) {
 // const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Aparência
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Personalize a aparência do sistema.
        </p>
      </div>

      {/* TEMA */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">

        <div className="border-b border-[var(--border)] px-6 py-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Tema
          </h3>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Escolha como o sistema deve aparecer.
          </p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">

          {/* CLARO */}
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`rounded-2xl border p-4 text-left transition ${
             
            }`}
          >
            <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-gray-100">
              <Sun
                size={32}
                className="text-gray-700"
              />
            </div>

            <p className="text-sm font-semibold text-[var(--foreground)]">
              Claro
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Interface clara e limpa.
            </p>
          </button>

          {/* ESCURO */}
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`rounded-2xl border p-4 text-left transition ${
              theme === "dark"
                ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                : "border-[var(--border)] hover:border-primary/50"
            }`}
          >
            <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-gray-900">
              <Moon
                size={32}
                className="text-white"
              />
            </div>

            <p className="text-sm font-semibold text-[var(--foreground)]">
              Escuro
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Interface escura para ambientes com pouca luz.
            </p>
          </button>

          {/* SISTEMA */}
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`rounded-2xl border p-4 text-left transition ${
              theme === "system"
                ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                : "border-[var(--border)] hover:border-primary/50"
            }`}
          >
            <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-gradient-to-r from-gray-100 to-gray-900">
              <Monitor
                size={32}
                className="text-gray-500"
              />
            </div>

            <p className="text-sm font-semibold text-[var(--foreground)]">
              Sistema
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Segue automaticamente o tema do dispositivo.
            </p>
          </button>

        </div>
      </div>

      {/* COR PRINCIPAL */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">

        <div className="border-b border-[var(--border)] px-6 py-5">

          <div className="flex items-center gap-2">
            <Palette
              size={18}
              className="text-[var(--muted)]"
            />

            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Cor principal
            </h3>
          </div>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Escolha a cor principal utilizada na interface.
          </p>

        </div>

        <div className="p-6">

          <div className="flex flex-wrap items-center gap-3">

            {colors.map((color) => {
              const selected =
                appearance.primaryColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setAppearance((prev) => ({
                      ...prev,
                      primaryColor: color,
                    }))
                  }
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                    selected
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: color,
                  }}
                  aria-label={`Selecionar cor ${color}`}
                >
                  {selected && (
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  )}
                </button>
              );
            })}

            {/* COR PERSONALIZADA */}
            <label
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-300 transition hover:border-gray-400"
              style={{
                backgroundColor:
                  !colors.includes(
                    appearance.primaryColor
                  )
                    ? appearance.primaryColor
                    : undefined,
              }}
            >
              {colors.includes(
                appearance.primaryColor
              ) && (
                <span className="text-lg text-gray-400">
                  +
                </span>
              )}

              <input
                type="color"
                value={appearance.primaryColor}
                onChange={(e) =>
                  setAppearance((prev) => ({
                    ...prev,
                    primaryColor: e.target.value,
                  }))
                }
                className="sr-only"
              />
            </label>

          </div>

          {/* PREVIEW */}
          <div className="mt-5 flex items-center gap-3">

            <div
              className="h-10 w-10 rounded-xl"
              style={{
                backgroundColor:
                  appearance.primaryColor,
              }}
            />

            <div>

              <p className="text-sm font-medium text-[var(--foreground)]">
                Cor selecionada
              </p>

              <p className="text-xs uppercase text-[var(--muted)]">
                {appearance.primaryColor}
              </p>

            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end border-t border-[var(--border)] px-6 py-4">

          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            <Save size={17} />

            Salvar alterações
          </button>

        </div>

      </div>

    </div>
  );
}