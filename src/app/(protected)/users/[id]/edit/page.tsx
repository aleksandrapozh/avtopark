"use client";
import { useParams } from "next/navigation";
import { UserForm } from "@/components/users/UserForm";
import { useUser, useUpdateUser } from "@/hooks/useUsers";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading, error } = useUser(Number.isInteger(id) ? id : null);
  const update = useUpdateUser(id);

  if (!Number.isInteger(id) || id <= 0) return <p>Некорректный ID</p>;
  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>{(error as Error).message}</p>;
  if (!data) return <p>Не найдено</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Редактирование: {data.login}</h1>
      <UserForm initial={data} onSubmit={(formData) => update.mutateAsync(formData)} submitLabel="Сохранить" />
    </div>
  );
}