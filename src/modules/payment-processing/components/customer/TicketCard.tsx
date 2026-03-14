'use client';

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Accept flexible types that work with both API and local types
interface TicketCardProps {
  ticket: {
    id: string;
    /** Backend stores QR payload as qrCodeData; qrCode kept for legacy support */
    qrCodeData?: string;
    qrCode?: string;
    checkedIn: boolean;
    checkedInAt?: string | Date;
    ticketTypeId: string;
    ticketNumber?: string;
    attendeeName?: string;
    status?: string;
  };
  event: {
    id: string;
    /** Accept either name (legacy) or title (API) */
    name?: string;
    title?: string;
    /** Accept either date (legacy) or startDate (API) */
    date?: string | Date;
    startDate?: string | Date;
    location: string;
    image?: string;
  };
  ticketType?: {
    id: string;
    name: string;
    price: number;
  };
  attendeeName: string;
}

/**
 * TicketCard Component
 * Displays ticket information with QR code
 * Provides download and print functionality
 * Requirements: 13.3, 13.4, 13.5
 */
export function TicketCard({ ticket, event, ticketType, attendeeName }: TicketCardProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<SVGSVGElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Resolve flexible field names from API vs legacy types
  const eventName = event.title || event.name || 'Event';
  const eventDateRaw = event.startDate || event.date || new Date().toISOString();
  const qrValue = ticket.qrCodeData || ticket.qrCode || ticket.id;

  const eventDate = new Date(eventDateRaw as string);
  const isPastEvent = eventDate < new Date();
  const isCheckedIn = ticket.checkedIn;
  
  // Format date and time
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Handle ticket download as PDF
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      
      // Background
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Header bar
      pdf.setFillColor(79, 70, 229);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EVENT TICKET', pageWidth / 2, 16, { align: 'center' });
      
      // Event name
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const eventNameLines = pdf.splitTextToSize(eventName, pageWidth - margin * 2);
      pdf.text(eventNameLines, pageWidth / 2, 40, { align: 'center' });
      
      const yPos = 40 + (eventNameLines.length * 8);
      
      // Event details
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      
      pdf.text(`📅 ${formattedDate}`, margin, yPos + 10);
      pdf.text(`🕐 ${formattedTime}`, margin, yPos + 18);
      pdf.text(`📍 ${event.location}`, margin, yPos + 26);
      
      // Ticket type
      if (ticketType) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(79, 70, 229);
        pdf.text(`Ticket Type: ${ticketType.name}`, margin, yPos + 40);
      }
      
      // Attendee name
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Attendee: ${attendeeName}`, margin, yPos + 50);
      
      // QR Code section
      const qrSize = 50;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = yPos + 60;
      
      // QR Code border
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 3, 3, 'S');
      
      // QR Code placeholder text (since we can't easily render QR in PDF without additional deps)
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text('QR Code:', qrX + qrSize / 2, qrY + 10, { align: 'center' });
      pdf.setFontSize(6);
      pdf.text((qrValue || '').substring(0, 30), qrX + qrSize / 2, qrY + qrSize / 2, { align: 'center' });
      
      // QR Code label
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Scan for entry', pageWidth / 2, qrY + qrSize + 8, { align: 'center' });
      
      // Ticket ID
      pdf.setFontSize(8);
      pdf.text(`Ticket ID: ${ticket.id}`, pageWidth / 2, qrY + qrSize + 14, { align: 'center' });
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text('This ticket is valid for one-time entry only.', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save PDF
      pdf.save(`ticket-${eventName.replace(/\s+/g, '-').toLowerCase()}-${ticket.id}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      // Fallback: try simpler PDF generation
      try {
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        
        pdf.setFontSize(20);
        pdf.text('Event Ticket', 105, 20, { align: 'center' });
        
        pdf.setFontSize(16);
        pdf.text(eventName, 105, 40, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.text(`Date: ${formattedDate}`, 20, 60);
        pdf.text(`Time: ${formattedTime}`, 20, 70);
        pdf.text(`Location: ${event.location}`, 20, 80);
        pdf.text(`Ticket Type: ${ticketType?.name || 'Standard'}`, 20, 90);
        pdf.text(`Attendee: ${attendeeName}`, 20, 100);
        pdf.text(`QR Code: ${(qrValue || '').substring(0, 40)}`, 20, 110);
        pdf.text(`Ticket ID: ${ticket.id}`, 20, 120);
        
        pdf.save(`ticket-${ticket.id}.pdf`);
      } catch (fallbackError) {
        console.error('Fallback PDF generation failed:', fallbackError);
        alert('Failed to download ticket. Please try again.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle ticket print — capture QR SVG from DOM for real scannable output
  const handlePrint = () => {
    // Grab the rendered QR SVG from DOM and inline it
    const qrSvgEl = qrRef.current;
    const qrSvgString = qrSvgEl
      ? `<div class="qr-code">${qrSvgEl.outerHTML}</div>`
      : `<div class="qr-code" style="padding:10px;font-size:9px;word-break:break-all;">${qrValue}</div>`;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Event Ticket - ${eventName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
            }
            .ticket {
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 30px;
              background: #fff;
            }
            .header {
              background: linear-gradient(135deg, #4f46e5, #7c3aed);
              color: white;
              padding: 20px;
              margin: -30px -30px 20px -30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .event-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #1e293b;
            }
            .detail {
              margin: 10px 0;
              color: #475569;
            }
            .qr-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
            }
            .qr-code {
              display: inline-block;
              padding: 10px;
              background: white;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
            }
            .ticket-id {
              font-size: 12px;
              color: #94a3b8;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
              margin-top: 20px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1 style="margin: 0; font-size: 18px;">EVENT TICKET</h1>
            </div>
            <div class="event-name">${eventName}</div>
            <div class="detail">📅 ${formattedDate}</div>
            <div class="detail">🕐 ${formattedTime}</div>
            <div class="detail">📍 ${event.location}</div>
            <div class="detail" style="margin-top: 20px;">
              <strong>Ticket Type:</strong> ${ticketType?.name || 'Standard'}
            </div>
            <div class="detail">
              <strong>Attendee:</strong> ${attendeeName}
            </div>
            <div class="qr-section">
              ${qrSvgString}
              <div class="ticket-id">Ticket ID: ${ticket.id}</div>
            </div>
            <div class="footer">
              This ticket is valid for one-time entry only.
            </div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div
      ref={ticketRef}
      className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden ${
        isPastEvent
          ? 'border-slate-300 dark:border-slate-700 opacity-75'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Ticket Header */}
      <div className={`p-4 ${
        isPastEvent
          ? 'bg-slate-100 dark:bg-slate-800'
          : 'bg-gradient-to-r from-indigo-600 to-purple-600'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            isPastEvent ? 'text-slate-600 dark:text-slate-400' : 'text-white/80'
          }`}>
            {isPastEvent ? 'Past Event' : 'Upcoming Event'}
          </span>
          {isCheckedIn && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              ✓ Checked In
            </span>
          )}
          {ticketType && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isPastEvent
                ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                : 'bg-white/20 text-white'
            }`}>
              {ticketType.name}
            </span>
          )}
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-6">
        <div className="flex gap-6">
          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 truncate">
              {eventName}
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span>📅</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span>🕐</span>
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span>📍</span>
                <span className="truncate">{event.location}</span>
              </div>
              {ticketType && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span>🎫</span>
                  <span>{ticketType.name}{ticketType.price > 0 ? ` - $${ticketType.price.toFixed(2)}` : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0">
            <div className="p-3 bg-white rounded-lg border border-slate-200 dark:border-slate-700">
              <QRCodeSVG
                ref={qrRef}
                value={qrValue || ticket.id}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
              Scan for entry
            </p>
          </div>
        </div>

        {/* Ticket Number */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            {ticket.ticketNumber && (
              <p className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {ticket.ticketNumber}
              </p>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500">
              ID: {ticket.id.substring(0, 8)}...
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            ticket.status === 'CHECKED_IN'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : ticket.status === 'ISSUED'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {ticket.status}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <span>⬇️</span>
              Download PDF
            </>
          )}
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
        >
          <span>🖨️</span>
          Print
        </button>
      </div>
    </div>
  );
}


