import { Refine, Authenticated } from "@refinedev/core";
import {
  useNotificationProvider,
  ThemedLayout,
  ErrorComponent,
  RefineThemes,
  AuthPage,
} from "@refinedev/antd";
import routerProvider, {
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";

import { ConfigProvider, App as AntdApp } from "antd";
import "@ant-design/v5-patch-for-react-19";
import "@refinedev/antd/dist/reset.css";

import { authProvider } from "./domains/auth";
import { customDataProvider } from "./dataProvider";
import { Dashboard } from "./pages/dashboard";
import { LoginPage } from "./domains/auth";
import { Login } from "./pages/login";

// Import pages for different modules  
import { UserList } from "./domains/users";
import { ChildList } from "./domains/children";
import { UserCreate, UserEdit, UserShow, Register } from "./pages/users";
import { ChildCreate, ChildEdit, ChildShow } from "./pages/children";
import { AttendanceList, AttendanceCreate } from "./pages/attendance";
import { IncidentList, IncidentCreate, IncidentEdit, IncidentShow } from "./pages/incidents";
import { CalendarList, CalendarCreate, CalendarEdit } from "./pages/calendar";
import { DocumentList, DocumentCreate, DocumentShow } from "./pages/documents";
import { MessageList, MessageCreate, MessageShow } from "./pages/messaging";
import { ReportList } from "./pages/reports";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine
            dataProvider={customDataProvider}
            authProvider={authProvider}
            routerProvider={routerProvider}
            resources={[
              {
                name: "users",
                list: "/users",
                create: "/users/create",
                edit: "/users/edit/:id",
                show: "/users/show/:id",
                meta: {
                  label: "Usuarios",
                  icon: "👥",
                },
              },
              {
                name: "children",
                list: "/children",
                create: "/children/create",
                edit: "/children/edit/:id",
                show: "/children/show/:id",
                meta: {
                  label: "Niños",
                  icon: "👶",
                },
              },
              {
                name: "attendance",
                list: "/attendance",
                create: "/attendance/create",
                meta: {
                  label: "Asistencia",
                  icon: "📋",
                },
              },
              {
                name: "incidents",
                list: "/incidents",
                create: "/incidents/create",
                edit: "/incidents/edit/:id",
                show: "/incidents/show/:id",
                meta: {
                  label: "Incidentes",
                  icon: "⚠️",
                },
              },
              {
                name: "calendar",
                list: "/calendar",
                create: "/calendar/create",
                edit: "/calendar/edit/:id",
                meta: {
                  label: "Calendario",
                  icon: "📅",
                },
              },
              {
                name: "documents",
                list: "/documents",
                create: "/documents/create",
                show: "/documents/show/:id",
                meta: {
                  label: "Documentos",
                  icon: "📄",
                },
              },
              {
                name: "messaging",
                list: "/messaging",
                create: "/messaging/create",
                show: "/messaging/show/:id",
                meta: {
                  label: "Mensajes",
                  icon: "💬",
                },
              },
              {
                name: "reports",
                list: "/reports",
                meta: {
                  label: "Reportes",
                  icon: "📊",
                },
              },
            ]}
            notificationProvider={useNotificationProvider}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              title: {
                text: "The Children's World",
                icon: "🏫",
              },
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="authenticated-layout" fallback={<Login />}>
                    <ThemedLayout>
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route
                  index
                  element={<Dashboard />}
                />
                
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
              
              <Route
                element={<Login />}
                path="/login"
              />
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
