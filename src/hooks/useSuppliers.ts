"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { SupplierCreateInput, SupplierUpdateInput } from "@/lib/validators/supplier";

export type SupplierDTO = {
  supplierId: number;
  supplierName: string;
  inn: string;
  phone: string;
  email: string | null;
  address: string;
};

const KEY = ["suppliers"] as const;

export function useSuppliers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => http.get<SupplierDTO[]>("/api/suppliers"),
  });
}

export function useSupplier(id: number | null) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => http.get<SupplierDTO>(`/api/suppliers/${id}`),
    enabled: id !== null && Number.isInteger(id) && id > 0,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierCreateInput) =>
      http.post<SupplierDTO>("/api/suppliers", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateSupplier(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SupplierUpdateInput) =>
      http.patch<SupplierDTO>(`/api/suppliers/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      http.delete<{ ok: true }>(`/api/suppliers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}