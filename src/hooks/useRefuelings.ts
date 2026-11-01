"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { RefuelingCreateInput } from "@/lib/validators/refueling";
import type { VehicleDTO } from "./useVehicles";
import type { DriverDTO } from "./useDrivers";

export type RefuelingDTO = {
  refuelingId: number;
  vehicleId: number;
  driverId: number;
  refuelingDate: string;
  fuelType: string;
  fuelAmount: string; // decimal приходит строкой
  pricePerLiter: string;
  totalCost: string;
  vehicle?: VehicleDTO;
  driver?: DriverDTO;
};

const KEY = ["refuelings"] as const;

export function useRefuelings() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => http.get<RefuelingDTO[]>("/api/refuelings"),
  });
}

export function useCreateRefueling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RefuelingCreateInput) =>
      http.post<RefuelingDTO>("/api/refuelings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useDeleteRefueling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      http.delete<{ ok: true }>(`/api/refuelings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}