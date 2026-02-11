import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Input, DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import { useAuthorizedPickupPersons } from "../../domains/children";
import { useLanguage } from "../../shared/contexts/language.context";

const { TextArea } = Input;

const ATTENDANCE_EDIT_TRANSLATIONS = {
  english: {
    title: "Edit Attendance",
    save: "Save",
    loading: "Loading...",
    child: "Child",
    childRequired: "You must select a child",
    selectChild: "Select a child",
    attendanceDate: "Attendance Date",
    attendanceDateRequired: "You must specify the date",
    selectDate: "Select the date",
    checkInTime: "Check-in Time",
    selectCheckInTime: "Select check-in time",
    checkOutTime: "Check-out Time",
    selectCheckOutTime: "Select check-out time",
    deliveredBy: "Delivered by",
    deliveredByPlaceholder: "Who delivers the child?",
    pickedUpBy: "Picked up by",
    pickedUpByPlaceholder: "Who picks up the child?",
    checkInNotes: "Check-in Notes",
    checkInNotesPlaceholder: "Notes about the child's check-in",
    checkOutNotes: "Check-out Notes",
    checkOutNotesPlaceholder: "Notes about the child's check-out",
  },
  spanish: {
    title: "Editar asistencia",
    save: "Guardar",
    loading: "Cargando...",
    child: "Niño",
    childRequired: "Debes seleccionar un niño",
    selectChild: "Selecciona un niño",
    attendanceDate: "Fecha de asistencia",
    attendanceDateRequired: "Debes especificar la fecha",
    selectDate: "Selecciona la fecha",
    checkInTime: "Hora de entrada",
    selectCheckInTime: "Selecciona hora de entrada",
    checkOutTime: "Hora de salida",
    selectCheckOutTime: "Selecciona hora de salida",
    deliveredBy: "Entregado por",
    deliveredByPlaceholder: "¿Quién entrega al niño?",
    pickedUpBy: "Recogido por",
    pickedUpByPlaceholder: "¿Quién recoge al niño?",
    checkInNotes: "Notas de entrada",
    checkInNotesPlaceholder: "Notas sobre la entrada del niño",
    checkOutNotes: "Notas de salida",
    checkOutNotesPlaceholder: "Notas sobre la salida del niño",
  },
} as const;

type AttendanceEditTranslations = (typeof ATTENDANCE_EDIT_TRANSLATIONS)[keyof typeof ATTENDANCE_EDIT_TRANSLATIONS];

export const AttendanceEdit: React.FC = () => {
  const [form] = Form.useForm();
  const { language } = useLanguage();
  const t = ATTENDANCE_EDIT_TRANSLATIONS[language];
  
  const { formProps, saveButtonProps } = useForm<any>();

  const record = formProps.initialValues;

  // Transform form data for display
  React.useEffect(() => {
    if (record) {
      const formData = {
        ...record,
        attendanceDate: record.attendanceDate ? dayjs(record.attendanceDate).isValid() ? dayjs(record.attendanceDate) : null : null,
        // Extract time from timestamp for TimePicker
        checkInTime: record.checkInTime ? dayjs(record.checkInTime).isValid() ? dayjs(record.checkInTime) : null : null,
        checkOutTime: record.checkOutTime ? dayjs(record.checkOutTime).isValid() ? dayjs(record.checkOutTime) : null : null,
        // Map notes correctly for the form
        checkInNotes: record.checkInNotes,
        notes: record.checkOutNotes || record.notes,
      };
      
      // Set form values explicitly
      form.setFieldsValue(formData);
      
      // Also try setting individual fields to ensure they're applied
      form.setFieldValue('checkInNotes', formData.checkInNotes);
      form.setFieldValue('notes', formData.notes);
    }
  }, [record, form]);

  const handleFinish = (values: any) => {
    const transformedValues = {
      ...values,
      attendanceDate: values.attendanceDate && dayjs.isDayjs(values.attendanceDate) ? values.attendanceDate.format('YYYY-MM-DD') : values.attendanceDate,
      checkInTime: values.checkInTime && dayjs.isDayjs(values.checkInTime) ? values.checkInTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : values.checkInTime,
      checkOutTime: values.checkOutTime && dayjs.isDayjs(values.checkOutTime) ? values.checkOutTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : values.checkOutTime,
    };

    // Call the original formProps.onFinish with transformed values
    if (formProps.onFinish) {
      formProps.onFinish(transformedValues);
    }
  };

  // Override saveButtonProps to use our custom handleFinish
  const customSaveButtonProps = {
    ...saveButtonProps,
    children: t.save,
    onClick: () => {
      form.submit();
    }
  };

  // Show loading state if initialValues is not available yet
  if (!formProps.initialValues) {
    return <div>{t.loading}</div>;
  }

  return (
    <Edit title={t.title} saveButtonProps={customSaveButtonProps}>
      <AttendanceEditForm 
        formProps={formProps} 
        form={form}
        record={record} 
        onFinish={handleFinish}
        t={t}
      />
    </Edit>
  );
};

