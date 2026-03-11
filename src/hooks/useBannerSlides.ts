import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BannerSlide {
  id: string;
  title: string;
  cta: string;
  link: string;
  active: boolean;
  gradient: string;
  sort_order: number;
}

export function useBannerSlides() {
  return useQuery({
    queryKey: ["banner_slides"],
    queryFn: async (): Promise<BannerSlide[]> => {
      const { data, error } = await supabase
        .from("banner_slides")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as BannerSlide[];
    },
  });
}

export function useCreateBannerSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slide: Omit<BannerSlide, "sort_order"> & { sort_order?: number }) => {
      const { error } = await supabase.from("banner_slides").insert(slide as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banner_slides"] }),
  });
}

export function useUpdateBannerSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BannerSlide> & { id: string }) => {
      const { error } = await supabase.from("banner_slides").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banner_slides"] }),
  });
}

export function useDeleteBannerSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banner_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banner_slides"] }),
  });
}
