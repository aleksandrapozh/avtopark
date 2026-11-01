"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { WaybillCreateInput, WaybillCloseInput } from "@/lib/validators/waybill";
import type { VehicleDTO } from "./useVehicles";
import type { DriverDTO } from "./useDrivers";
import type { UserDTO } from "./useUsers"; 

// DTO для путевого листа, где подтянуты вложенные объекты
export type WaybillDTO = {
  waybillId: number;
  vehicleId: number;
  driverId: number;
  userId: number;
  waybillNumber: string;
  issueDate: string;
  startMileage: number;
  endMileage: number | null;
  fuelIssued: string; // decimal приходит строкой
  status: string;
  vehicle?: VehicleDTO;
  driver?: DriverDTO;
  user?: UserDTO;
};

const KEY = ["waybills"] as const;

export function useWaybills() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => http.get<WaybillDTO[]>("/api/waybills"),
  });
}

export function useCreateWaybill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WaybillCreateInput) =>
      http.post<WaybillDTO>("/api/waybills", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      // Важно: обновляем и список машин, так как сменился статус одной из них
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useCloseWaybill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WaybillCloseInput }) =>
      http.post<WaybillDTO>(`/api/waybills/${id}/close`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}