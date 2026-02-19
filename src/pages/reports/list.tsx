import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, DatePicker, Space, Typography, Divider, message, Select } from 'antd';
import { FileTextOutlined, DownloadOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { axiosInstance } from '../../shared';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useLanguage } from '../../shared/contexts/language.context';

dayjs.extend(isoWeek);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const REPORT_LIST_TRANSLATIONS = {
  english: {
    documentTitle: "Report Generator | The Children's World",
    title: "Report Generator",
    subtitle: "Select a date range and generate the reports you need. Some reports have default dates if no range is specified.",
    dateConfig: "Date Configuration",
    dateRange: "Date Range",
    startDate: "Start date",
    endDate: "End date",
    dateNote: "* Weekly and monthly attendance reports will use default dates if no range is selected.",
    attendanceReport: "Attendance Report",
    weeklyAttendanceReport: "Weekly Attendance Report",
    monthlyAttendanceReport: "Monthly Attendance Report",
    paymentAlerts: "Payment Alerts",
    weeklyPaymentReport: "Weekly Payment Report by Child",
    generateReport: "Generate Report",
    attendanceReportDesc: "Generate an attendance report for the selected date range",
    weeklyAttendanceReportDesc: "Generate a weekly attendance report (uses default dates if no range is selected)",
    monthlyAttendanceReportDesc: "Generate a monthly attendance report (uses default dates if no range is selected)",
    paymentAlertsDesc: "Generate a report of all children with active payment alerts",
    weeklyPaymentReportDesc: "Generate a weekly report of all children with their payment status (Alert / Up to date). Uses current week if no date range is selected.",
    reportsByChild: "Reports by Child",
    reportsByChildDesc: "To generate individual reports by child, go to the children section and select \"Generate Report\" in the specific child's profile.",
    attendanceByChild: "Attendance by Child",
    attendanceByChildDesc: "Generate an attendance report for a specific child. Select the child and date range.",
    child: "Child",
    selectChild: "Select a child",
    selectDateRange: "Please select a date range",
    selectChildAndRange: "Please select a date range and a child",
    generatedSuccess: "generated successfully",
    paymentAlertsSuccess: "Payment alerts report generated successfully",
    weeklyPaymentSuccess: "Weekly payment report generated successfully",
    attendanceByChildSuccess: "Attendance by child report generated successfully",
    loadChildrenError: "Could not load children",
    generateErrorPrefix: "Error generating",
    paymentAlertsError: "Error generating payment alerts report",
    weeklyPaymentError: "Error generating weekly payment report",
    attendanceByChildError: "Error generating attendance by child report",
  },
  spanish: {
    documentTitle: "Generador de reportes | The Children's World",
    title: "Generador de reportes",
    subtitle: "Selecciona un rango de fechas y genera los reportes que necesites. Algunos reportes usan fechas por defecto si no se especifica rango.",
    dateConfig: "Configuración de fechas",
    dateRange: "Rango de fechas",
    startDate: "Fecha inicio",
    endDate: "Fecha fin",
    dateNote: "* Los reportes semanales y mensuales de asistencia usarán fechas por defecto si no se selecciona rango.",
    attendanceReport: "Reporte de asistencia",
    weeklyAttendanceReport: "Reporte de asistencia semanal",
    monthlyAttendanceReport: "Reporte de asistencia mensual",
    paymentAlerts: "Alertas de pago",
    weeklyPaymentReport: "Reporte de pagos semanal por niño",
    generateReport: "Generar reporte",
    attendanceReportDesc: "Genera un reporte de asistencia para el rango de fechas seleccionado",
    weeklyAttendanceReportDesc: "Genera un reporte de asistencia semanal (usa fechas por defecto si no se selecciona rango)",
    monthlyAttendanceReportDesc: "Genera un reporte de asistencia mensual (usa fechas por defecto si no se selecciona rango)",
    paymentAlertsDesc: "Genera un reporte de niños con alertas de pago activas",
    weeklyPaymentReportDesc: "Genera un reporte semanal de niños con su estado de pago (Alerta / Al día). Usa la semana actual si no se selecciona rango.",
    reportsByChild: "Reportes por niño",
    reportsByChildDesc: "Para generar reportes individuales por niño, ve a la sección de niños y selecciona \"Generar reporte\" en el perfil del niño.",
    attendanceByChild: "Asistencia por niño",
    attendanceByChildDesc: "Genera un reporte de asistencia para un niño específico. Selecciona el niño y el rango de fechas.",
    child: "Niño",
    selectChild: "Seleccionar un niño",
    selectDateRange: "Por favor selecciona un rango de fechas",
    selectChildAndRange: "Por favor selecciona un rango de fechas y un niño",
    generatedSuccess: "generado correctamente",
    paymentAlertsSuccess: "Reporte de alertas de pago generado correctamente",
    weeklyPaymentSuccess: "Reporte de pagos semanal generado correctamente",
    attendanceByChildSuccess: "Reporte de asistencia por niño generado correctamente",
    loadChildrenError: "No se pudieron cargar los niños",
    generateErrorPrefix: "Error al generar",
    paymentAlertsError: "Error al generar el reporte de alertas de pago",
    weeklyPaymentError: "Error al generar el reporte de pagos semanal",
    attendanceByChildError: "Error al generar el reporte de asistencia por niño",
  },
} as const;

