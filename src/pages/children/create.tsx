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
  InputNumber,
  message
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { CreateChildData, AvailableParent } from "../../domains/children/types/child.types";
import { useAvailableParents } from "../../domains/children/hooks";
import dayjs from "dayjs";

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
        message: "Child created successfully",
        description: "The new child has been registered correctly",
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
        message: "Error creating child",
        description: "Could not create the child. Please verify the data and try again.",
      });
    }
  });

  // Custom onFinish to transform data
  const handleFinish = (values: any) => {
    console.log("🔍 Form onFinish - original values:", values);
    
    // Validar que haya al menos una persona autorizada para recoger
    const authorizedPickupPersons = values.authorizedPickupPersons || [];
    if (authorizedPickupPersons.length === 0) {
      message.error("You must add at least one authorized person to pick up the child");
      form.scrollToField("authorizedPickupPersons");
      return;
    }
    
    const transformedValues = {
      ...values,
      hasPaymentAlert: Boolean(values.hasPaymentAlert),
      isActive: Boolean(values.isActive),
      // Format birth date
          birthDate: values.birthDate ? dayjs(values.birthDate).format("YYYY-MM-DD") : undefined,
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

  // Debug form state
  const handleValuesChange = (changedValues: any, allValues: any) => {
    console.log("🔍 Form values changed:", changedValues);
    console.log("🔍 All form values:", allValues);
  };

  // Override saveButtonProps to use our custom handleFinish
  const customSaveButtonProps = {
    ...saveButtonProps,
    onClick: () => {
      console.log("🔍 Save button clicked - triggering form submit");
      form.submit();
    }
  };

  return (
    <Create title="Register Child" saveButtonProps={customSaveButtonProps}>
      <Form {...formProps} form={form} layout="vertical" onFinish={handleFinish} onValuesChange={handleValuesChange}>
        
        {/* Basic Information */}
        <Card title="Basic Information" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input placeholder="Child's first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input placeholder="Child's last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Birth Date"
              name="birthDate"
              rules={[{ required: true, message: "Birth date is required" }]}
                getValueFromEvent={(date) => date ? dayjs(date).format("YYYY-MM-DD") : undefined}
                getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
            >
              <DatePicker
                style={{ width: "100%" }}
                  placeholder="Select birth date"
                  format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Birth City"
              name="birthCity"
            >
                <Input placeholder="Birth city (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Address"
          name="address"
        >
            <TextArea 
              placeholder="Child's address (optional)"
            rows={3}
          />
        </Form.Item>

        <Form.Item
          label="Profile Picture"
          name="profilePicture"
        >
          <Input placeholder="Image URL (optional)" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Payment Alert"
              name="hasPaymentAlert"
              initialValue={false}
            >
                <BooleanSwitch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Active Status"
              name="isActive"
              initialValue={true}
            >
                <BooleanSwitch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Parent-Child Relationships */}
        <Card title="Parent-Child Relationships" style={{ marginBottom: 16 }}>
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
                          label="Parent"
                          rules={[{ required: true, message: "Select a parent" }]}
                        >
                          <Select
                            placeholder="Select parent"
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
                          label="Relationship"
                          rules={[{ required: true, message: "Select the relationship type" }]}
                        >
                          <Select placeholder="Relationship type">
                            <Option value="father">Father</Option>
                            <Option value="mother">Mother</Option>
                            <Option value="guardian">Guardian</Option>
                            <Option value="other">Other</Option>
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
                    Add Parent-Child Relationship
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Emergency Contacts */}
        <Card title="Emergency Contacts" style={{ marginBottom: 16 }}>
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
                          label="Relationship"
                          rules={[{ required: true, message: "Relationship is required" }]}
                        >
                          <Input placeholder="E.g.: Grandmother" />
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
                    Add Emergency Contact
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Authorized Pickup Persons */}
        <Card 
          title={
            <Space>
              <span>Authorized Pickup Persons</span>
              <Text type="danger" style={{ fontSize: '14px' }}>(Required - Minimum 1)</Text>
            </Space>
          } 
          style={{ marginBottom: 16 }}
        >
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
                          label="ID Document"
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
                      label="Photo"
                    >
                      <Input placeholder="Photo URL (optional)" />
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
                    Add Authorized Person
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Medical Information */}
        <Card title="Medical Information" style={{ marginBottom: 16 }}>
          <Form.Item
            label="Allergies"
            name={['medicalInformation', 'allergies']}
          >
            <TextArea 
              placeholder="Describe known allergies (optional)"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Medications"
            name={['medicalInformation', 'medications']}
          >
            <TextArea 
              placeholder="Current medications (optional)"
              rows={3}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Insurance Company"
                name={['medicalInformation', 'insuranceCompany']}
              >
                <Input placeholder="E.g.: Blue Cross, Aetna (optional)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Insurance Number"
                name={['medicalInformation', 'insuranceNumber']}
              >
                <Input placeholder="Policy number (optional)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Pediatrician"
                name={['medicalInformation', 'pediatricianName']}
              >
                <Input placeholder="Pediatrician name (optional)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Pediatrician Phone"
                name={['medicalInformation', 'pediatricianPhone']}
              >
                <Input placeholder="+1 300 555 1234 (optional)" />
            </Form.Item>
          </Col>
        </Row>

          <Form.Item
            label="Additional Notes"
            name={['medicalInformation', 'additionalNotes']}
          >
            <TextArea 
              placeholder="Additional medical information (optional)"
              rows={3}
            />
          </Form.Item>
        </Card>
      </Form>
    </Create>
  );
};