import React from "react";
import { useInvalidate, useGo, useNotification } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, DatePicker, Switch, Button, Select, Card, Space, Typography, Divider, Row, Col, InputNumber, Tabs } from "antd";
import { UpdateChildData } from "../../domains/children/types/child.types";
import { useAvailableParents } from "../../domains/children/hooks/use-available-parents.hook";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Custom Switch component that always returns boolean
const BooleanSwitch: React.FC<{ value?: boolean; onChange?: (value: boolean) => void }> = ({ value, onChange }) => {
  const [internalValue, setInternalValue] = React.useState<boolean>(Boolean(value));
  
  React.useEffect(() => {
    console.log("🔍 BooleanSwitch useEffect - value changed:", value, typeof value);
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

export const ChildEdit: React.FC = () => {
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const { data: availableParents = [], isLoading: loadingParents } = useAvailableParents();
  
  const [form] = Form.useForm();
  
  const { formProps, saveButtonProps } = useForm<UpdateChildData>({
    onMutationSuccess: async (data, variables) => {
      console.log("🔍 EDIT Child Mutation success - data:", data);
      console.log("🔍 EDIT Child Mutation success - variables:", variables);
      
      // Force invalidate and refetch all children-related queries
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "children");
        },
      });
      
      // Force refetch all children queries
      await queryClient.refetchQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.some(k => k === "children");
        },
      });
      
      // Show success notification
      open?.({
        type: "success",
        message: "Niño actualizado exitosamente",
        description: "Los cambios se han guardado correctamente",
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
      console.log("🔍 EDIT Child Mutation error:", error);
      console.log("🔍 EDIT Child Mutation error - variables:", variables);
    }
  });

  // Transform data for form - using formProps.initialValues
  React.useEffect(() => {
    if (formProps.initialValues) {
      const childData = formProps.initialValues;
      console.log("🔍 Raw child data from API:", childData);
      
      // Helper function to safely map arrays
      const safeMap = (data: any, mapper: (item: any) => any) => {
        if (Array.isArray(data)) {
          return data.map(mapper);
        }
        if (data && typeof data === 'object') {
          return [mapper(data)];
        }
        return [];
      };
      
      const formData = {
        ...childData,
        // Transform relationships
        parentRelationships: safeMap(childData.parentChildRelationships, (rel: any) => ({
          parentId: rel.parent?.id,
          relationshipType: rel.relationshipType,
          isPrimary: rel.isPrimary,
        })),
        // Transform emergency contacts
        emergencyContacts: safeMap(childData.emergencyContacts, (contact: any) => ({
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          email: contact.email,
          isPrimary: contact.isPrimary,
        })),
        // Transform authorized pickup persons
        authorizedPickupPersons: safeMap(childData.authorizedPickupPersons, (person: any) => ({
          name: person.name,
          relationship: person.relationship,
          phone: person.phone,
          email: person.email,
          photo: person.photo,
          idDocument: person.idDocument,
        })),
        // Transform medical information
        medicalInformation: safeMap(childData.medicalInformation, (medical: any) => ({
          allergies: medical.allergies,
          medications: medical.medications,
          insuranceCompany: medical.insuranceCompany,
          insuranceNumber: medical.insuranceNumber,
          pediatricianName: medical.pediatricianName,
          pediatricianPhone: medical.pediatricianPhone,
          additionalNotes: medical.additionalNotes,
        })),
      };
      
      console.log("🔍 Transformed form data:", formData);
      form.setFieldsValue(formData);
    }
  }, [formProps.initialValues, form]);

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
    
    // Call the original formProps.onFinish with transformed values
    if (formProps.onFinish) {
      formProps.onFinish(transformedValues);
    }
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} form={form} layout="vertical" onFinish={handleFinish}>
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

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Dirección"
                name="address"
              >
                <TextArea 
                  placeholder="Dirección del niño (opcional)"
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Foto de Perfil"
                name="profilePicture"
              >
                <Input placeholder="URL de la imagen (opcional)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Form.Item
                  label="Alerta de Pago"
                  name="hasPaymentAlert"
                  valuePropName="checked"
                  getValueFromEvent={(checked) => checked}
                  getValueProps={(value) => ({ checked: Boolean(value) })}
                >
                  <BooleanSwitch />
                </Form.Item>
                <Form.Item
                  label="Estado Activo"
                  name="isActive"
                  valuePropName="checked"
                  getValueFromEvent={(checked) => checked}
                  getValueProps={(value) => ({ checked: Boolean(value) })}
                >
                  <BooleanSwitch />
                </Form.Item>
              </Space>
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
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "parentId"]}
                          label="Padre/Madre"
                          rules={[{ required: true, message: "Seleccione un padre/madre" }]}
                        >
                          <Select
                            placeholder="Seleccione padre/madre"
                            loading={loadingParents}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                          >
                            {availableParents.map((parent) => (
                              <Option key={parent.id} value={parent.id}>
                                {parent.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "relationshipType"]}
                          label="Tipo de Relación"
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
                          name={[name, "isPrimary"]}
                          label="Principal"
                          valuePropName="checked"
                          getValueFromEvent={(checked) => checked}
                          getValueProps={(value) => ({ checked: Boolean(value) })}
                        >
                          <BooleanSwitch />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Button
                          type="text"
                          danger
                          onClick={() => remove(name)}
                          style={{ marginTop: 30 }}
                        >
                          Eliminar
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Agregar Relación Padre-Hijo
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
                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Nombre"
                          rules={[{ required: true, message: "El nombre es requerido" }]}
                        >
                          <Input placeholder="Nombre completo" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "relationship"]}
                          label="Relación"
                          rules={[{ required: true, message: "La relación es requerida" }]}
                        >
                          <Input placeholder="Ej: Abuela, Tío" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "phone"]}
                          label="Teléfono"
                          rules={[{ required: true, message: "El teléfono es requerido" }]}
                        >
                          <Input placeholder="+57 300 123 4567" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "isPrimary"]}
                          label="Principal"
                          valuePropName="checked"
                          getValueFromEvent={(checked) => checked}
                          getValueProps={(value) => ({ checked: Boolean(value) })}
                        >
                          <BooleanSwitch />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button
                          type="text"
                          danger
                          onClick={() => remove(name)}
                          style={{ marginTop: 30 }}
                        >
                          Eliminar
                        </Button>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "email"]}
                          label="Email (Opcional)"
                        >
                          <Input placeholder="email@ejemplo.com" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Agregar Contacto de Emergencia
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
                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Nombre"
                          rules={[{ required: true, message: "El nombre es requerido" }]}
                        >
                          <Input placeholder="Nombre completo" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "relationship"]}
                          label="Relación"
                          rules={[{ required: true, message: "La relación es requerida" }]}
                        >
                          <Input placeholder="Ej: Tío, Abuela" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "phone"]}
                          label="Teléfono"
                          rules={[{ required: true, message: "El teléfono es requerido" }]}
                        >
                          <Input placeholder="+57 300 123 4567" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "idDocument"]}
                          label="Cédula"
                        >
                          <Input placeholder="Número de cédula" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "email"]}
                          label="Email (Opcional)"
                        >
                          <Input placeholder="email@ejemplo.com" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "photo"]}
                          label="Foto (Opcional)"
                        >
                          <Input placeholder="URL de la foto" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Button
                          type="text"
                          danger
                          onClick={() => remove(name)}
                        >
                          Eliminar
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Agregar Persona Autorizada
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Información Médica */}
        <Card title="Información Médica" style={{ marginBottom: 16 }}>
          <Form.List name="medicalInformation">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 8 }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "allergies"]}
                          label="Alergias"
                        >
                          <TextArea 
                            placeholder="Describa las alergias conocidas"
                            rows={2}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "medications"]}
                          label="Medicamentos"
                        >
                          <TextArea 
                            placeholder="Medicamentos actuales"
                            rows={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "insuranceCompany"]}
                          label="Aseguradora"
                        >
                          <Input placeholder="Nombre de la aseguradora" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "insuranceNumber"]}
                          label="Número de Póliza"
                        >
                          <Input placeholder="Número de póliza" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "pediatricianName"]}
                          label="Pediatra"
                        >
                          <Input placeholder="Nombre del pediatra" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "pediatricianPhone"]}
                          label="Teléfono del Pediatra"
                        >
                          <Input placeholder="+57 300 123 4567" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "additionalNotes"]}
                          label="Notas Adicionales"
                        >
                          <TextArea 
                            placeholder="Información médica adicional"
                            rows={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Button
                          type="text"
                          danger
                          onClick={() => remove(name)}
                        >
                          Eliminar
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Agregar Información Médica
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </Edit>
  );
};