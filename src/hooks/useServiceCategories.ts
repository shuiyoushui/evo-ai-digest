import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  sort_order: number;
  enabled: boolean;
  parent_id: string | null;
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
    mutationFn: async (cat: { label: string; icon?: string; description?: string; sort_order?: number; parent_id?: string | null }) => {
      const { error } = await supabase
        .from("service_categories")
        .insert(cat);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service_categories"] });
    },
  });
}

export function useUpdateServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: Partial<ServiceCategory> & { id: string }) => {
      const { id, ...updates } = cat;
      const { error } = await supabase
        .from("service_categories")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service_categories"] });
    },
  });
}

export function useDeleteServiceCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service_categories"] });
    },
  });
}
