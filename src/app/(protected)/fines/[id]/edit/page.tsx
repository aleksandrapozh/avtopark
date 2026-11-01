"use client";
import { useParams } from "next/navigation";
import { FineForm } from "@/components/fines/FineForm";
import { useFine, useUpdateFine } from "@/hooks/useFines";

export default function EditFinePage() {
    const params = useParams<{ id: string }>();
    const id = Number(params.id);
    const { data, isLoading, error } = useFine(Number.isInteger(id) ? id : null);
    const update = useUpdateFine();

    if (!Number.isInteger(id) || id <= 0) return <p>Некорректный ID</p>;
    if (isLoading) return <p>Загрузка...</p>;
    if (error) return <p>{(error as Error).message}</p>;
    if (!data) return <p>Не найдено</p>;

    return (
        <div>
            <h1 style={{ marginTop: 0 }}>Редактирование штрафа</h1>
            <FineForm
                initial={data}
                onSubmit={(formData) => update.mutateAsync({ id, data: formData })} // <--- Передаем объект
                submitLabel="Сохранить"
            />
        </div>
    );
}