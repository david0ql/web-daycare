import React, { useState, useEffect } from "react";
import { useInvalidate, useGo, useNotification } from "@refinedev/core";
import { Edit, useForm, ListButton, RefreshButton } from "@refinedev/antd";
import { useLanguage } from "../../shared/contexts/language.context";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, DatePicker, Switch, Button, Select, Card, Space, Typography, Divider, Row, Col, InputNumber, Tabs, Upload, Avatar, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { UpdateChildData } from "../../domains/children/types/child.types";
import { useAvailableParents } from "../../domains/children/hooks/use-available-parents.hook";
import dayjs from "dayjs";
import axiosInstance from "../../shared/config/axios.config";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Custom Switch component that always returns boolean
const BooleanSwitch: React.FC<{ value?: boolean; onChange?: (value: boolean) => void }> = ({ value, onChange }) => {
  
  const handleChange = (checked: boolean) => {
    
    if (onChange) {
      onChange(checked);
    }
  };

  return <Switch checked={Boolean(value)} onChange={handleChange} />;
};

const CHILD_EDIT_TRANSLATIONS = {
  english: {
    title: "Edit Child",
    save: "Save",
    children: "Children",
    refresh: "Refresh",
    successMessage: "Child updated successfully",
    successDesc: "Changes have been saved correctly",
    errorMessage: "Error updating child",
    parentRequired: "You must have at least one parent assigned",
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
    selectPhoto: "Select Photo",
    paymentAlert: "Payment Alert",
    activeStatus: "Active Status",
    parentChildRelationships: "Parent-Child Relationships",
    requiredMin1: "(Required - Minimum 1)",
    parent: "Parent",
    selectParent: "Select parent",
    selectParentRequired: "Select a parent",
    relationshipType: "Relationship Type",
    relationshipTypePlaceholder: "Relationship type",
    selectRelationshipType: "Select the relationship type",
    father: "Father",
    mother: "Mother",
    guardian: "Guardian",
    other: "Other",
    principal: "Principal",
    delete: "Delete",
    addParentRelationship: "+ Add Parent-Child Relationship",
    emergencyContacts: "Emergency Contacts",
    name: "Name",
    nameRequired: "Name is required",
    fullNamePlaceholder: "Full name",
    relationship: "Relationship",
    relationshipRequired: "Relationship is required",
    relationshipPlaceholder: "E.g.: Grandmother, Uncle",
    phone: "Phone",
    phoneRequired: "Phone is required",
    phonePlaceholder: "+1 300 123 4567",
    primary: "Primary",
    emailOptional: "Email (Optional)",
    emailPlaceholder: "email@example.com",
    addEmergencyContact: "+ Add Emergency Contact",
    authorizedPickup: "Authorized Pickup Persons",
    idDocument: "ID Document",
    idDocumentPlaceholder: "ID document number",
    photoOptional: "Photo (Optional)",
    photoPlaceholder: "Photo URL",
    addAuthorizedPerson: "+ Add Authorized Person",
    medicalInfo: "Medical Information",
    allergies: "Allergies",
    allergiesPlaceholder: "Describe known allergies",
    medications: "Medications",
    medicationsPlaceholder: "Current medications",
    insuranceCompany: "Insurance Company",
    insuranceCompanyPlaceholder: "Insurance company name",
    policyNumber: "Policy Number",
    policyNumberPlaceholder: "Policy number",
    pediatrician: "Pediatrician",
    pediatricianPlaceholder: "Pediatrician name",
    pediatricianPhone: "Pediatrician Phone",
    additionalNotes: "Additional Notes",
    additionalNotesPlaceholder: "Additional medical information",
    addMedicalInfo: "+ Add Medical Information",
  },
  spanish: {
    title: "Editar niño",
    save: "Guardar",
    children: "Niños",
    refresh: "Actualizar",
    successMessage: "Niño actualizado correctamente",
    successDesc: "Los cambios han sido guardados correctamente",
    errorMessage: "Error al actualizar el niño",
    parentRequired: "Debe tener al menos un padre asignado",
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
    selectPhoto: "Seleccionar foto",
    paymentAlert: "Alerta de pago",
    activeStatus: "Estado activo",
    parentChildRelationships: "Relaciones padre-hijo",
    requiredMin1: "(Requerido - Mínimo 1)",
    parent: "Padre/Madre",
    selectParent: "Seleccionar padre/madre",
    selectParentRequired: "Seleccione un padre o madre",
    relationshipType: "Tipo de relación",
    relationshipTypePlaceholder: "Tipo de relación",
    selectRelationshipType: "Seleccione el tipo de relación",
    father: "Padre",
    mother: "Madre",
    guardian: "Tutor",
    other: "Otro",
    principal: "Principal",
    delete: "Eliminar",
    addParentRelationship: "+ Agregar relación padre-hijo",
    emergencyContacts: "Contactos de emergencia",
    name: "Nombre",
    nameRequired: "El nombre es requerido",
    fullNamePlaceholder: "Nombre completo",
    relationship: "Relación",
    relationshipRequired: "La relación es requerida",
    relationshipPlaceholder: "Ej.: Abuela, Tío",
    phone: "Teléfono",
    phoneRequired: "El teléfono es requerido",
    phonePlaceholder: "+57 300 123 4567",
    primary: "Principal",
    emailOptional: "Correo (Opcional)",
    emailPlaceholder: "correo@ejemplo.com",
    addEmergencyContact: "+ Agregar contacto de emergencia",
    authorizedPickup: "Personas autorizadas para recoger",
    idDocument: "Documento de identidad",
    idDocumentPlaceholder: "Número de documento",
    photoOptional: "Foto (Opcional)",
    photoPlaceholder: "URL de foto",
    addAuthorizedPerson: "+ Agregar persona autorizada",
    medicalInfo: "Información médica",
    allergies: "Alergias",
    allergiesPlaceholder: "Describir alergias conocidas",
    medications: "Medicamentos",
    medicationsPlaceholder: "Medicamentos actuales",
    insuranceCompany: "Compañía de seguros",
    insuranceCompanyPlaceholder: "Nombre de la aseguradora",
    policyNumber: "Número de póliza",
    policyNumberPlaceholder: "Número de póliza",
    pediatrician: "Pediatra",
    pediatricianPlaceholder: "Nombre del pediatra",
    pediatricianPhone: "Teléfono del pediatra",
    additionalNotes: "Notas adicionales",
    additionalNotesPlaceholder: "Información médica adicional",
    addMedicalInfo: "+ Agregar información médica",
  },
} as const;

