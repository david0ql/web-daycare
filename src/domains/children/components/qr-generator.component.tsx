import React, { useState } from 'react';
import { Modal, Button, Space, Typography, Card, Row, Col, message, Spin } from 'antd';
import { QrcodeOutlined, DownloadOutlined, FilePdfOutlined, FileImageOutlined } from '@ant-design/icons';
import { Child } from '../types/child.types';
import { ChildUtils } from '../utils/child.utils';
import { useQRGenerator } from '../hooks/use-qr-generator.hook';
import { useLanguage } from '../../../shared/contexts/language.context';
import { getIntlLocale } from '../../../shared/i18n/locale';

const { Title, Text } = Typography;

interface QRGeneratorProps {
  child: Child;
  visible: boolean;
  onClose: () => void;
}

const QR_GENERATOR_TRANSLATIONS = {
  english: {
    generateQrTitle: "Generate QR Code",
    close: "Close",
    childInfo: "Child Information",
    id: "ID",
    name: "Name",
    birthDate: "Birth Date",
    generateQr: "Generate QR Code",
    qrAlt: "QR Code",
    downloadPng: "Download PNG",
    downloadPdf: "Download PDF",
    qrGeneratedSuccess: "QR code generated successfully",
    qrGeneratedError: "Error generating QR code",
    pngDownloadedSuccess: "QR code downloaded as PNG",
    pngDownloadedError: "Error downloading QR code as PNG",
    pdfDownloadedSuccess: "QR code downloaded as PDF",
    pdfDownloadedError: "Error downloading QR code as PDF",
  },
  spanish: {
    generateQrTitle: "Generar código QR",
    close: "Cerrar",
    childInfo: "Información del niño",
    id: "ID",
    name: "Nombre",
    birthDate: "Fecha de nacimiento",
    generateQr: "Generar código QR",
    qrAlt: "Código QR",
    downloadPng: "Descargar PNG",
    downloadPdf: "Descargar PDF",
    qrGeneratedSuccess: "Código QR generado correctamente",
    qrGeneratedError: "Error al generar el código QR",
    pngDownloadedSuccess: "Código QR descargado como PNG",
    pngDownloadedError: "Error al descargar el código QR como PNG",
    pdfDownloadedSuccess: "Código QR descargado como PDF",
    pdfDownloadedError: "Error al descargar el código QR como PDF",
  },
} as const;

export const QRGenerator: React.FC<QRGeneratorProps> = ({ child, visible, onClose }) => {
  const { language } = useLanguage();
  const t = QR_GENERATOR_TRANSLATIONS[language];
  const intlLocale = getIntlLocale(language);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { isGenerating, generateQRCode, downloadQRAsPNG, downloadQRAsPDF } = useQRGenerator();

  const handleGenerateQR = async () => {
    try {
      const qrUrl = await generateQRCode(child);
      setQrCodeUrl(qrUrl);
      message.success(t.qrGeneratedSuccess);
    } catch (error) {
      message.error(t.qrGeneratedError);
    }
  };

  const handleDownloadPNG = async () => {
    try {
      await downloadQRAsPNG(child);
      message.success(t.pngDownloadedSuccess);
    } catch (error) {
      message.error(t.pngDownloadedError);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadQRAsPDF(child);
      message.success(t.pdfDownloadedSuccess);
    } catch (error) {
      message.error(t.pdfDownloadedError);
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
          <span>{t.generateQrTitle} - {child.firstName} {child.lastName}</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          {t.close}
        </Button>,
      ]}
      width={600}
    >
      <div style={{ textAlign: 'center' }}>
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title level={4}>{t.childInfo}</Title>
              <Text strong>{t.id}: </Text>
              <Text>{child.id}</Text>
              <br />
              <Text strong>{t.name}: </Text>
              <Text>{child.firstName} {child.lastName}</Text>
              <br />
              <Text strong>{t.birthDate}: </Text>
              <Text>{ChildUtils.parseDateOnly(child.birthDate).toLocaleDateString(intlLocale)}</Text>
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
                  {t.generateQr}
                </Button>

                {qrCodeUrl && (
                  <>
                    <Card style={{ backgroundColor: '#f5f5f5' }}>
                      <img 
                        src={qrCodeUrl} 
                        alt={t.qrAlt}
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
                        {t.downloadPng}
                      </Button>
                      <Button
                        icon={<FilePdfOutlined />}
                        onClick={handleDownloadPDF}
                        loading={isGenerating}
                      >
                        {t.downloadPdf}
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
