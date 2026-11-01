"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { UserCreateInput, UserUpdateInput } from "@/lib/validators/user";

export type UserDTO = {
  userId: number;
  login: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  role: string;
  email: string;
  isActive: number;
};

const KEY = ["users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => http.get<UserDTO[]>("/api/users"),
  });
}

export function useUser(id: number | null) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => http.get<UserDTO>(`/api/users/${id}`),
    enabled: id !== null && Number.isInteger(id) && id > 0,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreateInput) => http.post<UserDTO>("/api/users", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserUpdateInput) => http.patch<UserDTO>(`/api/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete<{ ok: true }>(`/api/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}