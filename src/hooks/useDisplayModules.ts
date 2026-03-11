import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DisplayModule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  sort_order: number;
}

export function useDisplayModules() {
  return useQuery({
    queryKey: ["display_modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("display_modules")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data as DisplayModule[]) || [];
    },
  });
}

export function useUpdateDisplayModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DisplayModule> & { id: string }) => {
      const { error } = await supabase.from("display_modules").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["display_modules"] }),
  });
}
