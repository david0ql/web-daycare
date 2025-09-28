import React, { useState } from 'react';
import { Card, Row, Col, Button, DatePicker, Space, Typography, Divider, message } from 'antd';
import { FileTextOutlined, DownloadOutlined, CalendarOutlined } from '@ant-design/icons';
import { axiosInstance } from '../../shared';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Set dayjs locale
dayjs.locale('es');

export const ReportList: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleGenerateReport = async (reportType: string, endpoint: string, filename: string) => {
    if (!dateRange) {
      message.error('Por favor seleccione un rango de fechas');
      return;
    }

    setLoading(reportType);
    try {
      const [startDate, endDate] = dateRange;
      const payload = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };

      const response = await axiosInstance.post(endpoint, payload, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(`${reportType} generado exitosamente`);
    } catch (error: any) {
      console.error('Error generating report:', error);
      message.error(`Error al generar ${reportType}: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleGeneratePaymentAlerts = async () => {
    setLoading('payment-alerts');
    try {
      const response = await axiosInstance.get('/reports/payment-alerts', {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payment-alerts-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Reporte de alertas de pago generado exitosamente');
    } catch (error: any) {
      console.error('Error generating payment alerts report:', error);
      message.error(`Error al generar reporte de alertas de pago: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    {
      title: 'Reporte de Asistencia',
      description: 'Genera un reporte de asistencia para el rango de fechas seleccionado',
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      action: () => handleGenerateReport(
        'Reporte de Asistencia',
        '/reports/attendance',
        'attendance-report.pdf'
      ),
    },
    {
      title: 'Reporte de Asistencia Semanal',
      description: 'Genera un reporte de asistencia semanal (usa fechas por defecto si no se selecciona rango)',
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      action: () => handleGenerateReport(
        'Reporte de Asistencia Semanal',
        '/reports/attendance/weekly',
        'weekly-attendance-report.pdf'
      ),
    },
    {
      title: 'Reporte de Asistencia Mensual',
      description: 'Genera un reporte de asistencia mensual (usa fechas por defecto si no se selecciona rango)',
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      action: () => handleGenerateReport(
        'Reporte de Asistencia Mensual',
        '/reports/attendance/monthly',
        'monthly-attendance-report.pdf'
      ),
    },
    {
      title: 'Alertas de Pago',
      description: 'Genera un reporte de todos los niños con alertas de pago activas',
      icon: <FileTextOutlined style={{ fontSize: '24px', color: '#f5222d' }} />,
      action: handleGeneratePaymentAlerts,
      noDateRequired: true,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Generador de Reportes</Title>
      <Text type="secondary">
        Seleccione un rango de fechas y genere los reportes que necesite. 
        Algunos reportes tienen fechas por defecto si no se especifica un rango.
      </Text>

      <Divider />

      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Configuración de Fechas</Title>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Rango de Fechas:</Text>
            <br />
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              format="YYYY-MM-DD"
              placeholder={['Fecha inicio', 'Fecha fin']}
              style={{ marginTop: '8px' }}
            />
          </div>
          <Text type="secondary">
            * Los reportes de asistencia semanal y mensual usarán fechas por defecto si no se selecciona un rango.
          </Text>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {reports.map((report, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              hoverable
              style={{ height: '100%' }}
              actions={[
                <Button
                  key="generate"
                  type="primary"
                  icon={<DownloadOutlined />}
                  loading={loading === report.title.toLowerCase().replace(/\s+/g, '-')}
                  onClick={report.action}
                  disabled={!report.noDateRequired && !dateRange}
                >
                  Generar Reporte
                </Button>,
              ]}
            >
              <Card.Meta
                avatar={report.icon}
                title={report.title}
                description={report.description}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      <Card>
        <Title level={4}>Reportes por Niño</Title>
        <Text type="secondary">
          Para generar reportes individuales por niño, vaya a la sección de niños y seleccione "Generar Reporte" 
          en el perfil del niño específico.
        </Text>
      </Card>
    </div>
  );
};
