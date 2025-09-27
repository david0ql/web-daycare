import React, { useState } from "react";
import { useInvalidate, useGo, useNotification } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Form, 
  Input, 
  DatePicker, 
  Switch, 
  Button, 
  Select, 
  Card, 
  Space, 
  Typography, 
  Divider,
  Row,
  Col,
  InputNumber
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { CreateChildData, AvailableParent } from "../../domains/children/types/child.types";
import { useAvailableParents } from "../../domains/children/hooks";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Custom Switch component that always returns boolean
const BooleanSwitch: React.FC<{ value?: boolean; onChange?: (value: boolean) => void }> = ({ value, onChange }) => {
  const [internalValue, setInternalValue] = React.useState<boolean>(Boolean(value));
  
  React.useEffect(() => {
    setInternalValue(Boolean(value));
  }, [value]);

  const handleChange = (checked: boolean) => {
    console.log("🔍 BooleanSwitch onChange:", checked, typeof checked);
    console.log("🔍 BooleanSwitch current value:", value);
    console.log("🔍 BooleanSwitch internal value:", internalValue);
    
    setInternalValue(checked);
    
    if (onChange) {
      onChange(checked);
    }
  };

  return <Switch checked={internalValue} onChange={handleChange} />;
};

export const ChildCreate: React.FC = () => {
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const { data: availableParents = [], isLoading: loadingParents } = useAvailableParents();
  
  const [form] = Form.useForm();
  
  const { formProps, saveButtonProps } = useForm<CreateChildData>({
    onMutationSuccess: async (data, variables) => {
      console.log("🔍 CREATE Child Mutation success - data:", data);
      console.log("🔍 CREATE Child Mutation success - variables:", variables);
      
      // Use Refine's useInvalidate for proper cache invalidation
      invalidate({
        resource: "children",
        invalidates: ["list"],
      });
      
      // Also invalidate the specific child data
      invalidate({
        resource: "children",
        invalidates: ["detail"],
        id: (data as any).id,
      });
      
      // Show success notification
      open?.({
        type: "success",
        message: "Niño creado exitosamente",
        description: "El nuevo niño ha sido registrado correctamente",
      });
      
      // Navigate back to children list with a small delay for better UX
      setTimeout(() => {
        go({
          to: "/children",
          type: "push",
        });
      }, 1000);
    },
    onMutationError: (error, variables) => {
      console.log("🔍 CREATE Child Mutation error:", error);
      console.log("🔍 CREATE Child Mutation error - variables:", variables);
      
      // Log specific validation errors
      if (error?.response?.data?.message) {
        console.log("🔍 Validation errors:", error.response.data.message);
        const errorMessages = Array.isArray(error.response.data.message) 
          ? error.response.data.message 
          : [error.response.data.message];
        
        errorMessages.forEach((msg: any, index: number) => {
          console.log(`🔍 Error ${index + 1}:`, msg);
        });
      }
      
      // Show error notification
      open?.({
        type: "error",
        message: "Error al crear el niño",
        description: "No se pudo crear el niño. Verifica los datos e intenta nuevamente.",
      });
    }
  });

  // Custom onFinish to transform data
  const handleFinish = (values: any) => {
    console.log("🔍 Form onFinish - original values:", values);
    
    const transformedValues = {
      ...values,
      hasPaymentAlert: Boolean(values.hasPaymentAlert),
      isActive: Boolean(values.isActive),
      // Format birth date
      birthDate: values.birthDate ? moment(values.birthDate).format("YYYY-MM-DD") : undefined,
    };
    console.log("🔍 Form onFinish - transformed values:", transformedValues);
    
    // Log the data being sent to backend
    console.log("🔍 Data being sent to backend:", JSON.stringify(transformedValues, null, 2));
    
    // Call the original formProps.onFinish with transformed values
    if (formProps.onFinish) {
      console.log("🔍 Calling formProps.onFinish with:", transformedValues);
      formProps.onFinish(transformedValues);
    } else {
      console.error("🔍 formProps.onFinish is not available!");
    }
  };

  // Test form submission
  const testSubmit = () => {
    console.log("🔍 Testing form submission...");
    const values = form.getFieldsValue();
    console.log("🔍 Current form values:", values);
    handleFinish(values);
  };

  // Debug form state
  const handleValuesChange = (changedValues: any, allValues: any) => {
    console.log("🔍 Form values changed:", changedValues);
    console.log("🔍 All form values:", allValues);
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical" onFinish={handleFinish} onValuesChange={handleValuesChange}>
        {/* Debug Button */}
        <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
          <Button onClick={testSubmit} type="primary">
            🔍 Test Submit (Debug)
          </Button>
        </div>
        
        {/* Información Básica */}
        <Card title="Información Básica" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nombre"
                name="firstName"
                rules={[{ required: true, message: "El nombre es requerido" }]}
              >
                <Input placeholder="Nombre del niño" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Apellido"
                name="lastName"
                rules={[{ required: true, message: "El apellido es requerido" }]}
              >
                <Input placeholder="Apellido del niño" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Fecha de Nacimiento"
                name="birthDate"
                rules={[{ required: true, message: "La fecha de nacimiento es requerida" }]}
                getValueFromEvent={(date) => date ? moment(date).format("YYYY-MM-DD") : undefined}
                getValueProps={(value) => ({ value: value ? moment(value) : undefined })}
              >
                <DatePicker 
                  style={{ width: "100%" }}
                  placeholder="Seleccione la fecha de nacimiento"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ciudad de Nacimiento"
                name="birthCity"
              >
                <Input placeholder="Ciudad de nacimiento (opcional)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Dirección"
            name="address"
          >
            <TextArea 
              placeholder="Dirección del niño (opcional)"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Foto de Perfil"
            name="profilePicture"
          >
            <Input placeholder="URL de la imagen (opcional)" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Alerta de Pago"
                name="hasPaymentAlert"
                initialValue={false}
              >
                <BooleanSwitch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Estado Activo"
                name="isActive"
                initialValue={true}
              >
                <BooleanSwitch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Relaciones Padre-Hijo */}
        <Card title="Relaciones Padre-Hijo" style={{ marginBottom: 16 }}>
          <Form.List name="parentRelationships">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 8 }}>
                    <Row gutter={16} align="middle">
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'parentId']}
                          label="Padre/Madre"
                          rules={[{ required: true, message: "Seleccione un padre/madre" }]}
                        >
                          <Select
                            placeholder="Seleccionar padre/madre"
                            loading={loadingParents}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                            }
                          >
                            {availableParents.map((parent) => (
                              <Option key={parent.id} value={parent.id}>
                                {parent.name} ({parent.email})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'relationshipType']}
                          label="Relación"
                          rules={[{ required: true, message: "Seleccione el tipo de relación" }]}
                        >
                          <Select placeholder="Tipo de relación">
                            <Option value="father">Padre</Option>
                            <Option value="mother">Madre</Option>
                            <Option value="guardian">Tutor</Option>
                            <Option value="other">Otro</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'isPrimary']}
                          label="Principal"
                          valuePropName="checked"
                          initialValue={false}
                        >
                          <BooleanSwitch />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Agregar Relación Padre-Hijo
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Contactos de Emergencia */}
        <Card title="Contactos de Emergencia" style={{ marginBottom: 16 }}>
          <Form.List name="emergencyContacts">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 8 }}>
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Nombre"
                          rules={[{ required: true, message: "El nombre es requerido" }]}
                        >
                          <Input placeholder="Nombre completo" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'relationship']}
                          label="Relación"
                          rules={[{ required: true, message: "La relación es requerida" }]}
                        >
                          <Input placeholder="Ej: Abuela" />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'phone']}
                          label="Teléfono"
                          rules={[{ required: true, message: "El teléfono es requerido" }]}
                        >
                          <Input placeholder="+57 300 123 4567" />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'email']}
                          label="Email"
                        >
                          <Input placeholder="email@ejemplo.com" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item
                          {...restField}
                          name={[name, 'isPrimary']}
                          label="Principal"
                          valuePropName="checked"
                          initialValue={false}
                        >
                          <BooleanSwitch />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Agregar Contacto de Emergencia
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Personas Autorizadas para Recoger */}
        <Card title="Personas Autorizadas para Recoger" style={{ marginBottom: 16 }}>
          <Form.List name="authorizedPickupPersons">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 8 }}>
                    <Row gutter={16} align="middle">
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Nombre"
                          rules={[{ required: true, message: "El nombre es requerido" }]}
                        >
                          <Input placeholder="Nombre completo" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'relationship']}
                          label="Relación"
                          rules={[{ required: true, message: "La relación es requerida" }]}
                        >
                          <Input placeholder="Ej: Tío" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'phone']}
                          label="Teléfono"
                          rules={[{ required: true, message: "El teléfono es requerido" }]}
                        >
                          <Input placeholder="+57 300 123 4567" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'email']}
                          label="Email"
                        >
                          <Input placeholder="email@ejemplo.com" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'idDocument']}
                          label="Cédula"
                        >
                          <Input placeholder="12345678" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      name={[name, 'photo']}
                      label="Foto"
                    >
                      <Input placeholder="URL de la foto (opcional)" />
                    </Form.Item>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Agregar Persona Autorizada
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Información Médica */}
        <Card title="Información Médica" style={{ marginBottom: 16 }}>
          <Form.Item
            label="Alergias"
            name={['medicalInformation', 'allergies']}
          >
            <TextArea 
              placeholder="Describa las alergias conocidas (opcional)"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Medicamentos"
            name={['medicalInformation', 'medications']}
          >
            <TextArea 
              placeholder="Medicamentos actuales (opcional)"
              rows={3}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Compañía de Seguro"
                name={['medicalInformation', 'insuranceCompany']}
              >
                <Input placeholder="Ej: Sura, Sanitas (opcional)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Número de Seguro"
                name={['medicalInformation', 'insuranceNumber']}
              >
                <Input placeholder="Número de póliza (opcional)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Pediatra"
                name={['medicalInformation', 'pediatricianName']}
              >
                <Input placeholder="Nombre del pediatra (opcional)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Teléfono del Pediatra"
                name={['medicalInformation', 'pediatricianPhone']}
              >
                <Input placeholder="+57 300 555 1234 (opcional)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Notas Adicionales"
            name={['medicalInformation', 'additionalNotes']}
          >
            <TextArea 
              placeholder="Información médica adicional (opcional)"
              rows={3}
            />
          </Form.Item>
        </Card>
      </Form>
    </Create>
  );
};