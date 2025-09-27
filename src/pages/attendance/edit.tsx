import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Input, DatePicker, TimePicker } from "antd";
import { useAuthorizedPickupPersons } from "../../domains/children";
import { axiosInstance } from "../../shared";
import dayjs from "dayjs";

const { TextArea } = Input;

export const AttendanceEdit: React.FC = () => {
  console.log("🔍 AttendanceEdit component mounted");
  
  const { formProps, saveButtonProps, queryResult } = useForm();
  const { data: attendanceData, isLoading, error } = queryResult || {};
  const record = attendanceData?.data;

  // Debug logs
  console.log("🔍 Attendance Edit - formProps:", formProps);
  console.log("🔍 Attendance Edit - saveButtonProps:", saveButtonProps);
  console.log("🔍 Attendance Edit - queryResult:", queryResult);
  console.log("🔍 Attendance Edit - attendanceData:", attendanceData);
  console.log("🔍 Attendance Edit - record:", record);
  console.log("🔍 Attendance Edit - error:", error);
  console.log("🔍 Attendance Edit - isLoading:", isLoading);

  // Show loading state if queryResult is not available yet or still loading
  if (!queryResult || isLoading) {
    return <div>Loading...</div>;
  }

  // Show error state if there's an error
  if (error) {
    return <div>Error loading attendance record: {error.message}</div>;
  }

  // Show message if no record found
  if (!record) {
    return <div>Attendance record not found</div>;
  }

  // Transform form data for display
  React.useEffect(() => {
    if (record) {
      const formData = {
        ...record,
        attendanceDate: record.attendanceDate ? dayjs(record.attendanceDate) : null,
        checkInTime: record.checkInTime ? dayjs(record.checkInTime, 'HH:mm') : null,
        checkOutTime: record.checkOutTime ? dayjs(record.checkOutTime, 'HH:mm') : null,
      };
      formProps.form?.setFieldsValue(formData);
    }
  }, [record, formProps.form]);

  const handleFinish = (values: any) => {
    const transformedValues = {
      ...values,
      attendanceDate: values.attendanceDate ? values.attendanceDate.format('YYYY-MM-DD') : null,
      checkInTime: values.checkInTime ? values.checkInTime.format('HH:mm') : null,
      checkOutTime: values.checkOutTime ? values.checkOutTime.format('HH:mm') : null,
    };
    
    console.log("🔍 Attendance Edit - transformed values:", transformedValues);
    return transformedValues;
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <AttendanceEditForm 
        formProps={formProps} 
        record={record} 
        onFinish={handleFinish}
      />
    </Edit>
  );
};

// Separate component for the form to ensure hooks are called after useForm is ready
const AttendanceEditForm: React.FC<{
  formProps: any;
  record: any;
  onFinish: (values: any) => any;
}> = ({ formProps, record, onFinish }) => {
  // Get children for the select
  const { selectProps: childrenSelectProps } = useSelect({
    resource: "children",
    optionLabel: "firstName",
    optionValue: "id",
    defaultValue: record?.childId,
  });

  // Get authorized pickup persons for the selected child
  const { data: authorizedPersons } = useAuthorizedPickupPersons(record?.childId);

  return (
    <Form {...formProps} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Niño"
        name="childId"
        rules={[{ required: true, message: "Debe seleccionar un niño" }]}
      >
        <Select
          {...childrenSelectProps}
          placeholder="Seleccione un niño"
          disabled
        />
      </Form.Item>

      <Form.Item
        label="Fecha de Asistencia"
        name="attendanceDate"
        rules={[{ required: true, message: "Debe especificar la fecha" }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          placeholder="Seleccione la fecha"
        />
      </Form.Item>

      <Form.Item
        label="Hora de Entrada"
        name="checkInTime"
      >
        <TimePicker
          style={{ width: '100%' }}
          format="HH:mm"
          placeholder="Seleccione la hora de entrada"
        />
      </Form.Item>

      <Form.Item
        label="Hora de Salida"
        name="checkOutTime"
      >
        <TimePicker
          style={{ width: '100%' }}
          format="HH:mm"
          placeholder="Seleccione la hora de salida"
        />
      </Form.Item>

      <Form.Item
        label="Entregado por"
        name="deliveredBy"
      >
        <Select
          placeholder="¿Quién entrega al niño?"
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={(authorizedPersons || []).map((person) => ({
            label: `${person.name} (${person.relationship})`,
            value: person.id,
          }))}
        />
      </Form.Item>

      <Form.Item
        label="Recogido por"
        name="pickedUpBy"
      >
        <Select
          placeholder="¿Quién recoge al niño?"
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={(authorizedPersons || []).map((person) => ({
            label: `${person.name} (${person.relationship})`,
            value: person.id,
          }))}
        />
      </Form.Item>

      <Form.Item
        label="Notas de Entrada"
        name="checkInNotes"
      >
        <TextArea
          rows={3}
          placeholder="Notas sobre la entrada del niño"
        />
      </Form.Item>

      <Form.Item
        label="Notas de Salida"
        name="checkOutNotes"
      >
        <TextArea
          rows={3}
          placeholder="Notas sobre la salida del niño"
        />
      </Form.Item>
    </Form>
  );
};