export const ChildEdit: React.FC = () => {
  const invalidate = useInvalidate();
  const go = useGo();
  const queryClient = useQueryClient();
  const { open } = useNotification();
  const { language } = useLanguage();
  const t = CHILD_EDIT_TRANSLATIONS[language];
  const { data: availableParents = [], isLoading: loadingParents } = useAvailableParents();
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [form] = Form.useForm();

  const { formProps, saveButtonProps, id } = useForm<UpdateChildData>({
    onMutationSuccess: async (data, variables) => {
      
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
      if (error?.response?.data?.message) {
        const errorMessages = Array.isArray(error.response.data.message) 
          ? error.response.data.message 
          : [error.response.data.message];
        
        errorMessages.forEach((msg: any, index: number) => {
        });
      }
      open?.({ 
        type: "error", 
        message: t.errorMessage, 
        description: t.errorMessage 
      });
    }
  });

  const handleProfileUpload = async (file: File) => {
    if (!id) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axiosInstance.post(`/children/${id}/profile-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newPath = response.data?.profilePicture;
      if (newPath) {
        form.setFieldValue('profilePicture', newPath);
        setProfilePreview(`https://api.thechildrenworld.com/api/uploads${newPath}`);
      }
    } catch {
      // Error handled by axios interceptor
    }
  };

  // Transform data for form - using formProps.initialValues
  React.useEffect(() => {
    if (formProps.initialValues) {
      const childData = formProps.initialValues;
      // Sync profile picture preview
      if (childData.profilePicture && !profilePreview) {
        const previewUrl = childData.profilePicture.startsWith('http')
          ? childData.profilePicture
          : `https://api.thechildrenworld.com/api/uploads${childData.profilePicture}`;
        setProfilePreview(previewUrl);
      }
      
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
      
      form.setFieldsValue(formData);
      
      // Force update switches after setting form values
      setTimeout(() => {
      }, 100);
    }
  }, [formProps.initialValues, form]);

  // Custom onFinish to transform data
  const handleFinish = (values: any) => {
    
    // Validar que haya al menos un padre asignado
    const parentRelationships = values.parentRelationships || [];
    if (parentRelationships.length === 0) {
      message.error(t.parentRequired);
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
    
    // Call the original formProps.onFinish with transformed values
    if (formProps.onFinish) {
      formProps.onFinish(transformedValues);
    } else {
      console.error("🔍 formProps.onFinish is not available!");
    }
  };


  // Override saveButtonProps to use our custom handleFinish
  const customSaveButtonProps = {
    ...saveButtonProps,
    onClick: () => {
      form.submit();
    }
  };

  return (
    <Edit
      title={t.title}
      saveButtonProps={{ ...customSaveButtonProps, children: t.save }}
      headerButtons={({ listButtonProps, refreshButtonProps }) => (
        <>
          {listButtonProps && <ListButton {...listButtonProps}>{t.children}</ListButton>}
          <RefreshButton {...refreshButtonProps}>{t.refresh}</RefreshButton>
        </>
      )}
    >
      <Form {...formProps} form={form} layout="vertical" onFinish={handleFinish}>
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
                format={language === "english" ? "MM-DD-YYYY" : "YYYY-MM-DD"}
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

          <Row gutter={16}>
            <Col span={24}>
        <Form.Item
          label={t.address}
          name="address"
        >
                <TextArea 
                  placeholder={t.addressPlaceholder}
            rows={3}
          />
        </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
        <Form.Item label={t.profilePicture} name="profilePicture" hidden>
          <Input />
        </Form.Item>
        <Form.Item label={t.profilePicture}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar
              size={64}
              src={profilePreview}
              icon={<UploadOutlined />}
            />
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => setProfilePreview(e.target?.result as string);
                reader.readAsDataURL(file);
                handleProfileUpload(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>{t.selectPhoto}</Button>
            </Upload>
          </div>
        </Form.Item>
            </Col>
          <Col span={12}>
              <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item
              label={t.paymentAlert}
              name="hasPaymentAlert"
              valuePropName="checked"
                  getValueFromEvent={(checked) => {
                    return checked;
                  }}
                  getValueProps={(value) => {
                    return { value: Boolean(value) };
                  }}
                >
                  <BooleanSwitch />
            </Form.Item>
            <Form.Item
              label={t.activeStatus}
              name="isActive"
              valuePropName="checked"
                  getValueFromEvent={(checked) => {
                    return checked;
                  }}
                  getValueProps={(value) => {
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
              <span>{t.parentChildRelationships}</span>
              <Text type="danger" style={{ fontSize: '14px' }}>{t.requiredMin1}</Text>
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
                          label={t.parent}
                          rules={[{ required: true, message: t.selectParentRequired }]}
                        >
                          <Select
                            placeholder={t.selectParent}
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
                          label={t.relationshipType}
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
                          name={[name, "isPrimary"]}
                          label={t.principal}
                          valuePropName="checked"
                          getValueFromEvent={(checked) => {
                            return checked;
                          }}
                          getValueProps={(value) => {
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
                          {t.delete}
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
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
                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label={t.name}
                          rules={[{ required: true, message: t.nameRequired }]}
                        >
                          <Input placeholder={t.fullNamePlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "relationship"]}
                          label={t.relationship}
                          rules={[{ required: true, message: t.relationshipRequired }]}
                        >
                          <Input placeholder={t.relationshipPlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "phone"]}
                          label={t.phone}
                          rules={[{ required: true, message: t.phoneRequired }]}
                        >
                          <Input placeholder={t.phonePlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "isPrimary"]}
                          label={t.primary}
                          valuePropName="checked"
                          getValueFromEvent={(checked) => {
                            return checked;
                          }}
                          getValueProps={(value) => {
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
                          {t.delete}
                        </Button>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "email"]}
                          label={t.emailOptional}
                        >
                          <Input placeholder={t.emailPlaceholder} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    {t.addEmergencyContact}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Authorized Pickup Persons */}
        <Card title={t.authorizedPickup} style={{ marginBottom: 16 }}>
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
                          label={t.name}
                          rules={[{ required: true, message: t.nameRequired }]}
                        >
                          <Input placeholder={t.fullNamePlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "relationship"]}
                          label={t.relationship}
                          rules={[{ required: true, message: t.relationshipRequired }]}
                        >
                          <Input placeholder={t.relationshipPlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "phone"]}
                          label={t.phone}
                          rules={[{ required: true, message: t.phoneRequired }]}
                        >
                          <Input placeholder={t.phonePlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "idDocument"]}
                          label={t.idDocument}
                        >
                          <Input placeholder={t.idDocumentPlaceholder} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "email"]}
                          label={t.emailOptional}
                        >
                          <Input placeholder={t.emailPlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "photo"]}
                          label={t.photoOptional}
                        >
                          <Input placeholder={t.photoPlaceholder} />
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
                          {t.delete}
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    {t.addAuthorizedPerson}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        {/* Medical Information */}
        <Card title={t.medicalInfo} style={{ marginBottom: 16 }}>
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
                          label={t.allergies}
                        >
                          <TextArea 
                            placeholder={t.allergiesPlaceholder}
                            rows={2}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "medications"]}
                          label={t.medications}
                        >
                          <TextArea 
                            placeholder={t.medicationsPlaceholder}
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
                          label={t.insuranceCompany}
                        >
                          <Input placeholder={t.insuranceCompanyPlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "insuranceNumber"]}
                          label={t.policyNumber}
                        >
                          <Input placeholder={t.policyNumberPlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "pediatricianName"]}
                          label={t.pediatrician}
                        >
                          <Input placeholder={t.pediatricianPlaceholder} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "pediatricianPhone"]}
                          label={t.pediatricianPhone}
                        >
                          <Input placeholder={t.phonePlaceholder} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "additionalNotes"]}
                          label={t.additionalNotes}
                        >
                          <TextArea 
                            placeholder={t.additionalNotesPlaceholder}
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
                          {t.delete}
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    {t.addMedicalInfo}
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