import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Select, Input, DatePicker, TimePicker } from "antd";
import { useAuthorizedPickupPersons } from "../../domains/children";
import { axiosInstance } from "../../shared";
import dayjs from "dayjs";

const { TextArea } = Input;

export const AttendanceEdit: React.FC = () => {
  console.log("🔍 AttendanceEdit component mounted");
  
  const [form] = Form.useForm();
  
  const { formProps, saveButtonProps } = useForm<any>();

  // Debug logs
  console.log("🔍 Attendance Edit - formProps:", formProps);
  console.log("🔍 Attendance Edit - saveButtonProps:", saveButtonProps);
  console.log("🔍 Attendance Edit - formProps.initialValues:", formProps.initialValues);

  const record = formProps.initialValues;
  
  console.log("🔍 Attendance Edit - record:", record);
  console.log("🔍 Attendance Edit - record type:", typeof record);
  console.log("🔍 Attendance Edit - record is null/undefined:", record == null);

  // Transform form data for display
  React.useEffect(() => {
    if (record) {
      console.log("🔍 Attendance Edit - raw record from API:", record);
      console.log("🔍 Attendance Edit - record.checkInNotes:", record.checkInNotes);
      console.log("🔍 Attendance Edit - record.checkOutNotes:", record.checkOutNotes);
      console.log("🔍 Attendance Edit - record.notes:", record.notes);
      console.log("🔍 Attendance Edit - record.checkInTime:", record.checkInTime, typeof record.checkInTime);
      console.log("🔍 Attendance Edit - record.checkOutTime:", record.checkOutTime, typeof record.checkOutTime);
      
      // Debug all record properties to see what's available
      console.log("🔍 Attendance Edit - All record keys:", Object.keys(record));
      console.log("🔍 Attendance Edit - Record values:", Object.entries(record).filter(([key, value]) => 
        key.toLowerCase().includes('note') || key.toLowerCase().includes('check')
      ));
      
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
      console.log("🔍 Attendance Edit - setting form data:", formData);
      console.log("🔍 Attendance Edit - formData.checkInNotes:", formData.checkInNotes);
      console.log("🔍 Attendance Edit - formData.notes:", formData.notes);
      
      // Set form values explicitly
      form.setFieldsValue(formData);
      
      // Also try setting individual fields to ensure they're applied
      form.setFieldValue('checkInNotes', formData.checkInNotes);
      form.setFieldValue('notes', formData.notes);
    }
  }, [record, formProps.form]);

  const handleFinish = (values: any) => {
    console.log("🔍 Attendance Edit - handleFinish called with values:", values);
    console.log("🔍 Attendance Edit - attendanceDate type:", typeof values.attendanceDate);
    console.log("🔍 Attendance Edit - checkInTime type:", typeof values.checkInTime);
    console.log("🔍 Attendance Edit - checkOutTime type:", typeof values.checkOutTime);
    
    const transformedValues = {
      ...values,
      attendanceDate: values.attendanceDate && dayjs.isDayjs(values.attendanceDate) ? values.attendanceDate.format('YYYY-MM-DD') : values.attendanceDate,
      checkInTime: values.checkInTime && dayjs.isDayjs(values.checkInTime) ? values.checkInTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : values.checkInTime,
      checkOutTime: values.checkOutTime && dayjs.isDayjs(values.checkOutTime) ? values.checkOutTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : values.checkOutTime,
    };
    
    console.log("🔍 Attendance Edit - transformed values:", transformedValues);
    
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
      console.log("🔍 Attendance Edit - Save button clicked - triggering form submit");
      form.submit();
    }
  };

  // Show loading state if initialValues is not available yet
  if (!formProps.initialValues) {
    return <div>Loading...</div>;
  }

  return (
    <Edit title="Edit Attendance" saveButtonProps={customSaveButtonProps}>
      <AttendanceEditForm 
        formProps={formProps} 
        form={form}
        record={record} 
        onFinish={handleFinish}
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
}> = ({ formProps, form, record, onFinish }) => {
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
        label="Child"
        name="childId"
        rules={[{ required: true, message: "You must select a child" }]}
      >
        <Select
          {...childrenSelectProps}
          placeholder="Select a child"
          disabled
        />
      </Form.Item>

      <Form.Item
        label="Attendance Date"
        name="attendanceDate"
        rules={[{ required: true, message: "You must specify the date" }]}
        getValueFromEvent={(date) => {
          console.log("🔍 DatePicker getValueFromEvent:", date);
          return date;
        }}
        getValueProps={(value) => {
          console.log("🔍 DatePicker getValueProps:", value, typeof value);
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
          placeholder="Select the date"
        />
      </Form.Item>

      <Form.Item
        label="Check-in Time"
        name="checkInTime"
        getValueFromEvent={(time) => {
          console.log("🔍 TimePicker getValueFromEvent:", time);
          return time;
        }}
        getValueProps={(value) => {
          console.log("🔍 TimePicker getValueProps:", value, typeof value);
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
          placeholder="Select check-in time"
        />
      </Form.Item>

      <Form.Item
        label="Check-out Time"
        name="checkOutTime"
        getValueFromEvent={(time) => {
          console.log("🔍 TimePicker getValueFromEvent:", time);
          return time;
        }}
        getValueProps={(value) => {
          console.log("🔍 TimePicker getValueProps:", value, typeof value);
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
          placeholder="Select check-out time"
        />
      </Form.Item>

      <Form.Item
        label="Delivered by"
        name="deliveredBy"
      >
        <Select
          placeholder="Who delivers the child?"
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
        label="Picked up by"
        name="pickedUpBy"
      >
        <Select
          placeholder="Who picks up the child?"
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
        label="Check-in Notes"
        name="checkInNotes"
      >
        <TextArea
          rows={3}
          placeholder="Notes about the child's check-in"
        />
      </Form.Item>

      <Form.Item
        label="Check-out Notes"
        name="notes"
      >
        <TextArea
          rows={3}
          placeholder="Notes about the child's check-out"
        />
      </Form.Item>
    </Form>
  );
};
