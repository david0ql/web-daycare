// Shared module exports

// Config
export { default as axiosInstance } from './config/axios.config';

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

// Hooks
export { usePermissions } from './hooks/use-permissions.hook';

// Styles
export { colors } from './styles/colors.styles';
