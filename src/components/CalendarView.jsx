import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronRight, X, Info, CheckCircle2 } from 'lucide-react';
import { STATUS_MAP } from '../utils/storage';

export default function CalendarView({ queues, onNavigateToBooking }) {
  const [currentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [activeDateModal, setActiveDateModal] = useState(null);

  const isDateInRange = (checkDateStr, startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return false;
    return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
  };

  const getDayProgressIndex = (checkDateStr, startDateStr, totalDays) => {
    const d1 = new Date(checkDateStr);
    const d2 = new Date(startDateStr);
    const diffTime = Math.abs(d1 - d2);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return { currentDay: Math.min(diffDays, totalDays), totalDays };
  };

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = (date.getDay() + 6) % 7; // Monday = 0
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      const yearStr = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const fullDateStr = `${yearStr}-${monthStr}-${dayStr}`;

      const activeCarsOnDate = queues.filter(q => 
        q.isApproved && isDateInRange(fullDateStr, q.startDate, q.endDate)
      );

      const isSunday = date.getDay() === 0;

      days.push({
        dayNumber: date.getDate(),
        dateStr: fullDateStr,
        activeCars: activeCarsOnDate,
        isSunday
      });

      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const daysList = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Title & Info Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#18181b', border: '1px solid #27272a', padding: '0.3rem 0.75rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
          <CalendarIcon size={15} color="#f59e0b" />
          <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>JADWAL RESMI WORKSHOP (READ-ONLY)</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', color: '#f4f4f5' }}>Agenda Pengerjaan & Slot Kosong</h2>
        <p style={{ color: '#a1a1aa', fontSize: '0.9rem', maxWidth: '650px', margin: '0.25rem auto 0' }}>
          Kalender menampilkan jadwal pengerjaan mobil yang <strong>telah di-ACC oleh Admin</strong>.
        </p>
      </div>

      {/* Legend & Action Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
            <span>Slot Kosong</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
            <span>Pengerjaan</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
            <span>Slot Penuh (2 Unit)</span>
          </div>
        </div>

        <button className="btn-primary btn-sm" onClick={onNavigateToBooking}>
          Formulir Booking <ChevronRight size={14} />
        </button>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#f4f4f5', fontSize: '1.2rem', margin: 0, fontFamily: 'Rajdhani', fontWeight: 800 }}>
            AGUSTUS 2026
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>* Klik tanggal untuk rincian</span>
        </div>

        {/* Weekday Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
          <div>SEN</div>
          <div>SEL</div>
          <div>RAB</div>
          <div>KAM</div>
          <div>JUM</div>
          <div>SAB</div>
          <div style={{ color: '#ef4444' }}>MIN</div>
        </div>

        {/* Calendar Grid Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem' }}>
          {daysList.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} style={{ minHeight: '80px', background: '#0a0a0d', borderRadius: '6px' }} />;
            }

            const activeCount = day.activeCars.length;
            const isFull = activeCount >= 2;
            let cellBg = '#121216';
            let borderColor = '#27272a';

            if (day.isSunday) {
              cellBg = '#09090b';
              borderColor = '#18181b';
            } else if (isFull) {
              cellBg = 'rgba(239, 68, 68, 0.1)';
              borderColor = 'rgba(239, 68, 68, 0.3)';
            } else if (activeCount > 0) {
              cellBg = 'rgba(245, 158, 11, 0.1)';
              borderColor = 'rgba(245, 158, 11, 0.3)';
            }

            return (
              <div
                key={day.dateStr}
                onClick={() => setActiveDateModal(day)}
                style={{
                  minHeight: '85px',
                  borderRadius: '6px',
                  background: cellBg,
                  border: `1px solid ${borderColor}`,
                  padding: '0.35rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Date Number & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    fontFamily: 'Rajdhani',
                    color: day.isSunday ? '#71717a' : '#f4f4f5'
                  }}>
                    {day.dayNumber}
                  </span>

                  {day.isSunday ? (
                    <span style={{ fontSize: '0.6rem', color: '#71717a' }}>LIBUR</span>
                  ) : isFull ? (
                    <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 700 }}>FULL</span>
                  ) : activeCount > 0 ? (
                    <span style={{ fontSize: '0.6rem', color: '#f59e0b', fontWeight: 700 }}>{activeCount} MOBIL</span>
                  ) : (
                    <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 600 }}>KOSONG</span>
                  )}
                </div>

                {/* Car Schedule Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                  {day.activeCars.map(car => {
                    const progress = getDayProgressIndex(day.dateStr, car.startDate, car.durationDays);
                    return (
                      <div 
                        key={car.id}
                        style={{
                          background: 'rgba(245, 158, 11, 0.2)',
                          border: '1px solid #f59e0b',
                          borderRadius: '3px',
                          padding: '1px 3px',
                          fontSize: '0.65rem',
                          color: '#fbbf24',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        🚗 {car.licensePlate} ({progress.currentDay}/{progress.totalDays}H)
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP MODAL */}
      {activeDateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>AGENDA WORKSHOP</span>
                <h3 style={{ color: '#f59e0b', fontSize: '1.2rem', fontFamily: 'Rajdhani', margin: 0 }}>
                  {new Date(activeDateModal.dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <button 
                onClick={() => setActiveDateModal(null)}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {activeDateModal.isSunday ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#a1a1aa' }}>
                <Info size={30} color="#ef4444" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                Bengkel Tutup pada hari Minggu.
              </div>
            ) : activeDateModal.activeCars.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#10b981' }}>
                <CheckCircle2 size={30} color="#10b981" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                <strong>Hari Ini Kosong!</strong>
                <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '0.25rem' }}>
                  Belum ada mobil yang di-ACC pada tanggal ini.
                </p>
                <button className="btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => { setActiveDateModal(null); onNavigateToBooking(); }}>
                  Daftarkan Mobil
                </button>
              </div>
            ) : (
              <div>
                <h4 style={{ color: '#f4f4f5', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Mobil Sedang Dikerjakan ({activeDateModal.activeCars.length} Unit):
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {activeDateModal.activeCars.map(car => {
                    const progress = getDayProgressIndex(activeDateModal.dateStr, car.startDate, car.durationDays);
                    const statusObj = STATUS_MAP[car.status] || STATUS_MAP.PENGERJAAN;

                    return (
                      <div key={car.id} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', padding: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <strong style={{ color: '#fbbf24', fontSize: '1rem', fontFamily: 'Rajdhani' }}>{car.licensePlate}</strong>
                          <span className="badge badge-warning">{statusObj.label}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#f4f4f5', fontWeight: 600 }}>{car.carModel}</div>
                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>
                          Pemilik: <span style={{ color: '#fff' }}>{car.customerName}</span>
                        </div>
                        
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#38bdf8' }}>
                          <span>Masuk: {car.startDate}</span>
                          <span>Hari ke-{progress.currentDay} dari {progress.totalDays} H</span>
                          <span>Est Selesai: {car.endDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
