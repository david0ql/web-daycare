import React from "react";
import { Button, Card, Space, Typography, List, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/use-auth.hook";
import { useData } from "../hooks/use-data.hook";
import { useAppNavigation } from "../hooks/use-navigation.hook";

const { Title, Text } = Typography;

/**
 * Componente de ejemplo que demuestra el uso de todos los hooks de Refine
 * implementados con las mejores prácticas
 */
export const ExampleUsageComponent: React.FC = () => {
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
  const { data: users, isLoading: usersLoading } = useDataList("users");
  const { data: children, isLoading: childrenLoading } = useDataList("children");
  
  const { create: createUser, isLoading: createUserLoading } = useDataCreate("users");
  const { update: updateUser, isLoading: updateUserLoading } = useDataUpdate("users");
  const { delete: deleteUser, isLoading: deleteUserLoading } = useDataDelete("users");

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
      <Title level={2}>Ejemplo de Uso de Hooks de Refine</Title>
      
      {/* Información del Usuario */}
      <Card title="Información de Autenticación" style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>Usuario: </Text>
            <Text>{getUserFullName()}</Text>
          </div>
          <div>
            <Text strong>Rol: </Text>
            <Tag color={getUserRoleColor()}>{getUserRoleLabel()}</Tag>
          </div>
          <div>
            <Text strong>Permisos: </Text>
            <Text code>{JSON.stringify(permissions)}</Text>
          </div>
          <div>
            <Text strong>Es Administrador: </Text>
            <Tag color={isAdmin() ? "green" : "red"}>
              {isAdmin() ? "Sí" : "No"}
            </Tag>
          </div>
          <div>
            <Text strong>Es Educador: </Text>
            <Tag color={isEducator() ? "green" : "red"}>
              {isEducator() ? "Sí" : "No"}
            </Tag>
          </div>
          <div>
            <Text strong>Es Padre/Madre: </Text>
            <Tag color={isParent() ? "green" : "red"}>
              {isParent() ? "Sí" : "No"}
            </Tag>
          </div>
        </Space>
      </Card>

      {/* Información de Navegación */}
      <Card title="Información de Navegación" style={{ marginBottom: "24px" }}>
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>Ruta Actual: </Text>
            <Text code>{currentPath}</Text>
          </div>
          <div>
            <Text strong>Recurso Actual: </Text>
            <Text code>{currentResource || "Ninguno"}</Text>
          </div>
          <div>
            <Text strong>En Lista de Recurso: </Text>
            <Tag color={isInResourceList("users") ? "green" : "red"}>
              {isInResourceList("users") ? "Sí" : "No"}
            </Tag>
          </div>
          <div>
            <Text strong>En Creación de Recurso: </Text>
            <Tag color={isInResourceCreate("users") ? "green" : "red"}>
              {isInResourceCreate("users") ? "Sí" : "No"}
            </Tag>
          </div>
        </Space>
      </Card>

      {/* Botones de Navegación */}
      <Card title="Navegación" style={{ marginBottom: "24px" }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigateToCreate("users")}
          >
            Crear Usuario
          </Button>
          <Button 
            onClick={() => navigateToList("users")}
          >
            Lista de Usuarios
          </Button>
          <Button 
            onClick={() => navigateToList("children")}
          >
            Lista de Niños
          </Button>
          <Button 
            onClick={() => navigateToShow("users", 1)}
          >
            Ver Usuario
          </Button>
        </Space>
      </Card>

      {/* Operaciones CRUD */}
      <Card title="Operaciones CRUD" style={{ marginBottom: "24px" }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            loading={createUserLoading}
            onClick={handleCreateUser}
          >
            Crear Usuario
          </Button>
          <Button 
            icon={<EditOutlined />}
            loading={updateUserLoading}
            onClick={() => handleUpdateUser(1)}
          >
            Actualizar Usuario
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />}
            loading={deleteUserLoading}
            onClick={() => handleDeleteUser(1)}
          >
            Eliminar Usuario
          </Button>
        </Space>
      </Card>

      {/* Lista de Usuarios */}
      <Card title="Lista de Usuarios" loading={usersLoading}>
        <List
          dataSource={users?.data || []}
          renderItem={(user: any) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => navigateToShow("users", user.id)}
                >
                  Ver
                </Button>,
                <Button 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => navigateToEdit("users", user.id)}
                >
                  Editar
                </Button>,
                <Button 
                  type="link" 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Eliminar
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
      <Card title="Lista de Niños" loading={childrenLoading}>
        <List
          dataSource={children?.data || []}
          renderItem={(child: any) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => navigateToShow("children", child.id)}
                >
                  Ver
                </Button>,
                <Button 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => navigateToEdit("children", child.id)}
                >
                  Editar
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={`${child.firstName} ${child.lastName}`}
                description={`Edad: ${child.age} años`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
