"use client";

import { DriverForm } from "@/components/drivers/DriverForm";
import { useCreateDriver } from "@/hooks/useDrivers";

export default function NewDriverPage() {
  const create = useCreateDriver();
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Новый водитель</h1>
      <DriverForm
        onSubmit={(data) => create.mutateAsync(data)}
        submitLabel="Создать"
      />
    </div>
  );
}