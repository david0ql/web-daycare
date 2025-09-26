import React from "react";
import { Routes, Route, Outlet } from "react-router";
import { Authenticated, ErrorComponent } from "@refinedev/core";
import { CustomLayout } from "../components/custom-layout.component";

// Import pages
import { Dashboard } from "../../pages/dashboard";
import { Login } from "../../pages/login";

// Import domain components
import { UserList } from "../../domains/users";
import { ChildList } from "../../domains/children";

// Import legacy pages
import { UserCreate, UserEdit, UserShow, Register } from "../../pages/users";
import { ChildCreate, ChildEdit, ChildShow } from "../../pages/children";
import { AttendanceList, AttendanceCreate } from "../../pages/attendance";
import { IncidentList, IncidentCreate, IncidentEdit, IncidentShow } from "../../pages/incidents";
import { CalendarList, CalendarCreate, CalendarEdit } from "../../pages/calendar";
import { DocumentList, DocumentCreate, DocumentShow } from "../../pages/documents";
import { MessageList, MessageCreate, MessageShow } from "../../pages/messaging";
import { ReportList } from "../../pages/reports";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
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
          <Route path="show/:id" element={<UserShow />} />
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
        </Route>

        {/* Incidents */}
        <Route path="/incidents">
          <Route index element={<IncidentList />} />
          <Route path="create" element={<IncidentCreate />} />
          <Route path="edit/:id" element={<IncidentEdit />} />
          <Route path="show/:id" element={<IncidentShow />} />
        </Route>

        {/* Calendar */}
        <Route path="/calendar">
          <Route index element={<CalendarList />} />
          <Route path="create" element={<CalendarCreate />} />
          <Route path="edit/:id" element={<CalendarEdit />} />
        </Route>

        {/* Documents */}
        <Route path="/documents">
          <Route index element={<DocumentList />} />
          <Route path="create" element={<DocumentCreate />} />
          <Route path="show/:id" element={<DocumentShow />} />
        </Route>

        {/* Messaging */}
        <Route path="/messaging">
          <Route index element={<MessageList />} />
          <Route path="create" element={<MessageCreate />} />
          <Route path="show/:id" element={<MessageShow />} />
        </Route>

        {/* Reports */}
        <Route path="/reports">
          <Route index element={<ReportList />} />
        </Route>

        <Route path="*" element={<ErrorComponent />} />
      </Route>
      
      <Route element={<Login />} path="/login" />
    </Routes>
  );
};
