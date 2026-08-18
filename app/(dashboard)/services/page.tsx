import ServicesHeader from "@/components/services/ServicesHeader";
import ServiceStats from "@/components/services/ServiceStats";
import ServicesList from "@/components/services/ServicesList";

export default function ServicesPage() {
  return (
    <div className="space-y-8 p-6">
      <ServicesHeader />

      <ServiceStats />

      <ServicesList />
    </div>
  );
}