interface ChildOption {
  id: number;
  firstName: string;
  lastName: string;
}

export const ReportList: React.FC = () => {
  const { language } = useLanguage();
  const t = REPORT_LIST_TRANSLATIONS[language];
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  // Attendance by child
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [dateRangeByChild, setDateRangeByChild] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  useEffect(() => {
    document.title = t.documentTitle;
  }, [t.documentTitle]);

  useEffect(() => {
    const fetchChildren = async () => {
      setLoadingChildren(true);
      try {
        const response = await axiosInstance.get<{ data?: ChildOption[] }>('/children');
        const list = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
        setChildren(list);
      } catch (error) {
        console.error('Error fetching children:', error);
        message.error(t.loadChildrenError);
      } finally {
        setLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  const doDownloadReport = async (
    reportType: string,
    endpoint: string,
    filename: string,
    startDate: dayjs.Dayjs,
    endDate: dayjs.Dayjs
  ) => {
    setLoading(reportType);
    try {
      const payload = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };
      const response = await axiosInstance.post(endpoint, payload, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success(`${reportType} ${t.generatedSuccess}`);
    } catch (error: any) {
      console.error('Error generating report:', error);
      message.error(`${t.generateErrorPrefix} ${reportType}: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateReport = async (reportType: string, endpoint: string, filename: string) => {
    if (!dateRange) {
      message.error(t.selectDateRange);
      return;
    }
    const [startDate, endDate] = dateRange;
    await doDownloadReport(reportType, endpoint, filename, startDate, endDate);
  };

  const handleGenerateWeeklyAttendanceReport = async () => {
    const startDate = dayjs().startOf('isoWeek');
    const endDate = dayjs().endOf('isoWeek');
    await doDownloadReport(
      t.weeklyAttendanceReport,
      '/reports/attendance/weekly',
      'weekly-attendance-report.pdf',
      startDate,
      endDate
    );
  };

  const handleGenerateMonthlyAttendanceReport = async () => {
    const startDate = dayjs().startOf('month');
    const endDate = dayjs().endOf('month');
    await doDownloadReport(
      t.monthlyAttendanceReport,
      '/reports/attendance/monthly',
      'monthly-attendance-report.pdf',
      startDate,
      endDate
    );
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

      message.success(t.paymentAlertsSuccess);
    } catch (error: any) {
      console.error('Error generating payment alerts report:', error);
      message.error(`${t.paymentAlertsError}: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateWeeklyPaymentReport = async () => {
    setLoading('weekly-payment-report-by-child');
    try {
      const payload = dateRange
        ? {
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD'),
          }
        : {};
      const response = await axiosInstance.post('/reports/payment/weekly', payload, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'weekly-payment-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success(t.weeklyPaymentSuccess);
    } catch (error: any) {
      console.error('Error generating weekly payment report:', error);
      message.error(error.response?.data?.message || t.weeklyPaymentError);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateAttendanceByChild = async () => {
    if (!dateRangeByChild || selectedChildId == null) {
      message.error(t.selectChildAndRange);
      return;
    }
    setLoading('attendance-by-child');
    try {
      const [startDate, endDate] = dateRangeByChild;
      const payload = {
        childId: selectedChildId,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };
      const response = await axiosInstance.post('/reports/attendance/by-child', payload, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const childName = children.find((c) => c.id === selectedChildId);
      const nameSlug = childName ? `${childName.firstName}-${childName.lastName}`.replace(/\s+/g, '-') : selectedChildId;
      link.setAttribute('download', `attendance-by-child-${nameSlug}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success(t.attendanceByChildSuccess);
    } catch (error: any) {
      console.error('Error generating attendance by child report:', error);
      message.error(error.response?.data?.message || t.attendanceByChildError);
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    {
      title: t.attendanceReport,
      description: t.attendanceReportDesc,
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      action: () => handleGenerateReport(
        t.attendanceReport,
        '/reports/attendance',
        'attendance-report.pdf'
      ),
    },
    {
      title: t.weeklyAttendanceReport,
      description: t.weeklyAttendanceReportDesc,
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      action: handleGenerateWeeklyAttendanceReport,
      noDateRequired: true,
    },
    {
      title: t.monthlyAttendanceReport,
      description: t.monthlyAttendanceReportDesc,
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      action: handleGenerateMonthlyAttendanceReport,
      noDateRequired: true,
    },
    {
      title: t.paymentAlerts,
      description: t.paymentAlertsDesc,
      icon: <FileTextOutlined style={{ fontSize: '24px', color: '#f5222d' }} />,
      action: handleGeneratePaymentAlerts,
      noDateRequired: true,
    },
    {
      title: t.weeklyPaymentReport,
      description: t.weeklyPaymentReportDesc,
      icon: <FileTextOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      action: handleGenerateWeeklyPaymentReport,
      noDateRequired: true,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>{t.title}</Title>
      <Text type="secondary">
        {t.subtitle}
      </Text>

      <Divider />

      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>{t.dateConfig}</Title>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>{t.dateRange}:</Text>
            <br />
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              format="YYYY-MM-DD"
              placeholder={[t.startDate, t.endDate]}
              style={{ marginTop: '8px' }}
            />
          </div>
          <Text type="secondary">
            {t.dateNote}
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
                  {t.generateReport}
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
        <Title level={4}>{t.reportsByChild}</Title>
        <Text type="secondary">
          {t.reportsByChildDesc}
        </Text>
      </Card>

      <Card style={{ marginTop: '24px' }}>
        <Title level={4}>
          <UserOutlined style={{ marginRight: 8 }} />
          {t.attendanceByChild}
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {t.attendanceByChildDesc}
        </Text>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>{t.child}:</Text>
            <br />
            <Select
              placeholder={t.selectChild}
              style={{ width: '100%', maxWidth: 400, marginTop: 8 }}
              loading={loadingChildren}
              value={selectedChildId ?? undefined}
              onChange={(value) => setSelectedChildId(value ?? null)}
              allowClear
              showSearch
              optionFilterProp="label"
              options={children.map((c) => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName}`,
              }))}
            />
          </div>
          <div>
            <Text strong>{t.dateRange}:</Text>
            <br />
            <RangePicker
              value={dateRangeByChild}
              onChange={(dates) => setDateRangeByChild(dates as [Dayjs, Dayjs] | null)}
              format="YYYY-MM-DD"
              placeholder={[t.startDate, t.endDate]}
              style={{ marginTop: 8 }}
            />
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={loading === 'attendance-by-child'}
            onClick={handleGenerateAttendanceByChild}
            disabled={!dateRangeByChild || selectedChildId == null}
          >
            {t.generateReport} - {t.attendanceByChild}
          </Button>
        </Space>
      </Card>
    </div>
  );
};
