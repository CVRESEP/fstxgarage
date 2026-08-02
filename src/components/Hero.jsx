import React from 'react';
import { Calendar, Search, ShieldCheck, ChevronRight, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Hero({ onStartBooking, onTrackQueue, siteConfig }) {
  const badge = siteConfig?.heroBadge || 'Undercarriage Specialist';
  const headline = siteConfig?.heroHeadline || 'FSTWORKS UNDERCARRIAGE SPECIALIST';
  const subheadline = siteConfig?.heroSubheadline || 'Penanganan profesional & presisi suspensi kendaraan dari team FSTWORKS. Penjadwalan pengerjaan & estimasi biaya ditentukan langsung oleh Admin.';
  const waNum = siteConfig?.whatsappNumber || '6281234567890';

  return (
    <div style={{ padding: '2.5rem 1rem 2rem', background: '#050507' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '0.35rem 0.85rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
          <ShieldCheck size={15} color="#f59e0b" />
          <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {badge}
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, color: '#f4f4f5', marginBottom: '1rem' }}>
          {headline}
        </h1>

        <p style={{ fontSize: '1rem', color: '#a1a1aa', marginBottom: '1.75rem', maxWidth: '680px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
          {subheadline}
        </p>

        {/* Action Buttons Container */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <button className="btn-primary" onClick={onStartBooking} style={{ padding: '0.8rem 1.4rem' }}>
            <Calendar size={18} /> Booking Reservasi <ChevronRight size={16} />
          </button>

          <button className="btn-secondary" onClick={onTrackQueue} style={{ padding: '0.8rem 1.25rem' }}>
            <Search size={18} /> Cek Status Mobil
          </button>

          <a 
            href={`https://wa.me/${waNum}?text=Halo%20FSTWORKS,%20saya%20ingin%20konsultasi%20masalah%20kaki-kaki%20mobil%20saya`}
            target="_blank" 
            rel="noreferrer"
            className="btn-cyan"
            style={{ padding: '0.8rem 1.25rem' }}
          >
            <MessageSquare size={18} /> Konsultasi WA
          </a>
        </div>

        {/* Guarantee Checkmarks */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', color: '#a1a1aa', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>Inspeksi 21 Titik <strong>FREE</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>{siteConfig?.guaranteeText || 'Garansi Servis 1 Tahun'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>Jadwal Di-ACC Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
