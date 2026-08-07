import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({
  children
}: DashboardLayoutProps) {

  return (

    <div className="flex min-h-screen bg-gray-50">

      {/* Menu lateral */}
      <Sidebar />


      {/* Área principal */}
      <div className="flex flex-1 flex-col">


        {/* Barra superior */}
        <Header />


        {/* Conteúdo das páginas */}
        <main className="flex-1 p-6">

          {children}

        </main>


      </div>

    </div>

  );
}