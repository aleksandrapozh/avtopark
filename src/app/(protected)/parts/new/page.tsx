"use client";
import { PartForm } from "@/components/parts/PartForm";
import { useCreatePart } from "@/hooks/useParts";

export default function NewPartPage() {
  const create = useCreatePart();
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Новая запчасть</h1>
      <PartForm onSubmit={(data) => create.mutateAsync(data)} submitLabel="Добавить" />
    </div>
  );
}