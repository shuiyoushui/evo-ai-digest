import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LlmRecommendation {
  id: string;
  name: string;
  tag: string;
  sort_order: number;
  enabled: boolean;
  created_at: string;
}

export function useRecommendations() {
  return useQuery({
    queryKey: ["llm_recommendations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("llm_recommendations")
        .select("*")
        .eq("enabled", true)
        .order("sort_order");
      if (error) throw error;
      return (data as LlmRecommendation[]) || [];
    },
  });
}

export function useAllRecommendations() {
  return useQuery({
    queryKey: ["llm_recommendations_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("llm_recommendations")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data as LlmRecommendation[]) || [];
    },
  });
}

export function useUpdateRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rec: Partial<LlmRecommendation> & { id: string }) => {
      const { id, ...updates } = rec;
      const { error } = await supabase
        .from("llm_recommendations")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["llm_recommendations"] });
      qc.invalidateQueries({ queryKey: ["llm_recommendations_all"] });
    },
  });
}

export function useCreateRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rec: { name: string; tag: string; sort_order: number }) => {
      const { error } = await supabase
        .from("llm_recommendations")
        .insert(rec as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["llm_recommendations"] });
      qc.invalidateQueries({ queryKey: ["llm_recommendations_all"] });
    },
  });
}

export function useDeleteRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("llm_recommendations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["llm_recommendations"] });
      qc.invalidateQueries({ queryKey: ["llm_recommendations_all"] });
    },
  });
}
