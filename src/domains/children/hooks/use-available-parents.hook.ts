import { useQuery } from "@tanstack/react-query";
import { AvailableParent } from "../types/child.types";
import { axiosInstance } from "../../../shared";

export const useAvailableParents = () => {
  return useQuery<AvailableParent[]>({
    queryKey: ["available-parents"],
    queryFn: async () => {
      const response = await axiosInstance.get("/children/available-parents");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
