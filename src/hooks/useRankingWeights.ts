import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RankingWeights {
  id: string;
  upvotes: number;
  views: number;
  comments: number;
  decay: number;
  updated_at: string;
}

export function useRankingWeights() {
  return useQuery({
    queryKey: ["ranking_weights"],
    queryFn: async (): Promise<RankingWeights> => {
      const { data, error } = await supabase
        .from("ranking_weights")
        .select("*")
        .eq("id", "default")
        .single();
      if (error) throw error;
      return data as RankingWeights;
    },
  });
}

export function useUpdateRankingWeights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (weights: Partial<Omit<RankingWeights, "id" | "updated_at">>) => {
      const { error } = await supabase
        .from("ranking_weights")
        .update({ ...weights, updated_at: new Date().toISOString() } as any)
        .eq("id", "default");
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ranking_weights"] }),
  });
}
