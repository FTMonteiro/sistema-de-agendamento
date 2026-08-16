"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

import { BusinessSettings } from "./BusinessSettings";

export function SettingsPage() {
  const [business, setBusiness] = useState({
    name: "Lumina Beauty",
    phone: "+244 923 000 000",
    email: "contato@luminabeauty.com",
    address: "Luanda, Angola",
    logo: "",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(
      "business-settings",
      JSON.stringify(business)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* CONTEÚDO */}
      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center gap-2 text-sm text-[var(--muted)]">
          <span>Admin</span>

          <span>›</span>

          <span className="font-medium text-[var(--foreground)]">
            Configurações
          </span>
        </div>

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Configurações
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Gerencie as informações do seu estabelecimento.
          </p>
        </div>

        {/* TABS */}
        <div className="mb-8 flex border-b border-[var(--border)]">

          <div className="flex items-center gap-2 border-b-2 border-primary px-5 pb-3 text-sm font-medium text-[var(--foreground)]">
            <Building2 size={17} />

            Dados do estabelecimento
          </div>

        </div>

        {/* CONTEÚDO */}
        <BusinessSettings
          business={business}
          setBusiness={setBusiness}
        />

      </div>

      {/* BARRA INFERIOR */}
      <div className="sticky bottom-0 z-20 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          {/* STATUS */}
          <div className="text-sm text-[var(--muted)]">
            {saved ? (
              <span className="text-green-600">
                ✓ Alterações salvas
              </span>
            ) : (
              "Última alteração: agora"
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">

            {/* CANCELAR */}
            <button
              type="button"
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
            >
              Cancelar
            </button>

            {/* SALVAR */}
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-[var(--background)] shadow-sm transition hover:opacity-90"
            >
              Salvar alterações
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}