import React from "react";
import { useInvalidate, useGo, useNotification } from "@refinedev/core";
import { Edit, useForm } from "@refinedev/antd";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, DatePicker, Switch, Button, Select, Card, Space, Typography, Divider, Row, Col, InputNumber, Tabs, message } from "antd";
import { UpdateChildData } from "../../domains/children/types/child.types";
import { useAvailableParents } from "../../domains/children/hooks/use-available-parents.hook";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Custom Switch component that always returns boolean
const BooleanSwitch: React.FC<{ value?: boolean; onChange?: (value: boolean) => void }> = ({ value, onChange }) => {
  console.log("🔍 BooleanSwitch render - value:", value, typeof value);
  
  const handleChange = (checked: boolean) => {
    console.log("🔍 BooleanSwitch onChange:", checked, typeof checked);
    console.log("🔍 BooleanSwitch current value:", value);
    
    if (onChange) {
      onChange(checked);
    }
  };

  return <Switch checked={Boolean(value)} onChange={handleChange} />;
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
        message: "Child updated successfully",
        description: "Changes have been saved correctly",
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
      if (error?.response?.data?.message) {
        console.log("🔍 Validation errors:", error.response.data.message);
        const errorMessages = Array.isArray(error.response.data.message) 
          ? error.response.data.message 
          : [error.response.data.message];
        
        errorMessages.forEach((msg: any, index: number) => {
          console.log(`🔍 Error ${index + 1}:`, msg);
        });
      }
      open?.({ 
        type: "error", 
        message: "Error updating child", 
        description: "Could not update the child. Please verify the data and try again." 
      });
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
            // Keep birth date as string for DatePicker (it will be converted by getValueProps)
            birthDate: childData.birthDate,
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
      console.log("🔍 Setting form values - hasPaymentAlert:", (formData as any).hasPaymentAlert, "isActive:", (formData as any).isActive);
      form.setFieldsValue(formData);
      
      // Force update switches after setting form values
      setTimeout(() => {
        console.log("🔍 Form values after setFieldsValue:", form.getFieldsValue());
      }, 100);
    }
  }, [formProps.initialValues, form]);

  // Custom onFinish to transform data
  const handleFinish = (values: any) => {
    console.log("🔍 Form onFinish - original values:", values);
    
    // Validar que haya al menos un padre asignado
    const parentRelationships = values.parentRelationships || [];
    if (parentRelationships.length === 0) {
      message.error("You must have at least one parent assigned");
      form.scrollToField("parentRelationships");
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
    
    // Call the original formProps.onFinish with transformed values
    if (formProps.onFinish) {
      console.log("🔍 Calling formProps.onFinish with:", transformedValues);
      formProps.onFinish(transformedValues);
    } else {
      console.error("🔍 formProps.onFinish is not available!");
    }
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
    <Edit title="Edit Child" saveButtonProps={customSaveButtonProps}>
      <Form {...formProps} form={form} layout="vertical" onFinish={handleFinish}>
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

          <Row gutter={16}>
            <Col span={24}>
        <Form.Item
          label="Address"
          name="address"
        >
                <TextArea 
                  placeholder="Child's address (optional)"
            rows={3}
          />
        </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
        <Form.Item
          label="Profile Picture"
          name="profilePicture"
        >
          <Input placeholder="Image URL (optional)" />
        </Form.Item>
            </Col>
          <Col span={12}>
              <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label="Payment Alert"
              name="hasPaymentAlert"
              valuePropName="checked"
                  getValueFromEvent={(checked) => {
                    console.log("🔍 hasPaymentAlert getValueFromEvent:", checked);
                    return checked;
                  }}
                  getValueProps={(value) => {
                    console.log("🔍 hasPaymentAlert getValueProps:", value, typeof value);
                    return { value: Boolean(value) };
                  }}
                >
                  <BooleanSwitch />
            </Form.Item>
            <Form.Item
              label="Active Status"
              name="isActive"
              valuePropName="checked"
                  getValueFromEvent={(checked) => {
                    console.log("🔍 isActive getValueFromEvent:", checked);
                    return checked;
                  }}
                  getValueProps={(value) => {
                    console.log("🔍 isActive getValueProps:", value, typeof value);
                    return { value: Boolean(value) };
                  }}
                >
                  <BooleanSwitch />
                </Form.Item>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Parent-Child Relationships */}
        <Card 
          title={
            <Space>
              <span>Parent-Child Relationships</span>
              <Text type="danger" style={{ fontSize: '14px' }}>(Required - Minimum 1)</Text>
            </Space>
          } 
          style={{ marginBottom: 16 }}
        >
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
                          label="Parent"
                          rules={[{ required: true, message: "Select a parent" }]}
                        >
                          <Select
                            placeholder="Select parent"
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
                          label="Relationship Type"
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
                          name={[name, "isPrimary"]}
                          label="Principal"
                          valuePropName="checked"
                          getValueFromEvent={(checked) => {
                            console.log("🔍 isPrimary getValueFromEvent:", checked);
                            return checked;
                          }}
                          getValueProps={(value) => {
                            console.log("🔍 isPrimary getValueProps:", value, typeof value);
                            return { value: Boolean(value) };
                          }}
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
                          Delete
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Add Parent-Child Relationship
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
                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Name"
                          rules={[{ required: true, message: "Name is required" }]}
                        >
                          <Input placeholder="Full name" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "relationship"]}
                          label="Relationship"
                          rules={[{ required: true, message: "Relationship is required" }]}
                        >
                          <Input placeholder="E.g.: Grandmother, Uncle" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "phone"]}
                          label="Phone"
                          rules={[{ required: true, message: "Phone is required" }]}
                        >
                          <Input placeholder="+1 300 123 4567" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "isPrimary"]}
                          label="Primary"
                          valuePropName="checked"
                          getValueFromEvent={(checked) => {
                            console.log("🔍 isPrimary getValueFromEvent:", checked);
                            return checked;
                          }}
                          getValueProps={(value) => {
                            console.log("🔍 isPrimary getValueProps:", value, typeof value);
                            return { value: Boolean(value) };
                          }}
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
                          Delete
                        </Button>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "email"]}
                          label="Email (Optional)"
                        >
                          <Input placeholder="email@example.com" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Add Emergency Contact
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Authorized Pickup Persons */}
        <Card title="Authorized Pickup Persons" style={{ marginBottom: 16 }}>
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
                          label="Name"
                          rules={[{ required: true, message: "Name is required" }]}
                        >
                          <Input placeholder="Full name" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "relationship"]}
                          label="Relationship"
                          rules={[{ required: true, message: "Relationship is required" }]}
                        >
                          <Input placeholder="E.g.: Uncle, Grandmother" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "phone"]}
                          label="Phone"
                          rules={[{ required: true, message: "Phone is required" }]}
                        >
                          <Input placeholder="+1 300 123 4567" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "idDocument"]}
                          label="ID Document"
                        >
                          <Input placeholder="ID document number" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "email"]}
                          label="Email (Optional)"
                        >
                          <Input placeholder="email@example.com" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "photo"]}
                          label="Photo (Optional)"
                        >
                          <Input placeholder="Photo URL" />
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
                          Delete
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Add Authorized Person
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Medical Information */}
        <Card title="Medical Information" style={{ marginBottom: 16 }}>
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
                          label="Allergies"
                        >
                          <TextArea 
                            placeholder="Describe known allergies"
                            rows={2}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "medications"]}
                          label="Medications"
                        >
                          <TextArea 
                            placeholder="Current medications"
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
                          label="Insurance Company"
                        >
                          <Input placeholder="Insurance company name" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "insuranceNumber"]}
                          label="Policy Number"
                        >
                          <Input placeholder="Policy number" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "pediatricianName"]}
                          label="Pediatrician"
                        >
                          <Input placeholder="Pediatrician name" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "pediatricianPhone"]}
                          label="Pediatrician Phone"
                        >
                          <Input placeholder="+1 300 123 4567" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "additionalNotes"]}
                          label="Additional Notes"
                        >
                          <TextArea 
                            placeholder="Additional medical information"
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
                          Delete
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Add Medical Information
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