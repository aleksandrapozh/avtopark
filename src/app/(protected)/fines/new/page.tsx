"use client";
import { FineForm } from "@/components/fines/FineForm";
import { useCreateFine } from "@/hooks/useFines";

export default function NewFinePage() {
  const create = useCreateFine();
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Новый штраф</h1>
      <FineForm onSubmit={(data) => create.mutateAsync(data)} submitLabel="Создать" />
    </div>
  );
}