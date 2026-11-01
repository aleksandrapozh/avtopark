"use client";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { useCreateSupplier } from "@/hooks/useSuppliers";

export default function NewSupplierPage() {
  const create = useCreateSupplier();
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Новый поставщик</h1>
      <SupplierForm onSubmit={(data) => create.mutateAsync(data)} submitLabel="Создать" />
    </div>
  );
}