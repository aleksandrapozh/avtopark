"use client";
import { useParams } from "next/navigation";
import { PartForm } from "@/components/parts/PartForm";
import { usePart, useUpdatePart } from "@/hooks/useParts";

export default function EditPartPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading, error } = usePart(Number.isInteger(id) ? id : null);
  const update = useUpdatePart(id);

  if (!Number.isInteger(id) || id <= 0) return <p>Некорректный ID</p>;
  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>{(error as Error).message}</p>;
  if (!data) return <p>Не найдено</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Редактирование: {data.partName}</h1>
      <PartForm initial={data} onSubmit={(formData) => update.mutateAsync(formData)} submitLabel="Сохранить" />
    </div>
  );
}