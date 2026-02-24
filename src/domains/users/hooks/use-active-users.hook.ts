import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../../shared";

export interface ActiveUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export const useActiveUsers = () => {
  return useQuery<ActiveUser[]>({
    queryKey: ["users", "active"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/users");
        
        // Handle different response structures
        let users = [];
        if (response.data?.data) {
          users = response.data.data;
        } else if (Array.isArray(response.data)) {
          users = response.data;
        } else {
          console.error("🔍 Unexpected users response structure:", response.data);
          return [];
        }
        
        // Temporarily returning all users for debugging
        // const activeUsers = users.filter((user: any) => user.isActive === true);
        
        return users;
      } catch (error) {
        console.error("🔍 Error fetching users:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
