"use client";
import { useParams } from "next/navigation";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { useSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";

export default function EditSupplierPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading, error } = useSupplier(Number.isInteger(id) ? id : null);
  const update = useUpdateSupplier(id);

  if (!Number.isInteger(id) || id <= 0) return <p>Некорректный ID</p>;
  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>{(error as Error).message}</p>;
  if (!data) return <p>Не найдено</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Редактирование: {data.supplierName}</h1>
      <SupplierForm initial={data} onSubmit={(formData) => update.mutateAsync(formData)} submitLabel="Сохранить" />
    </div>
  );
}