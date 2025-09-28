import React, { useState } from 'react';
import { Modal, Button, Space, Typography, Card, Row, Col, message, Spin } from 'antd';
import { QrcodeOutlined, DownloadOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons';
import { Child } from '../types/child.types';
import { useQRGenerator } from '../hooks/use-qr-generator.hook';

const { Title, Text } = Typography;

interface QRGeneratorProps {
  child: Child;
  visible: boolean;
  onClose: () => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ child, visible, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { isGenerating, generateQRCode, downloadQRAsPNG, downloadQRAsPDF } = useQRGenerator();

  const handleGenerateQR = async () => {
    try {
      const qrUrl = await generateQRCode(child);
      setQrCodeUrl(qrUrl);
      message.success('Codigo QR generado exitosamente');
    } catch (error) {
      message.error('Error al generar el codigo QR');
    }
  };

  const handleDownloadPNG = async () => {
    try {
      await downloadQRAsPNG(child);
      message.success('Codigo QR descargado como PNG');
    } catch (error) {
      message.error('Error al descargar el codigo QR como PNG');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadQRAsPDF(child);
      message.success('Codigo QR descargado como PDF');
    } catch (error) {
      message.error('Error al descargar el codigo QR como PDF');
    }
  };

  const handleClose = () => {
    setQrCodeUrl('');
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <QrcodeOutlined />
          <span>Generar Codigo QR - {child.firstName} {child.lastName}</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          Cerrar
        </Button>,
      ]}
      width={600}
    >
      <div style={{ textAlign: 'center' }}>
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title level={4}>Informacion del Nino</Title>
              <Text strong>ID: </Text>
              <Text>{child.id}</Text>
              <br />
              <Text strong>Nombre: </Text>
              <Text>{child.firstName} {child.lastName}</Text>
              <br />
              <Text strong>Fecha de Nacimiento: </Text>
              <Text>{new Date(child.birthDate).toLocaleDateString()}</Text>
            </Col>

            <Col span={24}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<QrcodeOutlined />}
                  onClick={handleGenerateQR}
                  loading={isGenerating}
                  size="large"
                >
                  Generar Codigo QR
                </Button>

                {qrCodeUrl && (
                  <>
                    <Card style={{ backgroundColor: '#f5f5f5' }}>
                      <img 
                        src={qrCodeUrl} 
                        alt="Codigo QR" 
                        style={{ 
                          maxWidth: '100%', 
                          height: 'auto',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px'
                        }} 
                      />
                    </Card>

                    <Space>
                      <Button
                        icon={<FileImageOutlined />}
                        onClick={handleDownloadPNG}
                        loading={isGenerating}
                      >
                        Descargar PNG
                      </Button>
                      <Button
                        icon={<FilePdfOutlined />}
                        onClick={handleDownloadPDF}
                        loading={isGenerating}
                      >
                        Descargar PDF
                      </Button>
                    </Space>
                  </>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

