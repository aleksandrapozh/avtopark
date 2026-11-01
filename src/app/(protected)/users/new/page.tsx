"use client";
import { UserForm } from "@/components/users/UserForm";
import { useCreateUser } from "@/hooks/useUsers";

export default function NewUserPage() {
  const create = useCreateUser();
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Новый сотрудник</h1>
      <UserForm onSubmit={(data) => create.mutateAsync(data)} submitLabel="Создать" />
    </div>
  );
}