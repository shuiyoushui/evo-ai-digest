import { useQuery } from "@tanstack/react-query";
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
      return data as DisplayModule[];
    },
  });
}
