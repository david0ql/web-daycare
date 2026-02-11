import React, { useState } from "react";
import { useInvalidate, useGo, useNotification } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import { useLanguage } from "../../shared/contexts/language.context";
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

const CHILD_CREATE_TRANSLATIONS = {
  english: {
    title: "Register Child",
    save: "Save",
    successMessage: "Child created successfully",
    successDesc: "The new child has been registered correctly",
    errorMessage: "Error creating child",
    authRequired: "You must add at least one authorized person to pick up the child",
    basicInfo: "Basic Information",
    firstName: "First Name",
    firstNameRequired: "First name is required",
    firstNamePlaceholder: "Child's first name",
    lastName: "Last Name",
    lastNameRequired: "Last name is required",
    lastNamePlaceholder: "Child's last name",
    birthDate: "Birth Date",
    birthDateRequired: "Birth date is required",
    birthDatePlaceholder: "Select birth date",
    birthCity: "Birth City",
    birthCityPlaceholder: "Birth city (optional)",
    address: "Address",
    addressPlaceholder: "Child's address (optional)",
    profilePicture: "Profile Picture",
    profilePicturePlaceholder: "Image URL (optional)",
    paymentAlert: "Payment Alert",
    activeStatus: "Active Status",
    parentChildRelationships: "Parent-Child Relationships",
    parent: "Parent",
    selectParent: "Select parent",
    selectParentRequired: "Select a parent",
    relationship: "Relationship",
    relationshipTypePlaceholder: "Relationship type",
    selectRelationshipType: "Select the relationship type",
    father: "Father",
    mother: "Mother",
    guardian: "Guardian",
    other: "Other",
    principal: "Principal",
    addParentRelationship: "Add Parent-Child Relationship",
    emergencyContacts: "Emergency Contacts",
    name: "Name",
    nameRequired: "Name is required",
    fullNamePlaceholder: "Full name",
    relationshipRequired: "Relationship is required",
    relationshipPlaceholder: "E.g.: Grandmother",
    phone: "Phone",
    phoneRequired: "Phone is required",
    phonePlaceholder: "+57 300 123 4567",
    email: "Email",
    emailPlaceholder: "email@example.com",
    addEmergencyContact: "Add Emergency Contact",
    authorizedPickup: "Authorized Pickup Persons",
    requiredMin1: "(Required - Minimum 1)",
    relationshipPlaceholderUncle: "E.g.: Uncle",
    idDocument: "ID Document",
    idDocumentPlaceholder: "12345678",
    photo: "Photo",
    photoPlaceholder: "Photo URL (optional)",
    addAuthorizedPerson: "Add Authorized Person",
    medicalInfo: "Medical Information",
    allergies: "Allergies",
    allergiesPlaceholder: "Describe known allergies (optional)",
    medications: "Medications",
    medicationsPlaceholder: "Current medications (optional)",
    insuranceCompany: "Insurance Company",
    insuranceCompanyPlaceholder: "E.g.: Blue Cross, Aetna (optional)",
    insuranceNumber: "Insurance Number",
    insuranceNumberPlaceholder: "Policy number (optional)",
    pediatrician: "Pediatrician",
    pediatricianPlaceholder: "Pediatrician name (optional)",
    pediatricianPhone: "Pediatrician Phone",
    pediatricianPhonePlaceholder: "+1 300 555 1234 (optional)",
    additionalNotes: "Additional Notes",
    additionalNotesPlaceholder: "Additional medical information (optional)",
  },
  spanish: {
    title: "Registrar niño",
    save: "Guardar",
    successMessage: "Niño creado correctamente",
    successDesc: "El nuevo niño ha sido registrado correctamente",
    errorMessage: "Error al crear el niño",
    authRequired: "Debe agregar al menos una persona autorizada para recoger al niño",
    basicInfo: "Información básica",
    firstName: "Nombre",
    firstNameRequired: "El nombre es requerido",
    firstNamePlaceholder: "Nombre del niño",
    lastName: "Apellido",
    lastNameRequired: "El apellido es requerido",
    lastNamePlaceholder: "Apellido del niño",
    birthDate: "Fecha de nacimiento",
    birthDateRequired: "La fecha de nacimiento es requerida",
    birthDatePlaceholder: "Seleccionar fecha de nacimiento",
    birthCity: "Ciudad de nacimiento",
    birthCityPlaceholder: "Ciudad de nacimiento (opcional)",
    address: "Dirección",
    addressPlaceholder: "Dirección del niño (opcional)",
    profilePicture: "Foto de perfil",
    profilePicturePlaceholder: "URL de imagen (opcional)",
    paymentAlert: "Alerta de pago",
    activeStatus: "Estado activo",
    parentChildRelationships: "Relaciones padre-hijo",
    parent: "Padre/Madre",
    selectParent: "Seleccionar padre/madre",
    selectParentRequired: "Seleccione un padre o madre",
    relationship: "Relación",
    relationshipTypePlaceholder: "Tipo de relación",
    selectRelationshipType: "Seleccione el tipo de relación",
    father: "Padre",
    mother: "Madre",
    guardian: "Tutor",
    other: "Otro",
    principal: "Principal",
    addParentRelationship: "Agregar relación padre-hijo",
    emergencyContacts: "Contactos de emergencia",
    name: "Nombre",
    nameRequired: "El nombre es requerido",
    fullNamePlaceholder: "Nombre completo",
    relationshipRequired: "La relación es requerida",
    relationshipPlaceholder: "Ej.: Abuela",
    phone: "Teléfono",
    phoneRequired: "El teléfono es requerido",
    phonePlaceholder: "+57 300 123 4567",
    email: "Correo electrónico",
    emailPlaceholder: "correo@ejemplo.com",
    addEmergencyContact: "Agregar contacto de emergencia",
    authorizedPickup: "Personas autorizadas para recoger",
    requiredMin1: "(Requerido - Mínimo 1)",
    relationshipPlaceholderUncle: "Ej.: Tío",
    idDocument: "Documento de identidad",
    idDocumentPlaceholder: "12345678",
    photo: "Foto",
    photoPlaceholder: "URL de foto (opcional)",
    addAuthorizedPerson: "Agregar persona autorizada",
    medicalInfo: "Información médica",
    allergies: "Alergias",
    allergiesPlaceholder: "Describir alergias conocidas (opcional)",
    medications: "Medicamentos",
    medicationsPlaceholder: "Medicamentos actuales (opcional)",
    insuranceCompany: "Compañía de seguros",
    insuranceCompanyPlaceholder: "Ej.: Sura, Colsanitas (opcional)",
    insuranceNumber: "Número de póliza",
    insuranceNumberPlaceholder: "Número de póliza (opcional)",
    pediatrician: "Pediatra",
    pediatricianPlaceholder: "Nombre del pediatra (opcional)",
    pediatricianPhone: "Teléfono del pediatra",
    pediatricianPhonePlaceholder: "+57 300 555 1234 (opcional)",
    additionalNotes: "Notas adicionales",
    additionalNotesPlaceholder: "Información médica adicional (opcional)",
  },
} as const;

