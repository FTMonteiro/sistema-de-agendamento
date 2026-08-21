"use client";

import {
  ReactNode,
  useCallback,
  useState,
} from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  /*
   * Abaixo de lg o menu lateral vira um drawer, aberto pelo botão no header.
   * A partir de lg ele é fixo e este estado deixa de ter efeito.
   */
  const [isDrawerOpen, setIsDrawerOpen] =
    useState(false);

  /*
   * Referências estáveis: o Sidebar usa onClose dentro de efeitos, e uma
   * arrow recriada a cada render fá-los correr sem necessidade.
   */
  const closeDrawer = useCallback(
    () => setIsDrawerOpen(false),
    [],
  );

  const openDrawer = useCallback(
    () => setIsDrawerOpen(true),
    [],
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        open={isDrawerOpen}
        onClose={closeDrawer}
      />

      {/* Área principal. min-w-0 impede que conteúdo largo (tabelas) estique
          o flex item e empurre o layout para fora da viewport. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={openDrawer} />

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
