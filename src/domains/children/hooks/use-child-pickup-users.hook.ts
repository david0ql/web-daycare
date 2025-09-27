import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../../shared";

export interface PickupUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  permissions: string;
}

export const useChildPickupUsers = (childId?: number) => {
  return useQuery<PickupUser[]>({
    queryKey: ["users", "pickup", childId],
    queryFn: async () => {
      if (!childId) {
        console.log("🔍 No childId provided, returning empty array");
        return [];
      }

      try {
        console.log("🔍 Fetching pickup users for child:", childId);
        
        // Fetch child with relationships
        const childResponse = await axiosInstance.get(`/children/${childId}`);
        const child = childResponse.data;
        
        console.log("🔍 Child data:", child);
        
        if (!child) {
          console.log("🔍 Child not found");
          return [];
        }

        // Get all pickup user IDs from relationships
        const pickupUserIds = new Set<number>();
        
        // From authorized_pickup_persons
        if (child.authorizedPickupPersons) {
          child.authorizedPickupPersons.forEach((person: any) => {
            if (person.userId) {
              pickupUserIds.add(person.userId);
            }
          });
        }
        
        // From emergency_contacts
        if (child.emergencyContacts) {
          child.emergencyContacts.forEach((contact: any) => {
            if (contact.userId) {
              pickupUserIds.add(contact.userId);
            }
          });
        }
        
        // From parent_child_relationships
        if (child.parentChildRelationships) {
          child.parentChildRelationships.forEach((relationship: any) => {
            if (relationship.parentId) {
              pickupUserIds.add(relationship.parentId);
            }
          });
        }
        
        console.log("🔍 Pickup user IDs found:", Array.from(pickupUserIds));
        
        if (pickupUserIds.size === 0) {
          console.log("🔍 No pickup users found for child");
          return [];
        }

        // Fetch all users and filter by pickup user IDs
        const usersResponse = await axiosInstance.get("/users");
        let allUsers = [];
        if (usersResponse.data?.data) {
          allUsers = usersResponse.data.data;
        } else if (Array.isArray(usersResponse.data)) {
          allUsers = usersResponse.data;
        }
        
        const pickupUsers = allUsers.filter((user: any) => 
          user.isActive === true && pickupUserIds.has(user.id)
        );
        
        console.log("🔍 Pickup users for child:", pickupUsers);
        
        return pickupUsers;
      } catch (error) {
        console.error("🔍 Error fetching pickup users:", error);
        return [];
      }
    },
    enabled: !!childId, // Only run when childId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
