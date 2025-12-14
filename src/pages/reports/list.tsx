import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    document.title = "Report Generator | The Children's World";
  }, []);

  const handleGenerateReport = async (reportType: string, endpoint: string, filename: string) => {
    if (!dateRange) {
      message.error('Please select a date range');
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
      message.error(`Error generating ${reportType}: ${error.response?.data?.message || error.message}`);
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

      message.success('Payment alerts report generated successfully');
    } catch (error: any) {
      console.error('Error generating payment alerts report:', error);
      message.error(`Error generating payment alerts report: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    {
      title: 'Attendance Report',
      description: 'Generate an attendance report for the selected date range',
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      action: () => handleGenerateReport(
        'Attendance Report',
        '/reports/attendance',
        'attendance-report.pdf'
      ),
    },
    {
      title: 'Weekly Attendance Report',
      description: 'Generate a weekly attendance report (uses default dates if no range is selected)',
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      action: () => handleGenerateReport(
        'Weekly Attendance Report',
        '/reports/attendance/weekly',
        'weekly-attendance-report.pdf'
      ),
    },
    {
      title: 'Monthly Attendance Report',
      description: 'Generate a monthly attendance report (uses default dates if no range is selected)',
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      action: () => handleGenerateReport(
        'Monthly Attendance Report',
        '/reports/attendance/monthly',
        'monthly-attendance-report.pdf'
      ),
    },
    {
      title: 'Payment Alerts',
      description: 'Generate a report of all children with active payment alerts',
      icon: <FileTextOutlined style={{ fontSize: '24px', color: '#f5222d' }} />,
      action: handleGeneratePaymentAlerts,
      noDateRequired: true,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Report Generator</Title>
      <Text type="secondary">
        Select a date range and generate the reports you need. 
        Some reports have default dates if no range is specified.
      </Text>

      <Divider />

      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Date Configuration</Title>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Date Range:</Text>
            <br />
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              format="YYYY-MM-DD"
              placeholder={['Start date', 'End date']}
              style={{ marginTop: '8px' }}
            />
          </div>
          <Text type="secondary">
            * Weekly and monthly attendance reports will use default dates if no range is selected.
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
                  Generate Report
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
        <Title level={4}>Reports by Child</Title>
        <Text type="secondary">
          To generate individual reports by child, go to the children section and select "Generate Report" 
          in the specific child's profile.
        </Text>
      </Card>
    </div>
  );
};
