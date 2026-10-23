import { jsPDF } from 'jspdf';
import { Prescription } from '../types';

export function generatePrescriptionPDF(prescription: Prescription): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header banner
  doc.setFillColor(15, 118, 110); // Medical Teal
  doc.rect(0, 0, pageWidth, 32, 'F');

  // App / Hospital Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('MediAccess AI Telemedicine', 15, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Healthcare Without Communication Barriers | Digital E-Prescription', 15, 24);

  // Doctor Details (Right aligned on header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(prescription.doctorName, pageWidth - 15, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(prescription.doctorSpecialization, pageWidth - 15, 19, { align: 'right' });
  doc.text(`Reg: ${prescription.doctorLicense}`, pageWidth - 15, 24, { align: 'right' });

  // Patient Info Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 38, pageWidth - 30, 26, 3, 3, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Patient: ${prescription.patientName}`, 20, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Date: ${prescription.date}`, pageWidth - 20, 46, { align: 'right' });
  doc.text(`Rx ID: ${prescription.id.toUpperCase()}`, 20, 54);
  doc.text(`Follow-up: ${prescription.followUpDate || 'As needed'}`, pageWidth - 20, 54, { align: 'right' });

  // Diagnosis Section
  let currentY = 72;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Clinical Diagnosis:', 15, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(prescription.diagnosis, 62, currentY);

  currentY += 10;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, currentY, pageWidth - 15, currentY);

  // Rx Symbol
  currentY += 10;
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('℞', 15, currentY);

  doc.setFontSize(14);
  doc.text('Prescribed Medications', 26, currentY - 2);

  // Medicines List
  currentY += 8;
  prescription.medicines.forEach((med, index) => {
    // Medicine card container
    doc.setFillColor(index % 2 === 0 ? 248 : 255, index % 2 === 0 ? 250 : 255, index % 2 === 0 ? 252 : 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, currentY, pageWidth - 30, 20, 2, 2, 'FD');

    // Index & Name
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`${index + 1}. ${med.name} (${med.dosage})`, 20, currentY + 7);

    // Duration & Frequency
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.setFontSize(10);
    doc.text(`${med.frequency}  •  ${med.duration}`, pageWidth - 20, currentY + 7, { align: 'right' });

    // Instructions
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(`Directions: ${med.instructions}`, 20, currentY + 14);

    currentY += 23;
  });

  // Doctor Instructions / Advice
  if (prescription.instructions) {
    currentY += 6;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, currentY, pageWidth - 30, 24, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Doctor Advice & Lifestyle Guidance:', 20, currentY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const splitInstructions = doc.splitTextToSize(prescription.instructions, pageWidth - 40);
    doc.text(splitInstructions, 20, currentY + 16);

    currentY += 30;
  }

  // Footer & Digital Signature
  const footerY = 265;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, footerY, pageWidth - 15, footerY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated digital prescription verified under Telemedicine Guidelines.', 15, footerY + 7);
  doc.text('Voice-accessible via MediAccess AI app.', 15, footerY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text(`Digitally Signed by: ${prescription.doctorName}`, pageWidth - 15, footerY + 7, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`License: ${prescription.doctorLicense}`, pageWidth - 15, footerY + 12, { align: 'right' });

  // Save the PDF
  const cleanName = prescription.patientName.replace(/\s+/g, '_');
  doc.save(`Prescription_${cleanName}_${prescription.date}.pdf`);
}
