// Shared module exports

// Config
export { default as axiosInstance } from './config/axios.config';
export { getAppResources } from './config/app.config';

// Types
export type {
  BaseEntity,
  PaginationParams,
  SortParams,
  FilterParams,
  ListResponse,
  ApiError,
  SelectOption,
  TableColumn,
} from './types/common.types';

// Utils
export { DateUtils } from './utils/date.utils';
export { ValidationUtils } from './utils/validation.utils';

// Components
export { LoadingComponent } from './components/loading.component';
export { ErrorComponent } from './components/error.component';
export { CustomLayout } from './components/custom-layout.component';
export { EnhancedSidebar } from './components/enhanced-sidebar.component';
export { ExampleUsage } from './components/example-usage.component';
export { default as GlobalLoading } from './components/global-loading.component';

// Hooks
export { usePermissions } from './hooks/use-permissions.hook';
export { useRefineHooks } from './hooks/use-refine-hooks.hook';
export { useAuth } from './hooks/use-auth.hook';
export { useData } from './hooks/use-data.hook';
export { useAppNavigation } from './hooks/use-navigation.hook';

// Routes
export { AppRoutes } from './routes/app.routes';

// Styles
export { colors } from './styles/colors.styles';
