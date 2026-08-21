"use client";

import { useCallback, useEffect, useState } from "react";

import ServicesHeader from "@/components/services/ServicesHeader";
import ServiceStats from "@/components/services/ServiceStats";
import ServicesList, {
  Service,
} from "@/components/services/ServicesList";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/services", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível carregar os serviços.",
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "A API retornou um formato inválido.",
        );
      }

      const normalizedServices: Service[] = data.map(
        (item: any) => ({
          id: String(item.id ?? ""),
          name: String(item.name ?? ""),
          description:
            item.description == null
              ? null
              : String(item.description),
          price: Number(item.price ?? 0),
          duration: Number(item.duration ?? 0),
          active: item.active === true,
          businessId: String(item.businessId ?? ""),
          createdAt: String(item.createdAt ?? ""),
          updatedAt: String(item.updatedAt ?? ""),
        }),
      );

      setServices(normalizedServices);
    } catch (error) {
      console.error(
        "Erro ao carregar serviços:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao carregar serviços.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  function handleServiceCreated(service: Service) {
    setServices((current) => [
      service,
      ...current,
    ]);
  }

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Gestão
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-950">
            Serviços
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            A carregar serviços...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">
            Erro ao carregar serviços
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadServices}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-8 p-6">
      <ServicesHeader
        onServiceCreated={handleServiceCreated}
      />

      <ServiceStats
        services={services}
      />

      <ServicesList
        services={services}
        onServicesChange={setServices}
      />
    </main>
  );
} 