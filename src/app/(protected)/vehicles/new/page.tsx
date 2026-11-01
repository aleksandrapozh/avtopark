"use client";

import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { useCreateVehicle } from "@/hooks/useVehicles";

export default function NewVehiclePage() {
  const create = useCreateVehicle();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Новое транспортное средство</h1>
      <VehicleForm
        onSubmit={(data) => create.mutateAsync(data)}
        submitLabel="Создать"
      />
    </div>
  );
}