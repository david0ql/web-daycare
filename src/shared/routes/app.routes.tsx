import React from "react";
import { Routes, Route, Outlet } from "react-router";
import { Authenticated, ErrorComponent } from "@refinedev/core";
import { CustomLayout } from "../components/custom-layout.component";
import { LoginProtected } from "../components/login-protected.component";

// Import pages
import { Dashboard } from "../../pages/dashboard";
import { Login } from "../../pages/login";
import { Error404 } from "../../pages/error-404";

// Import domain components
import { UserList } from "../../domains/users";
import { ChildList } from "../../domains/children";

// Import legacy pages
import { UserCreate, UserEdit, Register } from "../../pages/users";
import { ChildCreate, ChildEdit, ChildShow } from "../../pages/children";
import { 
  AttendanceList, 
  AttendanceCreate, 
  AttendanceShow, 
  AttendanceEdit, 
  AttendanceActivities, 
  AttendanceObservations, 
  AttendancePhotos,
  AttendanceActivitiesCreate,
  AttendanceActivitiesEdit,
  AttendanceActivitiesShow,
  AttendanceObservationsCreate,
  AttendanceObservationsEdit,
  AttendanceObservationsShow,
  AttendancePhotosCreate,
  AttendancePhotosEdit,
  AttendancePhotosShow
} from "../../pages/attendance";
import { IncidentsList, IncidentsCreate, IncidentsEdit, IncidentsShow } from "../../pages/incidents";
import { CalendarListPage, CalendarCreate, CalendarEdit } from "../../pages/calendar";
import { DocumentList, DocumentCreate, DocumentShow } from "../../pages/documents";
import { ReportList } from "../../pages/reports";


export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Ruta de login - protegida contra usuarios ya autenticados usando componente nativo de Refine */}
      <Route 
        element={
          <LoginProtected>
            <Login />
          </LoginProtected>
        } 
        path="/login" 
      />
      
      {/* Rutas protegidas - requieren autenticación usando componente nativo Authenticated de Refine */}
      <Route
        element={
          <Authenticated key="authenticated-layout" fallback={<Login />}>
            <CustomLayout>
              <Outlet />
            </CustomLayout>
          </Authenticated>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Users */}
        <Route path="/users">
          <Route index element={<UserList />} />
          <Route path="create" element={<UserCreate />} />
          <Route path="register" element={<Register />} />
          <Route path="edit/:id" element={<UserEdit />} />
        </Route>

        {/* Children */}
        <Route path="/children">
          <Route index element={<ChildList />} />
          <Route path="create" element={<ChildCreate />} />
          <Route path="edit/:id" element={<ChildEdit />} />
          <Route path="show/:id" element={<ChildShow />} />
        </Route>

        {/* Attendance */}
        <Route path="/attendance">
          <Route index element={<AttendanceList />} />
          <Route path="create" element={<AttendanceCreate />} />
          <Route path="show/:id" element={<AttendanceShow />} />
          <Route path="edit/:id" element={<AttendanceEdit />} />
          
          {/* Activities */}
          <Route path="activities">
            <Route index element={<AttendanceActivities />} />
            <Route path="create" element={<AttendanceActivitiesCreate />} />
            <Route path="create/:attendanceId" element={<AttendanceActivitiesCreate />} />
            <Route path="edit/:id" element={<AttendanceActivitiesEdit />} />
            <Route path="show/:id" element={<AttendanceActivitiesShow />} />
          </Route>
          
          {/* Observations */}
          <Route path="observations">
            <Route index element={<AttendanceObservations />} />
            <Route path="create" element={<AttendanceObservationsCreate />} />
            <Route path="create/:attendanceId" element={<AttendanceObservationsCreate />} />
            <Route path="edit/:id" element={<AttendanceObservationsEdit />} />
            <Route path="show/:id" element={<AttendanceObservationsShow />} />
          </Route>
          
          {/* Photos */}
          <Route path="photos">
            <Route index element={<AttendancePhotos />} />
            <Route path="create" element={<AttendancePhotosCreate />} />
            <Route path="create/:attendanceId" element={<AttendancePhotosCreate />} />
            <Route path="edit/:id" element={<AttendancePhotosEdit />} />
            <Route path="show/:id" element={<AttendancePhotosShow />} />
          </Route>
        </Route>

        {/* Incidents */}
        <Route path="/incidents">
          <Route index element={<IncidentsList />} />
          <Route path="create" element={<IncidentsCreate />} />
          <Route path="edit/:id" element={<IncidentsEdit />} />
          <Route path="show/:id" element={<IncidentsShow />} />
        </Route>

        {/* Calendar */}
        <Route path="/calendar">
          <Route index element={<CalendarListPage />} />
          <Route path="create" element={<CalendarCreate />} />
          <Route path="edit/:id" element={<CalendarEdit />} />
        </Route>

        {/* Documents */}
        <Route path="/documents">
          <Route index element={<DocumentList />} />
          <Route path="create" element={<DocumentCreate />} />
          <Route path="show/:id" element={<DocumentShow />} />
        </Route>


        {/* Reports */}
        <Route path="/reports">
          <Route index element={<ReportList />} />
        </Route>
      </Route>
      
      {/* Ruta catch-all para rutas no encontradas - debe estar al final */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
