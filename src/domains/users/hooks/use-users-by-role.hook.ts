import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../../shared";

export interface UserByRole {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  permissions: string;
}

export const useUsersByRole = (roles: string[]) => {
  return useQuery<UserByRole[]>({
    queryKey: ["users", "by-role", roles],
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
        
        const filteredUsers = users.filter((user: any) => 
          user.isActive === true && roles.includes(user.permissions)
        );
        
        return filteredUsers;
      } catch (error) {
        console.error("🔍 Error fetching users by role:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
