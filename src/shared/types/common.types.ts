export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  take?: number;
  skip?: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface ListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    take: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface TableColumn {
  title: string;
  dataIndex: string;
  key?: string;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  sorter?: boolean;
  filters?: Array<{ text: string; value: any }>;
  onFilter?: (value: any, record: any) => boolean;
  width?: number | string;
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
}
