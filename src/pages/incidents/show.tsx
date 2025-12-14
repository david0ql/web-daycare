import React from 'react';
import { Show, EditButton, DeleteButton } from '@refinedev/antd';
import { useOne } from '@refinedev/core';
import { Typography, Card, Row, Col, Tag, Space, Button, Image, Divider, message } from 'antd';
import { BellOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMarkParentNotified, useDeleteIncident, getSeverityColor, getSeverityLabel, formatIncidentDate, getIncidentStatus, getAttachmentUrl } from '../../domains/incidents';
import { useQueryClient } from '@tanstack/react-query';
import { IncidentAttachments } from './attachments';

const { Title, Text, Paragraph } = Typography;

export const IncidentsShow: React.FC = () => {
  const { result: incident, query: incidentQuery } = useOne({
    resource: 'incidents',
  }) as any;
  const isLoading = incidentQuery.isLoading;

  const queryClient = useQueryClient();
  const markParentNotifiedMutation = useMarkParentNotified();
  const deleteIncidentMutation = useDeleteIncident();

  const handleMarkParentNotified = async () => {
    try {
      await markParentNotifiedMutation.mutateAsync({ incidentId: incident.id });
      message.success('Incident marked as notified to parents');
    } catch (error) {
      message.error('Error marking as notified');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIncidentMutation.mutateAsync(incident.id);
      message.success('Incident deleted successfully');
    } catch (error) {
      message.error('Error deleting incident');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!incident) {
    return <div>Incident not found</div>;
  }

  const status = getIncidentStatus(incident.parentNotified);

  return (
    <Show
      title="Incident Details"
      headerButtons={[
        <EditButton key="edit" icon={<EditOutlined />} />,
        !incident.parentNotified && (
          <Button
            key="notify"
            type="primary"
            icon={<BellOutlined />}
            onClick={handleMarkParentNotified}
            loading={markParentNotifiedMutation.isPending}
          >
            Mark as Notified
          </Button>
        ),
        <DeleteButton
          key="delete"
          icon={<DeleteOutlined />}
          confirmTitle="Are you sure you want to delete this incident?"
          confirmOkText="Yes, delete"
          confirmCancelText="Cancel"
        />,
      ]}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="General Information">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Incident ID:</Text>
                <br />
                <Text>{incident.id}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Status:</Text>
                <br />
                <Tag color={status.status}>{status.text}</Tag>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Incident Details">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Title:</Text>
                <br />
                <Text>{incident.title}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Incident Date:</Text>
                <br />
                <Text>{formatIncidentDate(incident.incidentDate)}</Text>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Child:</Text>
                <br />
                <Text>{incident.child?.firstName} {incident.child?.lastName}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Location:</Text>
                <br />
                <Text>{incident.location || 'Not specified'}</Text>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Incident Type:</Text>
                <br />
                <Space>
                  <Text>{incident.incidentType?.name}</Text>
                  <Tag color={getSeverityColor(incident.incidentType?.severityLevel)}>
                    {getSeverityLabel(incident.incidentType?.severityLevel)}
                  </Tag>
                </Space>
              </Col>
              <Col span={12}>
                <Text strong>Reported by:</Text>
                <br />
                <Text>{incident.reportedBy2?.firstName} {incident.reportedBy2?.lastName}</Text>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Description">
            <Paragraph>{incident.description}</Paragraph>
          </Card>
        </Col>

        {incident.actionTaken && (
          <Col span={24}>
            <Card title="Action Taken">
              <Paragraph>{incident.actionTaken}</Paragraph>
            </Card>
          </Col>
        )}

        <Col span={24}>
          <Card title="Attachments">
            <IncidentAttachments
              incidentId={incident.id}
              attachments={incident.incidentAttachments || []}
              onAttachmentsChange={() => {
                // Refresh the incident data
                queryClient.invalidateQueries({
                  predicate: (query) => {
                    const key = query.queryKey;
                    return Array.isArray(key) && key.some(k => k === "incidents");
                  },
                });
              }}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="System Information">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Created:</Text>
                <br />
                <Text>{new Date(incident.createdAt).toLocaleString()}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Last updated:</Text>
                <br />
                <Text>{new Date(incident.updatedAt).toLocaleString()}</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Show>
  );
};