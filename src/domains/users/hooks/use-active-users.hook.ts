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
        console.log("🔍 Fetching users from /users endpoint");
        console.log("🔍 Axios instance baseURL:", axiosInstance.defaults.baseURL);
        console.log("🔍 Axios instance headers:", axiosInstance.defaults.headers);
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
        // Temporarily returning all users for debugging
        // const activeUsers = users.filter((user: any) => user.isActive === true);
        console.log("🔍 Returning all users for debugging");
        
        return users;
      } catch (error) {
        console.error("🔍 Error fetching users:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
