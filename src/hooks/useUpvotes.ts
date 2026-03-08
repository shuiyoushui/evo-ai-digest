import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserUpvotes(userId?: string) {
  return useQuery({
    queryKey: ["user-upvotes", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upvotes")
        .select("product_id")
        .eq("user_id", userId!);
      if (error) throw error;
      return new Set((data || []).map((u) => u.product_id));
    },
  });
}

export function useToggleUpvote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      productId,
      isUpvoted,
    }: {
      userId: string;
      productId: string;
      isUpvoted: boolean;
    }) => {
      if (isUpvoted) {
        const { error } = await supabase
          .from("upvotes")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("upvotes")
          .insert({ user_id: userId, product_id: productId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-upvotes"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
