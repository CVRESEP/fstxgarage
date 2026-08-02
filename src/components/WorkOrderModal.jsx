import React from 'react';
import { INITIAL_SERVICES } from '../utils/storage';
import { X, Printer, Wrench, Shield, CheckCircle2 } from 'lucide-react';

export default function WorkOrderModal({ queue, onClose }) {
  if (!queue) return null;

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
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header Action Buttons (No Print) */}
        <div className="no-print" style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Surat Perintah Kerja (SPK) & Estimasi Nota
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={() => window.print()}
              style={{
                background: '#f59e0b',
                color: '#000',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Printer size={16} /> Cetak SPK
            </button>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Printable SPK Content Area */}
        <div className="printable-area" style={{ padding: '2rem' }}>
          
          {/* Workshop Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'Rajdhani, sans-serif' }}>
                FSTWORKS BENGKEL SPESIALIS KAKI-KAKI
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '2px 0 0' }}>
                Jl. Raya Utama No. 88, Pusat Suspensi & Steering • Telp/WA: 0812-3456-7890
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>NO. SPK WORKSHOP</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', fontFamily: 'Rajdhani' }}>{queue.id}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tanggal: {new Date(queue.createdAt || Date.now()).toLocaleDateString('id-ID')}</div>
            </div>
          </div>

          {/* Customer & Vehicle Info Table */}
          <table style={{ width: '100%', marginBottom: '1.5rem', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <tbody>
              <tr style={{ background: '#f1f5f9' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, width: '20%' }}>Pelanggan:</td>
                <td style={{ padding: '8px 12px', width: '30%' }}>{queue.customerName} ({queue.phone})</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, width: '20%' }}>Plat Nomor:</td>
                <td style={{ padding: '8px 12px', width: '30%', fontWeight: 700, color: '#b45309' }}>{queue.licensePlate}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>Kendaraan:</td>
                <td style={{ padding: '8px 12px' }}>{queue.carModel}</td>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>Penanggung Jawab:</td>
                <td style={{ padding: '8px 12px' }}>Staff Bengkel FSTWORKS</td>
              </tr>
            </tbody>
          </table>

          {/* Itemized Services Table */}
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Rincian Pekerjaan & Suku Cadang:</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>No</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item Pekerjaan / Servis</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Harga Estimasi</th>
              </tr>
            </thead>
            <tbody>
              {servicesList.map((srv, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 12px' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{srv.name}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    {srv.price === 0 ? 'FREE' : formatCurrency(srv.price)}
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#fef3c7', fontWeight: 700 }}>
                <td colSpan="2" style={{ padding: '10px 12px', textAlign: 'right' }}>TOTAL ESTIMASI BIAYA:</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '1.1rem', color: '#b45309' }}>
                  {queue.estimatedCost === 0 ? 'FREE' : formatCurrency(queue.estimatedCost)}
                </td>
              </tr>
            </tbody>
          </table>

          {queue.notes && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <strong>Catatan Keluhan / Instruksi Mekanik:</strong>
              <div style={{ color: '#334155', marginTop: '4px' }}>{queue.notes}</div>
            </div>
          )}

          {/* Signature & Warranty Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
            <div>
              <p style={{ margin: '0 0 3rem' }}>Pelanggan / Pemilik Mobil,</p>
              <strong>({queue.customerName})</strong>
            </div>
            <div>
              <p style={{ margin: '0 0 3rem' }}>Kepala Bengkel FSTWORKS,</p>
              <strong>( Admin Workshop FSTWORKS )</strong>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
