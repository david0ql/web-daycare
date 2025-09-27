import { Refine } from "@refinedev/core";
import {
  useNotificationProvider,
  RefineThemes,
} from "@refinedev/antd";
import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter } from "react-router";

import { ConfigProvider, App as AntdApp } from "antd";
import "@ant-design/v5-patch-for-react-19";
import "@refinedev/antd/dist/reset.css";

import { authProvider } from "./authProvider-refine-native";
import { stableFixedDataProvider } from "./dataProvider-stable-fixed";
import { appResources, AppRoutes } from "./shared";
import GlobalLoading from "./shared/components/global-loading.component";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine
            dataProvider={stableFixedDataProvider}
            authProvider={authProvider}
            routerProvider={routerProvider}
            resources={appResources}
            notificationProvider={useNotificationProvider}
            options={{
              syncWithLocation: false,
              warnWhenUnsavedChanges: true,
              title: {
                text: "The Children's World",
                icon: "🏫",
              },
              reactQuery: {
                clientConfig: {
                  defaultOptions: {
                    queries: {
                      retry: false, // Desactivar reintentos automáticos
                      refetchOnMount: true, // Permitir refetch al montar para datos invalidados
                      refetchOnReconnect: false, // No refetch al reconectar
                      staleTime: 30 * 1000, // 30 segundos de stale time
                      gcTime: 5 * 60 * 1000, // 5 minutos de garbage collection time
                    },
                    mutations: {
                      retry: false, // Desactivar reintentos en mutaciones
                    },
                  },
                },
              },
            }}
          >
            <AppRoutes />
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
            <GlobalLoading />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
