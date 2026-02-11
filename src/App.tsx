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
import { getAppResources, AppRoutes } from "./shared";
import { LanguageProvider, useLanguage } from "./shared/contexts/language.context";
import GlobalLoading from "./shared/components/global-loading.component";
import { NotificationInitializer } from "./shared/components/notification-initializer.component";
import { useCustomNotificationProvider } from "./shared/providers/custom-notification.provider";
import { getAntdLocale } from "./shared/i18n/locale";

const AppInner: React.FC = () => {
  const { language } = useLanguage();

  return (
    <ConfigProvider theme={RefineThemes.Blue} locale={getAntdLocale(language)}>
      <AntdApp>
        <Refine
          dataProvider={stableFixedDataProvider}
          authProvider={authProvider}
          routerProvider={routerProvider}
          resources={getAppResources(language)}
          notificationProvider={useCustomNotificationProvider}
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
          <NotificationInitializer />
          <AppRoutes />
          <UnsavedChangesNotifier />
          <DocumentTitleHandler />
          <GlobalLoading />
        </Refine>
      </AntdApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
