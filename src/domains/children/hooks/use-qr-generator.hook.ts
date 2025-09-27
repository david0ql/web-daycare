import { useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Child } from '../types/child.types';

interface QRData {
  id: number;
  name: string;
  fullName: string;
  birthDate: string;
  generatedAt: string;
}

export const useQRGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRData = (child: Child): QRData => {
    return {
      id: child.id,
      name: `${child.firstName} ${child.lastName}`,
      fullName: `${child.firstName} ${child.lastName}`,
      birthDate: child.birthDate,
      generatedAt: new Date().toISOString(),
    };
  };

  const generateQRCode = async (child: Child): Promise<string> => {
    setIsGenerating(true);
    try {
      const qrData = generateQRData(child);
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRAsPNG = async (child: Child): Promise<void> => {
    try {
      const qrDataURL = await generateQRCode(child);
      
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = qrDataURL;
      link.download = `QR_${child.firstName}_${child.lastName}_${child.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading QR as PNG:', error);
      throw error;
    }
  };

  const downloadQRAsPDF = async (child: Child): Promise<void> => {
    try {
      const qrDataURL = await generateQRCode(child);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add title
      pdf.setFontSize(20);
      pdf.text(`Codigo QR - ${child.firstName} ${child.lastName}`, 20, 20);

      // Add child information
      pdf.setFontSize(12);
      pdf.text(`ID: ${child.id}`, 20, 35);
      pdf.text(`Nombre: ${child.firstName} ${child.lastName}`, 20, 45);
      pdf.text(`Fecha de Nacimiento: ${new Date(child.birthDate).toLocaleDateString()}`, 20, 55);
      pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 20, 65);

      // Add QR code
      const imgWidth = 60;
      const imgHeight = 60;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const x = (pageWidth - imgWidth) / 2;
      
      pdf.addImage(qrDataURL, 'PNG', x, 80, imgWidth, imgHeight);

      // Add instructions
      pdf.setFontSize(10);
      pdf.text('Este codigo QR contiene informacion del nino para identificacion rapida.', 20, 160);
      pdf.text('Escanea el codigo para acceder a la informacion del nino.', 20, 170);

      // Download PDF
      pdf.save(`QR_${child.firstName}_${child.lastName}_${child.id}.pdf`);
    } catch (error) {
      console.error('Error downloading QR as PDF:', error);
      throw error;
    }
  };

  return {
    isGenerating,
    generateQRCode,
    downloadQRAsPNG,
    downloadQRAsPDF,
  };
};
