import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceCategory {
  id: string;
  parent_id: string | null;
  label: string;
  description: string;
  icon: string;
  sort_order: number;
  enabled: boolean;
  created_at: string | null;
}

export function useServiceCategories() {
  return useQuery({
    queryKey: ["service_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data as ServiceCategory[]) || [];
    },
  });
}

export function useCreateServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ServiceCategory> & { label: string }) => {
      const { data, error } = await supabase.from("service_categories").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service_categories"] }),
  });
}

export function useUpdateServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceCategory> & { id: string }) => {
      const { error } = await supabase.from("service_categories").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service_categories"] }),
  });
}

export function useDeleteServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service_categories"] }),
  });
}
