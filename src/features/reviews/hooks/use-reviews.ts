import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReviewsApi } from "../api/reviews.api";

export function useReview(walkId: string, enabled = true) {
  return useQuery({
    queryKey: ["reviews", walkId],
    queryFn: () => ReviewsApi.getByWalkId(walkId),
    enabled: Boolean(walkId) && enabled,
  });
}

export function useSubmitReview(walkId: string, walkerId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      rating,
      comment,
      isUpdate,
    }: {
      rating: number;
      comment: string;
      isUpdate: boolean;
    }) =>
      isUpdate
        ? ReviewsApi.update(walkId, { rating, comment })
        : ReviewsApi.submit(walkId, { rating, comment, walkerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", walkId] });
      queryClient.invalidateQueries({ queryKey: ["walks", walkId] });
      queryClient.invalidateQueries({ queryKey: ["walks"] });
    },
  });
}
