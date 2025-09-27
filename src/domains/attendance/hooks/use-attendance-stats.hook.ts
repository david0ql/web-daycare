import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../../shared";
import { AttendanceStats } from "../types/attendance.types";

export const useAttendanceStats = () => {
  return useQuery<AttendanceStats>({
    queryKey: ["attendance", "stats"],
    queryFn: async () => {
      // Get today's attendance and children to calculate stats
      const [childrenResponse, attendanceResponse] = await Promise.all([
        axiosInstance.get("/children"),
        axiosInstance.get("/attendance/today")
      ]);
      
      const children = childrenResponse.data.data || childrenResponse.data;
      const todayAttendance = attendanceResponse.data;
      
      console.log("🔍 Attendance Stats - children:", children);
      console.log("🔍 Attendance Stats - todayAttendance:", todayAttendance);
      
      // Calculate stats based on check-in/check-out times, not isPresent field
      const totalChildren = children.length;
      const checkedIn = todayAttendance.filter((att: any) => att.checkInTime).length;
      const checkedOut = todayAttendance.filter((att: any) => att.checkOutTime).length;
      
      // A child is considered present if they have check-in time
      const presentToday = checkedIn;
      const absentToday = totalChildren - presentToday;
      const attendanceRate = totalChildren > 0 ? (presentToday / totalChildren) * 100 : 0;
      
      console.log("🔍 Attendance Stats - calculated:", {
        totalChildren,
        checkedIn,
        checkedOut,
        presentToday,
        absentToday,
        attendanceRate
      });
      
      return {
        totalChildren,
        presentToday,
        checkedIn,
        checkedOut,
        absentToday,
        attendanceRate: Math.round(attendanceRate * 100) / 100 // Round to 2 decimal places
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};
