import kyInstance from "@/lib/ky";
import type { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFollowersInfo(
  userId: string,
  initialState: FollowerInfo
) {
  const query = useQuery({
    queryKey: ["followers-info", userId],
    queryFn: () =>
      kyInstance.get(`api/user/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  return query;
}
