import React from 'react';
import { getStoredServices } from '../utils/storage';
import { ShieldCheck, Wrench, AlertTriangle, CheckCircle2, ChevronRight, Star, HelpCircle } from 'lucide-react';

export default function ServicesSection({ onBookService, services: customServices, testimonials: customTestimonials }) {
  const displayServices = (customServices && customServices.length > 0) ? customServices : getStoredServices();
  const displayTestimonials = customTestimonials && customTestimonials.length > 0 ? customTestimonials : [
    {
      name: 'Bapak Aditia (Owner Fortuner VRZ)',
      rating: 5,
      comment: 'Masalah kaki-kaki di Fortuner saya yang bikin pusing akhirnya tuntas di FSTWORKS. Mekaniknya sangat paham detail, gratis inspeksi dulu baru tawarin estimasi yang jujur!'
    },
    {
      name: 'Mas Farhan (Owner Civic Turbo)',
      rating: 5,
      comment: 'Fitur booking online sangat membantu! Datang sesuai jadwal ACC admin, mobil langsung ditangani tanpa nunggu berjam-jam. Recommended banget!'
    },
    {
      name: 'Pak Rudi (Owner BMW E90)',
      rating: 5,
      comment: 'Spooring 3D laser-nya presisi banget, setir BMW saya yang tadinya miring sekarang lurus total. Hasil garansinya bikin tenang.'
    }
  ];
  const symptomGuide = [
    {
      symptom: 'Bunyi Geluduk Saat Menggeledak Di Jalan Lubang',
      causes: 'Shockbreaker bocor, Bushing Arm aus, atau Tierod longgar',
      solution: 'Rekondisi / Servis Shockbreaker & Press Bushing Heavy Duty'
    },
    {
      symptom: 'Setir Mobil Terasa Speling / Oblak & Getar Saat Kencang',
      causes: 'Long Tierod & Steering Rack aus / ball joint longgar',
      solution: 'Overhaul Steering Rack & Replacement Ball Joint Presisi'
    },
    {
      symptom: 'Mobil Terasa Narik Ke Kiri Atau Kanan Saat Jalan Lurus',
      causes: 'Sudut Camber/Toe berubah atau ban aus tidak merata',
      solution: 'Spooring 3D Digital Laser & Balancing 4 Roda'
    },
    {
      symptom: 'Bodi Mobil Limbung & Ayunan Mengocok Saat Keluar Tol',
      causes: 'Support Shock & Per mati / Rebound shock sudah kempos',
      solution: 'Tuning Valve Nitrogen Shockbreaker & Support Cushion Rubber'
    }
  ];

  const testimonials = [
    {
      name: 'Bapak Aditia (Owner Fortuner VRZ)',
      rating: 5,
      comment: 'Masalah kaki-kaki di Fortuner saya yang bikin pusing akhirnya tuntas di FSTWORKS. Mekaniknya sangat paham detail, gratis inspeksi dulu baru tawarin estimasi yang jujur!'
    },
    {
      name: 'Mas Farhan (Owner Civic Turbo)',
      rating: 5,
      comment: 'Fitur booking online sangat membantu! Datang sesuai jadwal ACC admin, mobil langsung ditangani tanpa nunggu berjam-jam. Recommended banget!'
    },
    {
      name: 'Pak Rudi (Owner BMW E90)',
      rating: 5,
      comment: 'Spooring 3D laser-nya presisi banget, setir BMW saya yang tadinya miring sekarang lurus total. Hasil garansinya bikin tenang.'
    }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      
      {/* Section 1: Services Cards */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>LAYANAN UNGGULAN WORKSHOP</span>
        <h2 style={{ fontSize: '2.4rem', color: '#f8fafc' }}>Layanan FSTWORKS Undercarriage Specialist</h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
          Diampu oleh teknisi profesional bersertifikat dengan mesin presisi modern khusus perbaikan kaki-kaki dan suspensi mobil.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        {displayServices.map(srv => (
          <div key={srv.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-info">{srv.category}</span>
                <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600 }}>{srv.estimatedDuration}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '0.5rem' }}>{srv.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>{srv.description}</p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: srv.price === 0 ? '#10b981' : '#fbbf24', fontSize: '1.1rem', fontFamily: 'Rajdhani' }}>
                {srv.price === 0 ? 'FREE / GRATIS' : `Rp ${srv.price.toLocaleString('id-ID')}`}
              </strong>

              <button className="btn-outline-amber btn-sm" onClick={onBookService}>
                Booking <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Section 2: Symptom Troubleshooting Matrix */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.5rem' }}>
            <HelpCircle size={20} /> PANDUAN GEJALA KERUSAKAN KAKI-KAKI
          </div>
          <h3 style={{ fontSize: '1.8rem', color: '#f8fafc' }}>Ketahui Masalah Mobil Anda Sebelum Ke Bengkel</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {symptomGuide.map((item, i) => (
            <div key={i} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} color="#f59e0b" /> {item.symptom}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                <strong style={{ color: '#cbd5e1' }}>Kemungkinan Penyebab:</strong> {item.causes}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                <CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Solusi: {item.solution}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Testimonials */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>ULASAN PELANGGAN</span>
        <h3 style={{ fontSize: '1.8rem', color: '#f8fafc' }}>Apa Kata Pemilik Mobil Tentang FSTWORKS?</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {displayTestimonials.map((testi, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.25rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
              {Array.from({ length: testi.rating }).map((_, r) => (
                <Star key={r} size={16} fill="#f59e0b" />
              ))}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.5 }}>
              "{testi.comment}"
            </p>
            <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>{testi.name}</strong>
          </div>
        ))}
      </div>

    </div>
  );
}
