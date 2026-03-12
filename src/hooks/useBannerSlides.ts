import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BannerSlide {
  id: string;
  title: string;
  cta: string;
  link: string;
  active: boolean;
  gradient: string;
  sort_order: number;
  image_url?: string;
}

export function useBannerSlides() {
  return useQuery({
    queryKey: ["banner_slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_slides")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as BannerSlide[];
    },
  });
}
