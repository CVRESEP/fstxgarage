import React from 'react';
import { MapPin, Phone, Clock, MessageSquare, ShieldCheck, Lock } from 'lucide-react';

export default function Footer({ onNavigate, siteConfig }) {
  return (
    <footer style={{
      background: 'rgba(8, 12, 20, 0.95)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '3rem 1.5rem 1.5rem',
      marginTop: '4rem',
      color: '#94a3b8'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img src="/fst.png" alt="FSTWORKS Logo" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
              <div>
                <span className="tech-font" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'block' }}>
                  FST<span style={{ color: '#f59e0b' }}>WORKS</span>
                </span>
                <span style={{ fontSize: '0.68rem', color: '#a1a1aa', fontWeight: 600 }}>UNDERCARRIAGE SPECIALIST</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Bengkel Undercarriage Specialist, Rekondisi Shockbreaker, Steering Rack, Tierod, Ball Joint, Bushing Arm & Spooring 3D Digital Laser Bergaransi.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a 
                href="https://wa.me/6281234567890" 
                target="_blank" 
                rel="noreferrer" 
                className="btn-cyan btn-sm"
              >
                <MessageSquare size={14} /> WhatsApp Workshop
              </a>
            </div>
          </div>

          {/* Col 2: Operational Info */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1rem', marginBottom: '1rem' }}>Jam Operasional Workshop</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="#f59e0b" />
                <span>{siteConfig?.operatingHours || 'Senin - Sabtu: 08:30 - 17:00 WIB'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="#f43f5e" />
                <span>{siteConfig?.operatingHoursSunday || 'Minggu & Hari Libur: Tutup (Reservasi WA)'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>{siteConfig?.guaranteeText || 'Garansi Servis Sampai 12 Bulan'}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Location */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1rem', marginBottom: '1rem' }}>Lokasi Bengkel FSTWORKS</h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
              <MapPin size={18} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{siteConfig?.address || 'Jl. Raya Utama Otomotif No. 88, Pusat Suspensi & Steering, Jakarta / Indonesia'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Phone size={16} color="#f59e0b" />
              <span>Hotline Booking: <strong>{siteConfig?.hotlinePhone || '0812-3456-7890'}</strong></span>
            </div>
          </div>

          {/* Col 4: Customer Navigation */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1rem', marginBottom: '1rem' }}>Layanan Pelanggan</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <span onClick={() => onNavigate('booking')} style={{ cursor: 'pointer', color: '#f59e0b' }}>● Booking Antrian Online</span>
              <span onClick={() => onNavigate('tracker')} style={{ cursor: 'pointer', color: '#06b6d4' }}>● Cek Status Antrian Saya</span>
              <span onClick={() => onNavigate('estimator')} style={{ cursor: 'pointer', color: '#cbd5e1' }}>● Kalkulator Estimasi Biaya</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright row with discrete Staff Portal Access */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>© 2026 FSTWORKS - Undercarriage Specialist. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Presisi Suspensi, Kenyamanan Hakiki.</span>
            <span 
              onClick={() => onNavigate('admin')} 
              style={{ cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              title="Akses Internal Staff Workshop"
            >
              <Lock size={12} /> Staff Portal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
