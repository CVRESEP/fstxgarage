import React, { useState } from 'react';
import { STATUS_MAP, INITIAL_SERVICES } from '../utils/storage';
import { Search, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function QueueTracker({ queues }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundQueue, setFoundQueue] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const match = queues.find(q => 
      q.id.toLowerCase() === query ||
      q.licensePlate.toLowerCase().replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
      q.id.toLowerCase().includes(query) ||
      q.licensePlate.toLowerCase().includes(query)
    );

    setSearched(true);
    setFoundQueue(match || null);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setSearched(false);
    setFoundQueue(null);
  };

  const getServiceNames = (serviceIds) => {
    if (!serviceIds) return '-';
    return serviceIds.map(id => {
      const s = INITIAL_SERVICES.find(srv => srv.id === id);
      return s ? s.name : id;
    }).join(', ');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#18181b', border: '1px solid #27272a', padding: '0.3rem 0.75rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
          <Lock size={15} color="#06b6d4" />
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>STATUS KENDARAAN (PRIVASI)</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', color: '#f4f4f5' }}>Pengecekan Status Mobil</h2>
        <p style={{ color: '#a1a1aa', fontSize: '0.9rem', maxWidth: '600px', margin: '0.25rem auto 0' }}>
          Masukkan Kode Booking atau Nomor Polisi kendaraan untuk melihat progress pengerjaan.
        </p>
      </div>

      {/* Search Card Box */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch}>
          <label className="form-label" style={{ fontSize: '0.9rem', color: '#f4f4f5', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Search size={16} color="#f59e0b" /> Kode Booking / Plat Mobil:
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: B 1234 FST"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
              required
            />

            <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
              Cek Status <ArrowRight size={16} />
            </button>

            {searched && (
              <button type="button" className="btn-secondary" onClick={handleResetSearch}>
                Cari Lagi
              </button>
            )}
          </div>
        </form>

        {/* Demo Code Quick Fill helper */}
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#a1a1aa' }}>
          <span>Contoh cepat:</span>
          {queues.slice(0, 3).map(q => (
            <button 
              key={q.id} 
              type="button" 
              className="badge badge-warning" 
              onClick={() => { setSearchQuery(q.licensePlate); }}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {q.licensePlate}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH RESULT DISPLAYS */}
      {searched && !foundQueue && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: '#09090b' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ef4444' }}>
            ✕
          </div>
          <h3 style={{ color: '#f4f4f5', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Kendaraan Tidak Ditemukan</h3>
          <p style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
            Kode Booking atau Nomor Polisi "<strong>{searchQuery}</strong>" tidak ada di sistem.
          </p>
        </div>
      )}

      {foundQueue && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          {/* Header Box */}
          <div style={{ borderBottom: '1px solid #27272a', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.4rem' }}>KODE: {foundQueue.id}</span>
              <h2 style={{ fontSize: '1.8rem', color: '#f4f4f5', fontFamily: 'Rajdhani', margin: 0 }}>{foundQueue.licensePlate}</h2>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '2px' }}>{foundQueue.carModel} • Pemilik: <strong style={{ color: '#fff' }}>{foundQueue.customerName}</strong></p>
            </div>
          </div>

          {/* Timeline Progress */}
          <div style={{ marginBottom: '1.5rem', background: '#09090b', padding: '1rem', borderRadius: '8px', border: '1px solid #27272a' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', display: 'block', marginBottom: '1rem', fontWeight: 700 }}>PROGRESS STAGE PENGERJAAN:</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.keys(STATUS_MAP).map((key) => {
                const stepObj = STATUS_MAP[key];
                const currentStepNum = STATUS_MAP[foundQueue.status]?.step || 1;
                const isDone = currentStepNum > stepObj.step;
                const isCurrent = currentStepNum === stepObj.step;

                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: isDone ? '#10b981' : isCurrent ? '#f59e0b' : '#27272a',
                      color: isDone || isCurrent ? '#000' : '#a1a1aa',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem'
                    }}>
                      {isDone ? '✓' : stepObj.step}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#fbbf24' : isDone ? '#34d399' : '#a1a1aa' }}>
                        {stepObj.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '0.75rem', borderRadius: '6px' }}>
              <span style={{ color: '#a1a1aa', display: 'block' }}>Layanan:</span>
              <strong style={{ color: '#fff' }}>{getServiceNames(foundQueue.services)}</strong>
            </div>
            <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '0.75rem', borderRadius: '6px' }}>
              <span style={{ color: '#a1a1aa', display: 'block' }}>Est. Selesai:</span>
              <strong style={{ color: '#f59e0b' }}>{foundQueue.endDate}</strong>
            </div>
            <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '0.75rem', borderRadius: '6px' }}>
              <span style={{ color: '#a1a1aa', display: 'block' }}>Estimasi Biaya:</span>
              <strong style={{ color: '#10b981', fontSize: '1rem' }}>{formatCurrency(foundQueue.estimatedCost)}</strong>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
