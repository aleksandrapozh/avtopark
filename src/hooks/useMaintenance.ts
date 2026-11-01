"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { MaintenanceCreateInput } from "@/lib/validators/maintenance";
import type { VehicleDTO } from "./useVehicles";
import type { PartDTO } from "./useParts";

export type MaintenanceDTO = {
  maintenanceId: number;
  vehicleId: number;
  partId: number;
  maintenanceDate: string;
  workType: string;
  partsQuantity: number;
  totalCost: string;
  mechanicNotes: string | null;
  status: string;
  vehicle?: VehicleDTO;
  part?: PartDTO;
};

const KEY = ["maintenance"] as const;

export function useMaintenanceList() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => http.get<MaintenanceDTO[]>("/api/maintenance"),
  });
}

export function useCreateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MaintenanceCreateInput) => http.post<MaintenanceDTO>("/api/maintenance", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["parts"] });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateMaintenanceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      http.patch<MaintenanceDTO>(`/api/maintenance/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useDeleteMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete<{ ok: true }>(`/api/maintenance/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["parts"] });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}