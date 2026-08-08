import React, { useState } from 'react';
import { INITIAL_SERVICES, getStoredSiteConfig } from '../utils/storage';
import { X, Printer, Wrench, Shield, CheckCircle2, FileText, Smartphone, Receipt, Sliders, CreditCard } from 'lucide-react';

export default function WorkOrderModal({ queue, onClose }) {
  const [printMode, setPrintMode] = useState('a4'); // 'a4' or 'thermal'
  const [thermalWidth, setThermalWidth] = useState('58mm'); // '58mm' or '80mm'

  if (!queue) return null;

  const siteConfig = getStoredSiteConfig();
  const bankName = siteConfig.bankName || 'BCA (Bank Central Asia)';
  const bankAccount = siteConfig.bankAccount || '8830-1928-37';
  const bankHolder = siteConfig.bankHolder || 'FSTWORKS GARAGE OFFICIAL';

  const getServiceItems = () => {
    return (queue.services || []).map(id => {
      const s = INITIAL_SERVICES.find(srv => srv.id === id);
      return s || { name: id, price: 0 };
    });
  };

  const servicesList = getServiceItems();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatWAPhone = (phoneStr) => {
    let cleaned = (phoneStr || '').replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  const handleSendWA = () => {
    const waPhone = formatWAPhone(queue.phone);
    const servicesText = servicesList.map(s => `  • ${s.name}: ${s.price === 0 ? 'FREE' : formatCurrency(s.price)}`).join('\n');
    const totalCostStr = queue.estimatedCost === 0 ? 'FREE' : formatCurrency(queue.estimatedCost);

    const message = 
`*NOTA & SURAT PERINTAH KERJA (SPK) - FSTWORKS* 📜⚙️
━━━━━━━━━━━━━━━━━━━━━━━━━━

Halo Bpk/Ibu *${queue.customerName}*,
Berikut rincian digital Nota / SPK kendaraan Anda:

🚘 *DETAIL KENDARAAN:*
• No. SPK      : *${queue.id}*
• Plat Mobil   : *${queue.licensePlate}* (${queue.carModel})
• Tanggal      : ${new Date(queue.createdAt || Date.now()).toLocaleDateString('id-ID')}

🛠️ *RINCIAN PEKERJAAN & SUKU CADANG:*
${servicesText}
${queue.customManualText ? `  • Layanan Custom: "${queue.customManualText}"\n` : ''}
💰 *TOTAL ESTIMASI BIAYA:* *${totalCostStr}*

💳 *INFORMASI REKENING TRANSFER:*
• Bank      : *${bankName}*
• No. Rek   : *${bankAccount}*
• A/N       : *${bankHolder}*

Status Pengerjaan: *${queue.status || 'BOOKING'}*
Terima kasih telah mempercayakan perbaikan kendaraan Anda pada *FSTWORKS Garage*! 🙏`;

    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // PURE PRINT GENERATOR FUNCTION (OPTIMIZED FOR HARDWARE AUTO-CUTTER)
  const handleGenerateAndPrint = (selectedMode = printMode) => {
    const isThermal = selectedMode === 'thermal';
    const paperWidth = thermalWidth === '80mm' ? '80mm' : '58mm';
    const fontBase = isThermal ? (thermalWidth === '80mm' ? '12px' : '10px') : '13px';

    const printWindow = window.open('', '_blank', 'width=850,height=950');

    const totalCostText = queue.estimatedCost === 0 ? 'FREE' : formatCurrency(queue.estimatedCost);
    const dateText = new Date(queue.createdAt || Date.now()).toLocaleDateString('id-ID');

    const servicesRowsHTML = servicesList.map((srv, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px 10px; color: #334155;">${idx + 1}</td>
        <td style="padding: 8px 10px; font-weight: 700; color: #0f172a;">${srv.name}</td>
        <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: #0f172a;">${srv.price === 0 ? 'FREE' : formatCurrency(srv.price)}</td>
      </tr>
    `).join('');

    const documentContent = isThermal ? `
      <div style="font-family: monospace, sans-serif; font-size: ${fontBase}; width: ${paperWidth}; max-width: ${paperWidth}; margin: 0 auto; padding: 4px; box-sizing: border-box; color: #000;">
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
          <h2 style="font-size: ${thermalWidth === '80mm' ? '16px' : '13px'}; margin: 0; font-weight: 900;">FSTWORKS GARAGE</h2>
          <div style="font-size: ${thermalWidth === '80mm' ? '11px' : '9px'}; font-weight: bold;">UNDERCARRIAGE SPECIALIST</div>
          <div style="font-size: ${thermalWidth === '80mm' ? '10px' : '8px'}; margin-top: 2px;">JL. RAYA OTOMOTIF NO. 88</div>
          <div style="font-size: ${thermalWidth === '80mm' ? '10px' : '8px'};">TELP/WA: 0812-3456-7890</div>
        </div>

        <div style="border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 8px;">
          <div>NO  : <strong>${queue.id}</strong></div>
          <div>TGL : ${dateText}</div>
          <div>CUST: ${queue.customerName}</div>
          <div>PLAT: <strong>${queue.licensePlate}</strong> (${queue.carModel})</div>
        </div>

        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px;">
            <span>ITEM SERVIS</span>
            <span>HARGA</span>
          </div>
          ${servicesList.map(srv => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>${srv.name}</span>
              <span>${srv.price === 0 ? 'FREE' : formatCurrency(srv.price)}</span>
            </div>
          `).join('')}
        </div>

        <div style="border-top: 1px dashed #000; padding-top: 6px; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: ${thermalWidth === '80mm' ? '14px' : '12px'};">
            <span>TOTAL:</span>
            <span>${totalCostText}</span>
          </div>
        </div>

        <!-- Bank Transfer Info Box (Thermal) -->
        <div style="border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 10px; font-size: ${thermalWidth === '80mm' ? '10px' : '8px'};">
          <div style="font-weight: bold; margin-bottom: 2px;">PEMBAYARAN TRANSFER:</div>
          <div>BANK : ${bankName}</div>
          <div>REK  : <strong>${bankAccount}</strong></div>
          <div>A/N  : ${bankHolder}</div>
        </div>

        <div style="text-align: center; font-size: ${thermalWidth === '80mm' ? '10px' : '8px'}; margin-top: 6px;">
          *** TERIMA KASIH ***<br/>
          GARANSI BENGKEL FSTWORKS<br/>
          SIMPAN STRUK SEBAGAI BUKTI
        </div>
        <!-- Auto-Cutter Line Feed Space -->
        <div style="height: 12px; width: 100%;"></div>
      </div>
    ` : `
      <div style="padding: 20px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #ffffff; color: #000000;">
        
        <!-- Header Document -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">FSTWORKS BENGKEL SPESIALIS KAKI-KAKI</h1>
            <p style="font-size: 12px; color: #334155; margin: 3px 0 0; font-weight: 600;">
              Jl. Raya Utama No. 88, Pusat Suspensi & Steering • Telp/WA: 0812-3456-7890
            </p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; font-weight: 700; color: #475569;">NO. SPK / NOTA WORKSHOP</div>
            <div style="font-size: 18px; font-weight: 900; color: #d97706; margin: 2px 0;">${queue.id}</div>
            <div style="font-size: 11px; color: #475569; font-weight: 600;">Tanggal: ${dateText}</div>
          </div>
        </div>

        <!-- Info Box -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 13px; border: 1px solid #cbd5e1;">
          <tbody>
            <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1;">
              <td style="padding: 8px 12px; font-weight: 700; width: 18%; color: #334155;">Pelanggan:</td>
              <td style="padding: 8px 12px; width: 32%; color: #0f172a; font-weight: 600;">${queue.customerName} (${queue.phone})</td>
              <td style="padding: 8px 12px; font-weight: 700; width: 18%; color: #334155;">Plat Nomor:</td>
              <td style="padding: 8px 12px; width: 32%; font-weight: 800; color: #b45309; font-size: 15px;">${queue.licensePlate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 700; color: #334155;">Kendaraan:</td>
              <td style="padding: 8px 12px; color: #0f172a; font-weight: 600;">${queue.carModel}</td>
              <td style="padding: 8px 12px; font-weight: 700; color: #334155;">Status:</td>
              <td style="padding: 8px 12px; font-weight: 800; color: #166534;">${queue.status || 'PROSES PENGERJAAN'}</td>
            </tr>
          </tbody>
        </table>

        <!-- Services Table -->
        <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 6px; color: #0f172a; text-transform: uppercase;">Rincian Pekerjaan & Suku Cadang:</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 13px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff;">
              <th style="padding: 8px 12px; text-align: left; color: #ffffff; width: 8%;">No</th>
              <th style="padding: 8px 12px; text-align: left; color: #ffffff;">Item Pekerjaan / Servis</th>
              <th style="padding: 8px 12px; text-align: right; color: #ffffff; width: 30%;">Harga Estimasi</th>
            </tr>
          </thead>
          <tbody>
            ${servicesRowsHTML}
            <tr style="background: #fef3c7; font-weight: 800; border-top: 2px solid #d97706;">
              <td colSpan="2" style="padding: 10px 12px; text-align: right; color: #78350f; font-size: 13px;">TOTAL BIAYA:</td>
              <td style="padding: 10px 12px; text-align: right; font-size: 16px; color: #b45309; font-weight: 900;">${totalCostText}</td>
            </tr>
          </tbody>
        </table>

        <!-- Bank Transfer Info Box (A4 Document) -->
        <div style="background: #f1f5f9; border: 1px dashed #64748b; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; font-size: 12px;">
          <div style="font-weight: 800; color: #0f172a; margin-bottom: 3px;">💳 INFORMASI REKENING PEMBAYARAN / TRANSFER:</div>
          <div style="color: #334155;">Bank: <strong>${bankName}</strong> &nbsp;|&nbsp; No. Rekening: <strong style="color: #b45309; font-size: 14px;">${bankAccount}</strong> &nbsp;|&nbsp; A/N: <strong>${bankHolder}</strong></div>
        </div>

        ${queue.notes ? `
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 18px; font-size: 12px;">
            <strong style="color: #0f172a;">Catatan Keluhan / Instruksi Mekanik:</strong>
            <div style="color: #334155; margin-top: 4px; font-style: italic;">${queue.notes}</div>
          </div>
        ` : ''}

        <!-- Signature -->
        <div style="display: flex; justify-content: space-between; margin-top: 35px; text-align: center; font-size: 12px;">
          <div style="width: 45%;">
            <p style="margin: 0 0 50px; font-weight: 600; color: #475569;">Pelanggan / Pemilik Mobil,</p>
            <strong style="color: #0f172a; border-bottom: 1px solid #000; padding-bottom: 2px;">(${queue.customerName})</strong>
          </div>
          <div style="width: 45%;">
            <p style="margin: 0 0 50px; font-weight: 600; color: #475569;">Kepala Bengkel FSTWORKS,</p>
            <strong style="color: #0f172a; border-bottom: 1px solid #000; padding-bottom: 2px;">( Admin Workshop FSTWORKS )</strong>
          </div>
        </div>

      </div>
    `;

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nota_${queue.id}</title>
        <style>
          @page { 
            size: ${isThermal ? paperWidth : 'A4'} auto; 
            margin: ${isThermal ? '0mm' : '8mm'}; 
          }
          html, body { 
            width: ${isThermal ? paperWidth : '100%'}; 
            max-width: ${isThermal ? paperWidth : '100%'}; 
            height: auto !important;
            min-height: 0 !important;
            margin: 0 auto !important; 
            padding: 0 !important; 
            background: #ffffff !important; 
            color: #000000 !important; 
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
        </style>
      </head>
      <body>
        ${documentContent}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 750);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: printMode === 'thermal' ? '#f8fafc' : '#ffffff',
        color: '#0f172a',
        borderRadius: '16px',
        width: '100%',
        maxWidth: printMode === 'thermal' ? (thermalWidth === '80mm' ? '480px' : '400px') : '780px',
        maxHeight: '92vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.25s ease'
      }}>
        
        {/* Header Control Toolbar (No Print) */}
        <div className="no-print" style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#0f172a',
          color: '#fff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Printer size={18} /> Generator Dokumen Cetak Nota & SPK
            </h3>

            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <button
              onClick={() => setPrintMode('a4')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '6px',
                border: printMode === 'a4' ? '1.5px solid #f59e0b' : '1px solid #334155',
                background: printMode === 'a4' ? 'rgba(245, 158, 11, 0.2)' : '#1e293b',
                color: printMode === 'a4' ? '#fbbf24' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <FileText size={14} /> 1. Cetak PDF / Document A4
            </button>

            <button
              onClick={() => setPrintMode('thermal')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '6px',
                border: printMode === 'thermal' ? '1.5px solid #06b6d4' : '1px solid #334155',
                background: printMode === 'thermal' ? 'rgba(6, 182, 212, 0.2)' : '#1e293b',
                color: printMode === 'thermal' ? '#38bdf8' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <Receipt size={14} /> 2. Cetak Thermal Kasir ({thermalWidth})
            </button>
          </div>

          {/* Thermal Paper Width Selector Sub-toolbar */}
          {printMode === 'thermal' && (
            <div style={{
              background: '#1e293b',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              marginBottom: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #334155'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sliders size={14} /> Ukuran Kertas Thermal:
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  onClick={() => setThermalWidth('58mm')}
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '5px',
                    border: 'none',
                    background: thermalWidth === '58mm' ? '#06b6d4' : '#0f172a',
                    color: thermalWidth === '58mm' ? '#000' : '#94a3b8',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  🧾 58mm (Mini Roll)
                </button>

                <button
                  onClick={() => setThermalWidth('80mm')}
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '5px',
                    border: 'none',
                    background: thermalWidth === '80mm' ? '#06b6d4' : '#0f172a',
                    color: thermalWidth === '80mm' ? '#000' : '#94a3b8',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  🧾 80mm (POS Desktop)
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => handleGenerateAndPrint(printMode)}
              style={{
                flex: 2,
                background: printMode === 'thermal' ? '#06b6d4' : '#f59e0b',
                color: '#000',
                border: 'none',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Printer size={16} /> {printMode === 'thermal' ? `🖨️ Print Struk Thermal (${thermalWidth})` : '🖨️ Generate & Print PDF (Auto Portrait)'}
            </button>

            <button 
              onClick={handleSendWA}
              style={{
                flex: 1.5,
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Smartphone size={16} /> Kirim WA PDF/Nota
            </button>
          </div>

        </div>

        {/* 1. PRINTABLE A4 / DOCUMENT PREVIEW */}
        {printMode === 'a4' && (
          <div className="printable-area" style={{ padding: '1.5rem 2rem 2.5rem', background: '#ffffff', color: '#000000' }}>
            
            {/* Header Document */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.5px' }}>
                  FSTWORKS BENGKEL SPESIALIS KAKI-KAKI
                </h1>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '3px 0 0', fontWeight: 600 }}>
                  Jl. Raya Utama No. 88, Pusat Suspensi & Steering • Telp/WA: 0812-3456-7890
                </p>
              </div>
              <div style={{ textAlign: 'right', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', letterSpacing: '0.5px' }}>NO. SPK / NOTA WORKSHOP</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#d97706', fontFamily: 'Rajdhani', margin: '1px 0' }}>{queue.id}</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>Tanggal: {new Date(queue.createdAt || Date.now()).toLocaleDateString('id-ID')}</div>
              </div>
            </div>

            {/* Customer & Vehicle Info Box */}
            <table style={{ width: '100%', marginBottom: '1.25rem', borderCollapse: 'collapse', fontSize: '0.88rem', border: '1px solid #cbd5e1' }}>
              <tbody>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, width: '18%', color: '#334155' }}>Pelanggan:</td>
                  <td style={{ padding: '8px 12px', width: '32%', color: '#0f172a', fontWeight: 600 }}>{queue.customerName} ({queue.phone})</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, width: '18%', color: '#334155' }}>Plat Nomor:</td>
                  <td style={{ padding: '8px 12px', width: '32%', fontWeight: 800, color: '#b45309', fontSize: '1rem' }}>{queue.licensePlate}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#334155' }}>Kendaraan:</td>
                  <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 600 }}>{queue.carModel}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#334155' }}>Status:</td>
                  <td style={{ padding: '8px 12px', fontWeight: 800, color: '#166534' }}>{queue.status || 'PROSES PENGERJAAN'}</td>
                </tr>
              </tbody>
            </table>

            {/* Services List Table */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Rincian Pekerjaan & Suku Cadang:
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem', fontSize: '0.85rem', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#ffffff', fontWeight: 700, width: '8%' }}>No</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#ffffff', fontWeight: 700 }}>Item Pekerjaan / Servis</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', color: '#ffffff', fontWeight: 700, width: '30%' }}>Harga Estimasi</th>
                </tr>
              </thead>
              <tbody>
                {servicesList.map((srv, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '8px 12px', color: '#334155' }}>{idx + 1}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{srv.name}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {srv.price === 0 ? 'FREE' : formatCurrency(srv.price)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#fef3c7', fontWeight: 800, borderTop: '2px solid #d97706' }}>
                  <td colSpan="2" style={{ padding: '10px 12px', textAlign: 'right', color: '#78350f', fontSize: '0.9rem' }}>TOTAL BIAYA:</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '1.15rem', color: '#b45309', fontWeight: 900 }}>
                    {queue.estimatedCost === 0 ? 'FREE' : formatCurrency(queue.estimatedCost)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bank Transfer Info Box (A4 Document Preview) */}
            <div style={{ background: '#f1f5f9', border: '1px dashed #64748b', borderRadius: '6px', padding: '10px 14px', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CreditCard size={14} color="#0f172a" /> INFORMASI REKENING PEMBAYARAN / TRANSFER:
              </div>
              <div style={{ color: '#334155' }}>Bank: <strong>{bankName}</strong> &nbsp;|&nbsp; No. Rekening: <strong style={{ color: '#b45309', fontSize: '0.95rem' }}>{bankAccount}</strong> &nbsp;|&nbsp; A/N: <strong>{bankHolder}</strong></div>
            </div>

            {queue.notes && (
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <strong style={{ color: '#0f172a' }}>Catatan Keluhan / Instruksi Mekanik:</strong>
                <div style={{ color: '#334155', marginTop: '4px', fontStyle: 'italic' }}>{queue.notes}</div>
              </div>
            )}

            {/* Signature Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
              <div>
                <p style={{ margin: '0 0 3.5rem', fontWeight: 600, color: '#475569' }}>Pelanggan / Pemilik Mobil,</p>
                <strong style={{ color: '#0f172a', borderBottom: '1px solid #000', paddingBottom: '2px' }}>({queue.customerName})</strong>
              </div>
              <div>
                <p style={{ margin: '0 0 3.5rem', fontWeight: 600, color: '#475569' }}>Kepala Bengkel FSTWORKS,</p>
                <strong style={{ color: '#0f172a', borderBottom: '1px solid #000', paddingBottom: '2px' }}>( Admin Workshop FSTWORKS )</strong>
              </div>
            </div>

          </div>
        )}

        {/* 2. PRINTABLE THERMAL RECEIPT PREVIEW (DYNAMIC 58mm / 80mm) */}
        {printMode === 'thermal' && (
          <div className="printable-area thermal-mode" style={{
            padding: '1.25rem 0.85rem',
            fontFamily: 'monospace, sans-serif',
            background: '#ffffff',
            color: '#000000',
            fontSize: thermalWidth === '80mm' ? '0.85rem' : '0.75rem',
            width: '100%',
            maxWidth: thermalWidth === '80mm' ? '380px' : '270px',
            margin: '0 auto',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: thermalWidth === '80mm' ? '1.3rem' : '1.1rem', margin: 0, fontWeight: 900 }}>FSTWORKS GARAGE</h2>
              <div style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>UNDERCARRIAGE SPECIALIST</div>
              <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>JL. RAYA OTOMOTIF NO. 88</div>
              <div style={{ fontSize: '0.65rem' }}>TELP/WA: 0812-3456-7890</div>
            </div>

            <div style={{ fontSize: '0.75rem', borderBottom: '1px dashed #000', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <div>NO : <strong>{queue.id}</strong></div>
              <div>TGL: {new Date(queue.createdAt || Date.now()).toLocaleDateString('id-ID')}</div>
              <div>CUST: {queue.customerName}</div>
              <div>PLAT: <strong>{queue.licensePlate}</strong> ({queue.carModel})</div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '4px', fontSize: '0.7rem' }}>
                <span>ITEM SERVIS</span>
                <span>HARGA</span>
              </div>

              {servicesList.map((srv, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                  <span>{srv.name}</span>
                  <span>{srv.price === 0 ? 'FREE' : formatCurrency(srv.price)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px dashed #000', paddingTop: '0.5rem', borderBottom: '1px dashed #000', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: thermalWidth === '80mm' ? '1.05rem' : '0.9rem' }}>
                <span>TOTAL:</span>
                <span>{queue.estimatedCost === 0 ? 'FREE' : formatCurrency(queue.estimatedCost)}</span>
              </div>
            </div>

            {/* Bank Transfer Info (Thermal Preview) */}
            <div style={{ borderBottom: '1px dashed #000', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontSize: '0.7rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>PEMBAYARAN TRANSFER:</div>
              <div>BANK : {bankName}</div>
              <div>REK  : <strong>{bankAccount}</strong></div>
              <div>A/N  : {bankHolder}</div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.68rem', marginTop: '0.75rem' }}>
              *** TERIMA KASIH ***<br />
              GARANSI BENGKEL FSTWORKS<br />
              SIMPAN STRUK INI SEBAGAI BUKTI
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
