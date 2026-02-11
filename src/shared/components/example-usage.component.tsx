import React from "react";
import { Button, Card, Space, Typography, List, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/use-auth.hook";
import { useData } from "../hooks/use-data.hook";
import { useAppNavigation } from "../hooks/use-navigation.hook";
import { useLanguage } from "../contexts/language.context";

const { Title, Text } = Typography;

const EXAMPLE_USAGE_TRANSLATIONS = {
  english: {
    pageTitle: "Refine Hooks Usage Example",
    authInfo: "Authentication Information",
    navigationInfo: "Navigation Information",
    navigation: "Navigation",
    crudOperations: "CRUD Operations",
    usersList: "Users List",
    childrenList: "Children List",
    user: "User",
    role: "Role",
    permissions: "Permissions",
    isAdmin: "Is Administrator",
    isEducator: "Is Educator",
    isParent: "Is Parent",
    yes: "Yes",
    no: "No",
    currentPath: "Current Path",
    currentResource: "Current Resource",
    none: "None",
    inResourceList: "In Resource List",
    inResourceCreate: "In Resource Create",
    createUser: "Create User",
    userList: "Users List",
    childList: "Children List",
    viewUser: "View User",
    updateUser: "Update User",
    deleteUser: "Delete User",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    age: "Age",
    years: "years",
  },
  spanish: {
    pageTitle: "Ejemplo de Uso de Hooks de Refine",
    authInfo: "Información de Autenticación",
    navigationInfo: "Información de Navegación",
    navigation: "Navegación",
    crudOperations: "Operaciones CRUD",
    usersList: "Lista de Usuarios",
    childrenList: "Lista de Niños",
    user: "Usuario",
    role: "Rol",
    permissions: "Permisos",
    isAdmin: "Es Administrador",
    isEducator: "Es Educador",
    isParent: "Es Padre/Madre",
    yes: "Sí",
    no: "No",
    currentPath: "Ruta Actual",
    currentResource: "Recurso Actual",
    none: "Ninguno",
    inResourceList: "En Lista de Recurso",
    inResourceCreate: "En Creación de Recurso",
    createUser: "Crear Usuario",
    userList: "Lista de Usuarios",
    childList: "Lista de Niños",
    viewUser: "Ver Usuario",
    updateUser: "Actualizar Usuario",
    deleteUser: "Eliminar Usuario",
    view: "Ver",
    edit: "Editar",
    delete: "Eliminar",
    age: "Edad",
    years: "años",
  },
} as const;

/**
 * Componente de ejemplo que demuestra el uso de todos los hooks de Refine
 * implementados con las mejores prácticas
 */
export const ExampleUsage: React.FC = () => {
  const { language } = useLanguage();
  const t = EXAMPLE_USAGE_TRANSLATIONS[language];
  // ===== HOOKS DE AUTENTICACIÓN =====
  const { 
    user, 
    permissions, 
    isAdmin, 
    isEducator, 
    isParent,
    getUserFullName,
    getUserRoleLabel,
    getUserRoleColor
  } = useAuth();

  // ===== HOOKS DE DATOS =====
  const { 
    useDataList, 
    useDataCreate, 
    useDataUpdate, 
    useDataDelete,
    refreshResource 
  } = useData();

  // ===== HOOKS DE NAVEGACIÓN =====
  const { 
    navigateToList, 
    navigateToCreate, 
    navigateToEdit, 
    navigateToShow,
    currentPath,
    currentResource,
    isInResourceList,
    isInResourceCreate
  } = useAppNavigation();

  // ===== USO DE HOOKS DE DATOS =====
  const { result: usersResult, query: usersQuery } = useDataList("users");
  const { result: childrenResult, query: childrenQuery } = useDataList("children");
  const usersLoading = usersQuery.isLoading;
  const childrenLoading = childrenQuery.isLoading;
  const users = usersResult?.data || [];
  const children = childrenResult?.data || [];
  
  const { create: createUser, mutation: createUserMutation } = useDataCreate("users");
  const { update: updateUser, mutation: updateUserMutation } = useDataUpdate("users");
  const { delete: deleteUser, mutation: deleteUserMutation } = useDataDelete("users");
  const createUserLoading = createUserMutation.isPending;
  const updateUserLoading = updateUserMutation.isPending;
  const deleteUserLoading = deleteUserMutation.isPending;

  // ===== FUNCIONES DE EJEMPLO =====
  
  const handleCreateUser = async () => {
    try {
      await createUser({
        firstName: "Nuevo",
        lastName: "Usuario",
        email: "nuevo@ejemplo.com",
        role: "parent"
      });
      refreshResource("users");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleUpdateUser = async (id: string | number) => {
    try {
      await updateUser({
        id,
        firstName: "Usuario",
        lastName: "Actualizado"
      });
      refreshResource("users");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (id: string | number) => {
    try {
      await deleteUser(id);
      refreshResource("users");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // ===== RENDERIZADO =====
  
  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>{t.pageTitle}</Title>
      
      {/* Información del Usuario */}
      <Card title={t.authInfo} style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>{t.user}: </Text>
            <Text>{getUserFullName()}</Text>
          </div>
          <div>
            <Text strong>{t.role}: </Text>
            <Tag color={getUserRoleColor()}>{getUserRoleLabel()}</Tag>
          </div>
          <div>
            <Text strong>{t.permissions}: </Text>
            <Text code>{JSON.stringify(permissions)}</Text>
          </div>
          <div>
            <Text strong>{t.isAdmin}: </Text>
            <Tag color={isAdmin() ? "green" : "red"}>
              {isAdmin() ? t.yes : t.no}
            </Tag>
          </div>
          <div>
            <Text strong>{t.isEducator}: </Text>
            <Tag color={isEducator() ? "green" : "red"}>
              {isEducator() ? t.yes : t.no}
            </Tag>
          </div>
          <div>
            <Text strong>{t.isParent}: </Text>
            <Tag color={isParent() ? "green" : "red"}>
              {isParent() ? t.yes : t.no}
            </Tag>
          </div>
        </Space>
      </Card>

      {/* Información de Navegación */}
      <Card title={t.navigationInfo} style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>{t.currentPath}: </Text>
            <Text code>{currentPath}</Text>
          </div>
          <div>
            <Text strong>{t.currentResource}: </Text>
            <Text code>{currentResource || t.none}</Text>
          </div>
          <div>
            <Text strong>{t.inResourceList}: </Text>
            <Tag color={isInResourceList("users") ? "green" : "red"}>
              {isInResourceList("users") ? t.yes : t.no}
            </Tag>
          </div>
          <div>
            <Text strong>{t.inResourceCreate}: </Text>
            <Tag color={isInResourceCreate("users") ? "green" : "red"}>
              {isInResourceCreate("users") ? t.yes : t.no}
            </Tag>
          </div>
        </Space>
      </Card>

      {/* Botones de Navegación */}
      <Card title={t.navigation} style={{ marginBottom: "24px" }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigateToCreate("users")}
          >
            {t.createUser}
          </Button>
          <Button 
            onClick={() => navigateToList("users")}
          >
            {t.userList}
          </Button>
          <Button 
            onClick={() => navigateToList("children")}
          >
            {t.childList}
          </Button>
          <Button 
            onClick={() => navigateToShow("users", 1)}
          >
            {t.viewUser}
          </Button>
        </Space>
      </Card>

      {/* Operaciones CRUD */}
      <Card title={t.crudOperations} style={{ marginBottom: "24px" }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            loading={createUserLoading}
            onClick={handleCreateUser}
          >
            {t.createUser}
          </Button>
          <Button 
            icon={<EditOutlined />}
            loading={updateUserLoading}
            onClick={() => handleUpdateUser(1)}
          >
            {t.updateUser}
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />}
            loading={deleteUserLoading}
            onClick={() => handleDeleteUser(1)}
          >
            {t.deleteUser}
          </Button>
        </Space>
      </Card>

      {/* Lista de Usuarios */}
      <Card title={t.usersList} loading={usersLoading}>
        <List
          dataSource={users || []}
          renderItem={(user: any) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => navigateToShow("users", user.id)}
                >
                  {t.view}
                </Button>,
                <Button 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => navigateToEdit("users", user.id)}
                >
                  {t.edit}
                </Button>,
                <Button 
                  type="link" 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteUser(user.id)}
                >
                  {t.delete}
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={`${user.firstName} ${user.lastName}`}
                description={user.email}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Lista de Niños */}
      <Card title={t.childrenList} loading={childrenLoading}>
        <List
          dataSource={children || []}
          renderItem={(child: any) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => navigateToShow("children", child.id)}
                >
                  {t.view}
                </Button>,
                <Button 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => navigateToEdit("children", child.id)}
                >
                  {t.edit}
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={`${child.firstName} ${child.lastName}`}
                description={`${t.age}: ${child.age} ${t.years}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