// Separate component for the form to ensure hooks are called after useForm is ready
const AttendanceEditForm: React.FC<{
  formProps: any;
  form: any;
  record: any;
  onFinish: (values: any) => any;
  t: AttendanceEditTranslations;
}> = ({ formProps, form, record, onFinish, t }) => {
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
    <Form {...formProps} form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label={t.child}
        name="childId"
        rules={[{ required: true, message: t.childRequired }]}
      >
        <Select
          {...childrenSelectProps}
          placeholder={t.selectChild}
          disabled
        />
      </Form.Item>

      <Form.Item
        label={t.attendanceDate}
        name="attendanceDate"
        rules={[{ required: true, message: t.attendanceDateRequired }]}
        getValueFromEvent={(date) => date}
        getValueProps={(value) => {
          if (!value) return { value: null };
          if (dayjs.isDayjs(value)) return { value };
          if (typeof value === 'string') {
            const dayjsValue = dayjs(value);
            return { value: dayjsValue.isValid() ? dayjsValue : null };
          }
          return { value: null };
        }}
      >
        <DatePicker
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          placeholder={t.selectDate}
        />
      </Form.Item>

      <Form.Item
        label={t.checkInTime}
        name="checkInTime"
        getValueFromEvent={(time) => time}
        getValueProps={(value) => {
          if (!value) return { value: null };
          if (dayjs.isDayjs(value)) return { value };
          if (typeof value === 'string') {
            // Handle both timestamp and time-only formats
            const dayjsValue = dayjs(value);
            return { value: dayjsValue.isValid() ? dayjsValue : null };
          }
          return { value: null };
        }}
      >
        <TimePicker
          style={{ width: '100%' }}
          format="HH:mm"
          placeholder={t.selectCheckInTime}
        />
      </Form.Item>

      <Form.Item
        label={t.checkOutTime}
        name="checkOutTime"
        getValueFromEvent={(time) => time}
        getValueProps={(value) => {
          if (!value) return { value: null };
          if (dayjs.isDayjs(value)) return { value };
          if (typeof value === 'string') {
            // Handle both timestamp and time-only formats
            const dayjsValue = dayjs(value);
            return { value: dayjsValue.isValid() ? dayjsValue : null };
          }
          return { value: null };
        }}
      >
        <TimePicker
          style={{ width: '100%' }}
          format="HH:mm"
          placeholder={t.selectCheckOutTime}
        />
      </Form.Item>

      <Form.Item
        label={t.deliveredBy}
        name="deliveredBy"
      >
        <Select
          placeholder={t.deliveredByPlaceholder}
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
        label={t.pickedUpBy}
        name="pickedUpBy"
      >
        <Select
          placeholder={t.pickedUpByPlaceholder}
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
        label={t.checkInNotes}
        name="checkInNotes"
      >
        <TextArea
          rows={3}
          placeholder={t.checkInNotesPlaceholder}
        />
      </Form.Item>

      <Form.Item
        label={t.checkOutNotes}
        name="notes"
      >
        <TextArea
          rows={3}
          placeholder={t.checkOutNotesPlaceholder}
        />
      </Form.Item>
    </Form>
  );
};
