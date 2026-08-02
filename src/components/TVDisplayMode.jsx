import React, { useState, useEffect } from 'react';
import { STATUS_MAP } from '../utils/storage';
import { speakQueueCall } from '../utils/audio';
import { Tv, Volume2, Car, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TVDisplayMode({ queues, pits }) {
  const [timeStr, setTimeStr] = useState('');
  const [lastCalled, setLastCalled] = useState(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeQueues = queues.filter(q => q.status !== 'SELESAI');
  const nowProcessing = queues.find(q => q.status === 'PENGERJAAN' || q.status === 'INSPEKSI') || queues[0];

  const handleCallVoice = (queue) => {
    setLastCalled(queue);
    speakQueueCall(queue);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050811 0%, #0f172a 100%)',
      color: '#f8fafc',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      
      {/* Top Header Bar for TV Display */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid rgba(245, 158, 11, 0.3)',
        paddingBottom: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="FSTWORKS Logo" style={{ height: '48px', width: 'auto', borderRadius: '8px' }} />
          <div>
            <h1 className="tech-font" style={{ fontSize: '2rem', letterSpacing: '1px', color: '#fff', margin: 0 }}>
              FST<span style={{ color: '#f59e0b' }}>WORKS</span> SUSPENSION SPECIALIST
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>LAYAR INFORMASI ANTRIAN RUANG TUNGGU</p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4', fontFamily: 'Rajdhani', lineHeight: 1 }}>
            {timeStr || '14:30:00 WIB'}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className="pulse-dot"></span> BENGKEL OPERASIONAL
          </span>
        </div>
      </div>

      {/* Main TV Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flex: 1, marginBottom: '1.5rem' }}>
        
        {/* Left Column: Big Now Serving / Call Card */}
        <div style={{
          background: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '20px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          textAlign: 'center',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)'
        }}>
          <div>
            <span className="badge badge-warning" style={{ fontSize: '0.9rem', padding: '0.4rem 1.2rem', marginBottom: '1.5rem' }}>
              SEDANG DIPANGGIL / DIPROSES
            </span>

            {nowProcessing ? (
              <div>
                <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'Rajdhani', lineHeight: 1, marginBottom: '0.5rem' }}>
                  {nowProcessing.queueNumber}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Rajdhani', marginBottom: '0.5rem' }}>
                  {nowProcessing.licensePlate}
                </div>
                <div style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
                  {nowProcessing.carModel} ({nowProcessing.customerName})
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', padding: '1rem', display: 'inline-block', width: '100%', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>LOKASI PIT WORKSHOP</div>
                  <strong style={{ fontSize: '1.4rem', color: '#38bdf8' }}>{nowProcessing.assignedPit || 'PIT 1'}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#fbbf24' }}>Mekanik: {nowProcessing.mechanic}</div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '3rem 0', color: '#94a3b8' }}>
                Belum ada antrian yang dipanggil saat ini.
              </div>
            )}
          </div>

          {nowProcessing && (
            <button 
              className="btn-primary" 
              onClick={() => handleCallVoice(nowProcessing)}
              style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1rem' }}
            >
              <Volume2 size={24} /> Panggil Suara Suara Antrian ({nowProcessing.queueNumber})
            </button>
          )}
        </div>

        {/* Right Column: Workshop Pit Status Grid & Waiting List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Workshop Pits Cards */}
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#06b6d4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car size={20} /> STATUS PIT WORKSHOP FSTWORKS
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {pits.map(pit => {
                const currentQueueInPit = queues.find(q => q.assignedPit === pit.id && q.status !== 'SELESAI');
                
                return (
                  <div 
                    key={pit.id}
                    style={{
                      background: currentQueueInPit ? 'rgba(30, 41, 59, 0.8)' : 'rgba(16, 185, 129, 0.08)',
                      border: currentQueueInPit ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '14px',
                      padding: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{pit.name.split('-')[0]}</strong>
                      <span className={`badge ${currentQueueInPit ? 'badge-warning' : 'badge-success'}`}>
                        {currentQueueInPit ? 'TERISI' : 'KOSONG'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>{pit.mechanic}</div>

                    {currentQueueInPit ? (
                      <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '0.75rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'Rajdhani', display: 'block' }}>
                          {currentQueueInPit.licensePlate}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{currentQueueInPit.carModel}</span>
                        <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '4px', fontWeight: 600 }}>
                          Status: {STATUS_MAP[currentQueueInPit.status]?.label}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', textAlign: 'center', color: '#34d399', fontSize: '0.85rem' }}>
                        Pit Siap Digunakan
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of Waiting Customers (Daftar Antrian Berikutnya) */}
          <div style={{ flex: 1, background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.75rem' }}>Daftar Antrian Berikutnya (Waiting List)</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {activeQueues.filter(q => q.id !== (nowProcessing ? nowProcessing.id : '')).slice(0, 6).map(q => (
                <div key={q.id} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'Rajdhani' }}>{q.queueNumber}</span>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{q.licensePlate}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{q.carModel} ({q.bookingTime} WIB)</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Running Text Marquee */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '12px',
        padding: '0.65rem 1rem',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}>
        <div style={{
          display: 'inline-block',
          paddingLeft: '100%',
          animation: 'marquee 25s linear infinite',
          fontSize: '1rem',
          fontWeight: 600,
          color: '#fbbf24'
        }}>
          🚗 SELAMAT DATANG DI BENGKEL SPESIALIS SUSPENSI & KAKI-KAKI MOBIL FSTWORKS • MOHON MENUNGGU PANGGILAN KODE / NOMOR ANTRIAN ANDA • FASILITAS RUANG TUNGGU BER-AC, FREE WIFI & MINUMAN GRATIS • KONSULTASI & INSPEKSI KAKI-KAKI 21 TITIK KAMI BERIKAN FREE / GRATIS! 🔧
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-100%, 0); }
        }
      `}</style>

    </div>
  );
}
