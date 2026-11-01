"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { FineCreateInput, FineUpdateInput } from "@/lib/validators/fine";
import type { VehicleDTO } from "./useVehicles";
import type { DriverDTO } from "./useDrivers"; // <-- ДОБАВИЛИ ИМПОРТ

export type FineDTO = {
  fineId: number;
  vehicleId: number;
  violationDate: string;
  amount: string;
  articleNumber: string;
  status: string;
  vehicle?: VehicleDTO;
  driver?: DriverDTO | null; // <-- ДОБАВИЛИ ВОДИТЕЛЯ (может быть null)
};

const KEY = ["fines"] as const;

export function useFines() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => http.get<FineDTO[]>("/api/fines"),
  });
}

export function useFine(id: number | null) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => http.get<FineDTO>(`/api/fines/${id}`),
    enabled: id !== null && Number.isInteger(id) && id > 0,
  });
}

export function useCreateFine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FineCreateInput) =>
      http.post<FineDTO>("/api/fines", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateFine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FineUpdateInput }) =>
      http.patch<FineDTO>(`/api/fines/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteFine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      http.delete<{ ok: true }>(`/api/fines/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}