export const ChildCreate: React.FC = () => {
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const { language } = useLanguage();
  const t = CHILD_CREATE_TRANSLATIONS[language];
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
        message: t.successMessage,
        description: t.successDesc,
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
        message: t.errorMessage,
        description: t.errorMessage,
      });
    }
  });

  // Custom onFinish to transform data
  const handleFinish = (values: any) => {
    console.log("🔍 Form onFinish - original values:", values);
    
    // Validar que haya al menos una persona autorizada para recoger
    const authorizedPickupPersons = values.authorizedPickupPersons || [];
    if (authorizedPickupPersons.length === 0) {
      message.error(t.authRequired);
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
    <Create title={t.title} saveButtonProps={{ ...customSaveButtonProps, children: t.save }}>
      <Form {...formProps} form={form} layout="vertical" onFinish={handleFinish} onValuesChange={handleValuesChange}>
        
        {/* Basic Information */}
        <Card title={t.basicInfo} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.firstName}
              name="firstName"
              rules={[{ required: true, message: t.firstNameRequired }]}
            >
              <Input placeholder={t.firstNamePlaceholder} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t.lastName}
              name="lastName"
              rules={[{ required: true, message: t.lastNameRequired }]}
            >
              <Input placeholder={t.lastNamePlaceholder} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.birthDate}
              name="birthDate"
              rules={[{ required: true, message: t.birthDateRequired }]}
                getValueFromEvent={(date) => date ? dayjs(date).format("YYYY-MM-DD") : undefined}
                getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
            >
              <DatePicker
                style={{ width: "100%" }}
                  placeholder={t.birthDatePlaceholder}
                  format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t.birthCity}
              name="birthCity"
            >
                <Input placeholder={t.birthCityPlaceholder} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={t.address}
          name="address"
        >
            <TextArea 
              placeholder={t.addressPlaceholder}
            rows={3}
          />
        </Form.Item>

        <Form.Item
          label={t.profilePicture}
          name="profilePicture"
        >
          <Input placeholder={t.profilePicturePlaceholder} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t.paymentAlert}
              name="hasPaymentAlert"
              initialValue={false}
            >
                <BooleanSwitch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t.activeStatus}
              name="isActive"
              initialValue={true}
            >
                <BooleanSwitch />
            </Form.Item>
          </Col>
        </Row>
        </Card>

        {/* Parent-Child Relationships */}
        <Card title={t.parentChildRelationships} style={{ marginBottom: 16 }}>
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
                          label={t.parent}
                          rules={[{ required: true, message: t.selectParentRequired }]}
                        >
                          <Select
                            placeholder={t.selectParent}
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
                          label={t.relationship}
                          rules={[{ required: true, message: t.selectRelationshipType }]}
                        >
                          <Select placeholder={t.relationshipTypePlaceholder}>
                            <Option value="father">{t.father}</Option>
                            <Option value="mother">{t.mother}</Option>
                            <Option value="guardian">{t.guardian}</Option>
                            <Option value="other">{t.other}</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'isPrimary']}
                          label={t.principal}
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
                    {t.addParentRelationship}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Emergency Contacts */}
        <Card title={t.emergencyContacts} style={{ marginBottom: 16 }}>
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
                          label={t.name}
                          rules={[{ required: true, message: t.nameRequired }]}
                        >
                          <Input placeholder={t.fullNamePlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'relationship']}
                          label={t.relationship}
                          rules={[{ required: true, message: t.relationshipRequired }]}
                        >
                          <Input placeholder={t.relationshipPlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'phone']}
                          label={t.phone}
                          rules={[{ required: true, message: t.phoneRequired }]}
                        >
                          <Input placeholder={t.phonePlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'email']}
                          label={t.email}
                        >
                          <Input placeholder={t.emailPlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item
                          {...restField}
                          name={[name, 'isPrimary']}
                          label={t.principal}
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
                    {t.addEmergencyContact}
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
              <span>{t.authorizedPickup}</span>
              <Text type="danger" style={{ fontSize: '14px' }}>{t.requiredMin1}</Text>
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
                          label={t.name}
                          rules={[{ required: true, message: t.nameRequired }]}
                        >
                          <Input placeholder={t.fullNamePlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'relationship']}
                          label={t.relationship}
                          rules={[{ required: true, message: t.relationshipRequired }]}
                        >
                          <Input placeholder={t.relationshipPlaceholderUncle} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'phone']}
                          label={t.phone}
                          rules={[{ required: true, message: t.phoneRequired }]}
                        >
                          <Input placeholder={t.phonePlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'email']}
                          label={t.email}
                        >
                          <Input placeholder={t.emailPlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'idDocument']}
                          label={t.idDocument}
                        >
                          <Input placeholder={t.idDocumentPlaceholder} />
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
                      label={t.photo}
                    >
                      <Input placeholder={t.photoPlaceholder} />
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
                    {t.addAuthorizedPerson}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Medical Information */}
        <Card title={t.medicalInfo} style={{ marginBottom: 16 }}>
          <Form.Item
            label={t.allergies}
            name={['medicalInformation', 'allergies']}
          >
            <TextArea 
              placeholder={t.allergiesPlaceholder}
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label={t.medications}
            name={['medicalInformation', 'medications']}
          >
            <TextArea 
              placeholder={t.medicationsPlaceholder}
              rows={3}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t.insuranceCompany}
                name={['medicalInformation', 'insuranceCompany']}
              >
                <Input placeholder={t.insuranceCompanyPlaceholder} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t.insuranceNumber}
                name={['medicalInformation', 'insuranceNumber']}
              >
                <Input placeholder={t.insuranceNumberPlaceholder} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t.pediatrician}
                name={['medicalInformation', 'pediatricianName']}
              >
                <Input placeholder={t.pediatricianPlaceholder} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t.pediatricianPhone}
                name={['medicalInformation', 'pediatricianPhone']}
              >
                <Input placeholder={t.pediatricianPhonePlaceholder} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t.additionalNotes}
            name={['medicalInformation', 'additionalNotes']}
          >
            <TextArea 
              placeholder={t.additionalNotesPlaceholder}
              rows={3}
            />
          </Form.Item>
        </Card>
      </Form>
    </Create>
  );
};