import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../shared";
import { 
  Attendance, 
  CreateAttendanceData, 
  UpdateAttendanceData, 
  CheckInData, 
  CheckOutData, 
  AttendanceStatus,
  ChildWithStatus 
} from "../types/attendance.types";

// Get today's attendance
export const useTodayAttendance = () => {
  return useQuery<Attendance[]>({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const response = await axiosInstance.get("/attendance/today");
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Get attendance records with pagination
export const useAttendanceList = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ["attendance", "list", page, pageSize],
    queryFn: async () => {
      const response = await axiosInstance.get(`/attendance?page=${page}&take=${pageSize}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get attendance by child
export const useChildAttendance = (childId: number, page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ["attendance", "child", childId, page, pageSize],
    queryFn: async () => {
      const response = await axiosInstance.get(`/attendance/child/${childId}?page=${page}&take=${pageSize}`);
      return response.data;
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get attendance status for a child
export const useAttendanceStatus = (childId: number, date?: string) => {
  return useQuery<AttendanceStatus>({
    queryKey: ["attendance", "status", childId, date],
    queryFn: async () => {
      const url = date 
        ? `/attendance/status/${childId}?date=${date}`
        : `/attendance/status/${childId}`;
      const response = await axiosInstance.get(url);
      return response.data;
    },
    enabled: !!childId,
    staleTime: 30 * 1000,
  });
};

// Get children with attendance status for today
export const useChildrenWithStatus = () => {
  return useQuery<ChildWithStatus[]>({
    queryKey: ["attendance", "children-with-status"],
    queryFn: async () => {
      // This will need to be implemented in the backend
      // For now, we'll fetch children and their status separately
      const [childrenResponse, attendanceResponse] = await Promise.all([
        axiosInstance.get("/children"),
        axiosInstance.get("/attendance/today")
      ]);
      
      const children = childrenResponse.data.data || childrenResponse.data;
      const todayAttendance = attendanceResponse.data;
      
      // Map children with their attendance status
      return children.map((child: any) => {
        const attendance = todayAttendance.find((att: any) => att.childId === child.id);
        return {
          ...child,
          attendanceStatus: {
            isPresent: !!attendance,
            isCheckedIn: !!attendance?.checkInTime,
            isCheckedOut: !!attendance?.checkOutTime,
            attendance
          }
        };
      });
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

// Create attendance record
export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateAttendanceData) => {
      const response = await axiosInstance.post("/attendance", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

// Update attendance record
export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAttendanceData }) => {
      const response = await axiosInstance.patch(`/attendance/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

// Check in child
export const useCheckIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CheckInData) => {
      const response = await axiosInstance.post("/attendance/check-in", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

// Check out child
export const useCheckOut = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CheckOutData) => {
      const response = await axiosInstance.post("/attendance/check-out", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

// Delete attendance record
export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/attendance/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};
