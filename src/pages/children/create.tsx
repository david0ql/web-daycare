import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, DatePicker, Switch, Row, Col } from "antd";
import moment from "moment";

export const ChildCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
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
              getValueProps={(value) => ({
                value: value ? moment(value) : undefined,
              })}
              normalize={(value) => value && value.format("YYYY-MM-DD")}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Seleccione la fecha"
                disabledDate={(current) => current && current > moment().endOf("day")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ciudad de Nacimiento"
              name="birthCity"
            >
              <Input placeholder="Ciudad donde nació" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Dirección"
          name="address"
        >
          <Input.TextArea
            rows={3}
            placeholder="Dirección de residencia"
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
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Estado Activo"
              name="isActive"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
