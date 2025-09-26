import { usePermissions as useRefinePermissions } from '@refinedev/core';

export const usePermissions = () => {
  const { data: permissions, isLoading, error } = useRefinePermissions({});

  const isAdmin = permissions === 'administrator';
  const isEducator = permissions === 'educator';
  const isParent = permissions === 'parent';
  const isStaff = permissions === 'staff';

  const canCreate = isAdmin || isEducator;
  const canEdit = isAdmin || isEducator;
  const canDelete = isAdmin;
  const canView = true; // Everyone can view

  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    
    switch (permission) {
      case 'create':
        return canCreate;
      case 'edit':
        return canEdit;
      case 'delete':
        return canDelete;
      case 'view':
        return canView;
      case 'admin':
        return isAdmin;
      case 'educator':
        return isEducator;
      case 'parent':
        return isParent;
      case 'staff':
        return isStaff;
      default:
        return false;
    }
  };

  return {
    permissions,
    isLoading,
    error,
    isAdmin,
    isEducator,
    isParent,
    isStaff,
    canCreate,
    canEdit,
    canDelete,
    canView,
    hasPermission,
  };
};
