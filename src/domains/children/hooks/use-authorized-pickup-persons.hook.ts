import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../../shared";

export interface AuthorizedPickupPerson {
  id: number;
  childId: number;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  photo?: string;
  idDocument?: string;
}

export const useAuthorizedPickupPersons = (childId?: number) => {
  return useQuery<AuthorizedPickupPerson[]>({
    queryKey: ["authorized-pickup-persons", childId],
    queryFn: async () => {
      if (!childId) {
        console.log("🔍 No childId provided, returning empty array");
        return [];
      }

      try {
        console.log("🔍 Fetching authorized pickup persons for child:", childId);
        
        // Fetch child with relationships
        const childResponse = await axiosInstance.get(`/children/${childId}`);
        const child = childResponse.data;
        
        console.log("🔍 Child data:", child);
        
        if (!child) {
          console.log("🔍 Child not found");
          return [];
        }

        // Get authorized pickup persons from child data
        const authorizedPersons = child.authorizedPickupPersons || [];
        
        console.log("🔍 Authorized pickup persons for child:", authorizedPersons);
        
        return authorizedPersons;
      } catch (error) {
        console.error("🔍 Error fetching authorized pickup persons:", error);
        return [];
      }
    },
    enabled: !!childId, // Only run when childId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
