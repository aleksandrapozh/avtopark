"use client";

import { useParams } from "next/navigation";
import { DriverForm } from "@/components/drivers/DriverForm";
import { useDriver, useUpdateDriver } from "@/hooks/useDrivers";

export default function EditDriverPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data, isLoading, error } = useDriver(Number.isInteger(id) ? id : null);
  const update = useUpdateDriver(id);

  if (!Number.isInteger(id) || id <= 0) {
    return <p style={{ color: "crimson" }}>Некорректный ID</p>;
  }
  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "crimson" }}>{(error as Error).message}</p>;
  if (!data) return <p>Не найдено</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>
        Редактирование: {data.lastName} {data.firstName}
      </h1>
      <DriverForm
        initial={data}
        onSubmit={(formData) => update.mutateAsync(formData)}
        submitLabel="Сохранить"
      />
    </div>
  );
}