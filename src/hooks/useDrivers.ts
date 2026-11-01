"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { DriverCreateInput, DriverUpdateInput } from "@/lib/validators/driver";

export type DriverDTO = {
  driverId: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  licenseNumber: string;
  phone: string;
  status: string;
};

const KEY = ["drivers"] as const;

export function useDrivers() {
  return useQuery({ queryKey: KEY, queryFn: () => http.get<DriverDTO[]>("/api/drivers") });
}

export function useDriver(id: number | null) {
  return useQuery({ 
    queryKey: [...KEY, id], 
    queryFn: () => http.get<DriverDTO>(`/api/drivers/${id}`), 
    enabled: id !== null && Number.isInteger(id) && id > 0 
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (d: DriverCreateInput) => http.post<DriverDTO>("/api/drivers", d), 
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) 
  });
}

// ИЗМЕНЕНО: теперь принимает объект { id, data }
export function useUpdateDriver() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: ({ id, data }: { id: number; data: DriverUpdateInput }) => 
      http.patch<DriverDTO>(`/api/drivers/${id}`, data), 
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) 
  });
}

export function useDeleteDriver() {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (id: number) => http.delete<{ ok: true }>(`/api/drivers/${id}`), 
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) 
  });
}