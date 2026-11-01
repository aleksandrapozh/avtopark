"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { PartCreateInput, PartUpdateInput } from "@/lib/validators/part";

export type SupplierOfferDTO = {
  offerId: number;
  supplierId: number;
  partId: number;
  price: string;
  quantity: number;
  supplier?: { supplierName: string };
  part?: PartDTO;
};

export type PartDTO = {
  partId: number;
  categoryId: number | null;
  partNumber: string;
  partName: string;
  unit: string;
  packSize: number;
  quantity: number; // <--- ДОБАВИТЬ
  price: string;    // <--- ДОБАВИТЬ
  category?: { categoryId: number; name: string } | null;
  offers?: SupplierOfferDTO[];
};

export type CategoryDTO = { categoryId: number; name: string; };
export type MovementDTO = { movementId: number; type: string; quantity: number; reason: string | null; comment: string | null; createdAt: string; part: PartDTO; user: any; supplier: any; };

const KEY = ["parts"] as const;
const CAT_KEY = ["categories"] as const;
const MOVE_KEY = ["movements"] as const;

export function useParts() {
  return useQuery({ queryKey: KEY, queryFn: () => http.get<PartDTO[]>("/api/parts") });
}

export function useCategories() {
  return useQuery({ queryKey: CAT_KEY, queryFn: () => http.get<CategoryDTO[]>("/api/categories") });
}

export function useMovements() {
  return useQuery({ queryKey: MOVE_KEY, queryFn: () => http.get<MovementDTO[]>("/api/stock") });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => http.post<PartDTO>("/api/stock", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: MOVE_KEY });
    },
  });
}

// ... (Остальные хуки usePart, useCreatePart, useUpdatePart, useDeletePart оставь как были)
export function usePart(id: number | null) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => http.get<PartDTO>(`/api/parts/${id}`), enabled: id !== null && id > 0 });
}
export function useCreatePart() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: PartCreateInput) => http.post<PartDTO>("/api/parts", d), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}
export function useUpdatePart(id: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: PartUpdateInput) => http.patch<PartDTO>(`/api/parts/${id}`, d), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}
export function useDeletePart() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number) => http.delete<{ ok: true }>(`/api/parts/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}