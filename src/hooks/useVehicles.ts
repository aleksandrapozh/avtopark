"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { http } from "@/lib/http";
import type {
  VehicleCreateInput,
  VehicleUpdateInput,
} from "@/lib/validators/vehicle";

// Тип, который нам отдаёт API (совпадает с полями сущности)
export type VehicleDTO = {
  vehicleId: number;
  licensePlate: string;
  brandModel: string;
  vin: string;
  year: number;
  mileage: number;
  status: string;
};

const KEY = ["vehicles"] as const;

// Список всех ТС
export function useVehicles() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => http.get<VehicleDTO[]>("/api/vehicles"),
  });
}

// Одна машина по ID
export function useVehicle(id: number | null) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => http.get<VehicleDTO>(`/api/vehicles/${id}`),
    enabled: id !== null && Number.isInteger(id) && id > 0,
  });
}

// Создание
export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VehicleCreateInput) =>
      http.post<VehicleDTO>("/api/vehicles", data),
    onSuccess: () => {
      // Сбрасываем кэш списка — при следующем рендере список подтянется заново
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

// Обновление
export function useUpdateVehicle(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VehicleUpdateInput) =>
      http.patch<VehicleDTO>(`/api/vehicles/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

// Удаление
export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      http.delete<{ ok: true }>(`/api/vehicles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}