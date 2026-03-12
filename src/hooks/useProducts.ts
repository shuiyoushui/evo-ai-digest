import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbProduct {
  id: string;
  name: string;
  slogan: string;
  description: string;
  logo_url: string;
  category_id: string;
  tags: string[];
  website: string;
  video_url: string;
  verified: boolean;
  featured: boolean;
  status: string;
  maker_name: string;
  maker_title: string;
  maker_avatar: string;
  company_name: string;
  company_founded: string;
  company_location: string;
  company_funding: string;
  benefits: string[];
  views: number;
  user_id: string | null;
  launch_date: string;
  created_at: string;
  updated_at: string;
  upvote_count: number;
  skills: { name: string; description: string }[] | null;
  prompts: { title: string; content: string }[] | null;
}

export function useProducts(category?: string | null) {
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_products_with_upvotes", {
        filter_status: "approved",
        filter_category: category || null,
      });
      if (error) throw error;
      return (data as DbProduct[]) || [];
    },
  });
}

export function useAllProducts() {
  return useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useMyProducts(userId?: string) {
  return useQuery({
    queryKey: ["my-products", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSubmitProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: {
      name: string;
      slogan: string;
      description: string;
      category_id: string;
      tags: string[];
      website: string;
      maker_name: string;
      maker_title: string;
      company_name: string;
      company_founded: string;
      company_location: string;
      company_funding: string;
      benefits: string[];
      user_id: string;
      skills?: { name: string; description: string }[];
      prompts?: { title: string; content: string }[];
    }) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase
        .from("products")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
}
