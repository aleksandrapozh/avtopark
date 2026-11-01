"use client";

import { useParams, useRouter } from "next/navigation";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { useVehicle, useUpdateVehicle } from "@/hooks/useVehicles";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data, isLoading, error } = useVehicle(Number.isInteger(id) ? id : null);
  const update = useUpdateVehicle(id);

  if (!Number.isInteger(id) || id <= 0) {
    return <p style={{ color: "crimson" }}>Некорректный ID</p>;
  }

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "crimson" }}>{(error as Error).message}</p>;
  if (!data) return <p>Не найдено</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Редактирование: {data.licensePlate}</h1>
      <VehicleForm
        initial={data}
        onSubmit={(formData) => update.mutateAsync(formData)}
        submitLabel="Сохранить"
      />
    </div>
  );
}