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
        console.log("🔍 Fetching users by roles:", roles);
        const response = await axiosInstance.get("/users");
        console.log("🔍 Users response:", response);
        
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
        
        console.log("🔍 All users:", users);
        console.log("🔍 User roles found:", users.map((u: any) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, permissions: u.permissions, isActive: u.isActive })));
        const filteredUsers = users.filter((user: any) => 
          user.isActive === true && roles.includes(user.permissions)
        );
        console.log(`🔍 Users with roles ${roles.join(', ')}:`, filteredUsers);
        
        return filteredUsers;
      } catch (error) {
        console.error("🔍 Error fetching users by role:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
