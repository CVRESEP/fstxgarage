import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, X, Info, CheckCircle2, Settings, Plus, Trash2, CalendarDays } from 'lucide-react';
import { STATUS_MAP, getStoredHolidayConfig, saveHolidayConfigToStorage, isHoliday, calculateWorkdayEndDate } from '../utils/storage';

export default function CalendarView({ queues, onNavigateToBooking, isAdmin = false }) {
  // Current displayed calendar year & month (Default: August 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7); // 7 = August (0-indexed)

  const [activeDateModal, setActiveDateModal] = useState(null);
  
  // Holiday Configuration State
  const [holidayConfig, setHolidayConfig] = useState(getStoredHolidayConfig);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayTitle, setNewHolidayTitle] = useState('');

  // Synchronize holiday config with localStorage updates
  const handleSaveHolidayConfig = (updated) => {
    setHolidayConfig(updated);
    saveHolidayConfigToStorage(updated);
  };

  const toggleWeeklyOffDay = (dayNum) => {
    const currentOff = holidayConfig.weeklyOff || [];
    let updatedOff;
    if (currentOff.includes(dayNum)) {
      updatedOff = currentOff.filter(d => d !== dayNum);
    } else {
      updatedOff = [...currentOff, dayNum];
    }
    const updated = { ...holidayConfig, weeklyOff: updatedOff };
    handleSaveHolidayConfig(updated);
  };

  const handleAddSpecificHoliday = (e) => {
    e.preventDefault();
    if (!newHolidayDate) return;

    const existing = holidayConfig.specificHolidays || [];
    // Prevent duplicate date
    if (existing.some(h => (typeof h === 'string' ? h === newHolidayDate : h.date === newHolidayDate))) {
      alert('Tanggal libur tersebut sudah terdaftar.');
      return;
    }

    const newItem = {
      date: newHolidayDate,
      title: newHolidayTitle.trim() || 'Libur Khusus Workshop'
    };

    const updated = { ...holidayConfig, specificHolidays: [...existing, newItem] };
    handleSaveHolidayConfig(updated);
    setNewHolidayDate('');
    setNewHolidayTitle('');
  };

  const handleDeleteSpecificHoliday = (dateStr) => {
    const existing = holidayConfig.specificHolidays || [];
    const updatedHolidays = existing.filter(h => (typeof h === 'string' ? h !== dateStr : h.date !== dateStr));
    const updated = { ...holidayConfig, specificHolidays: updatedHolidays };
    handleSaveHolidayConfig(updated);
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleTodayReset = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const isDateInRange = (checkDateStr, startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return false;
    return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
  };

  // Workday Progress Index (skipping holidays)
  const getWorkdayProgressIndex = (checkDateStr, startDateStr, totalWorkdays) => {
    if (!startDateStr) return { currentWorkday: 1, totalWorkdays };
    
    let curr = new Date(startDateStr + 'T00:00:00');
    const target = new Date(checkDateStr + 'T00:00:00');
    let workdayCount = 0;

    while (curr <= target) {
      const hol = isHoliday(curr, holidayConfig);
      if (!hol.isHoliday) {
        workdayCount++;
      }
      curr.setDate(curr.getDate() + 1);
    }

    return { currentWorkday: Math.max(1, Math.min(workdayCount, totalWorkdays)), totalWorkdays };
  };

  // Dynamic Calendar Month Grid Generator with Previous & Next Month Padding Days
  const getDaysInMonth = (year, month) => {
    const days = [];
    
    // First date of current month
    const firstDay = new Date(year, month, 1);
    // Index: Monday = 0, Tuesday = 1, ..., Sunday = 6
    const firstDayIndex = (firstDay.getDay() + 6) % 7;

    // Previous month padding days
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDate - i);
      const yearStr = prevDate.getFullYear();
      const monthStr = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(prevDate.getDate()).padStart(2, '0');
      const fullDateStr = `${yearStr}-${monthStr}-${dayStr}`;

      const activeCarsOnDate = queues.filter(q => 
        q.isApproved && isDateInRange(fullDateStr, q.startDate, q.endDate)
      );
      const holCheck = isHoliday(fullDateStr, holidayConfig);

      days.push({
        dayNumber: prevDate.getDate(),
        dateStr: fullDateStr,
        activeCars: activeCarsOnDate,
        isOtherMonth: true,
        holidayInfo: holCheck
      });
    }

    // Current month days
    const lastDayCurrentMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDayCurrentMonth; d++) {
      const currDate = new Date(year, month, d);
      const yearStr = currDate.getFullYear();
      const monthStr = String(currDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(currDate.getDate()).padStart(2, '0');
      const fullDateStr = `${yearStr}-${monthStr}-${dayStr}`;

      const activeCarsOnDate = queues.filter(q => 
        q.isApproved && isDateInRange(fullDateStr, q.startDate, q.endDate)
      );
      const holCheck = isHoliday(fullDateStr, holidayConfig);

      days.push({
        dayNumber: d,
        dateStr: fullDateStr,
        activeCars: activeCarsOnDate,
        isOtherMonth: false,
        holidayInfo: holCheck
      });
    }

    // Next month padding days to complete 7-column grid rows
    const totalCells = days.length;
    const remainder = totalCells % 7;
    if (remainder > 0) {
      const nextDaysNeeded = 7 - remainder;
      for (let n = 1; n <= nextDaysNeeded; n++) {
        const nextDate = new Date(year, month + 1, n);
        const yearStr = nextDate.getFullYear();
        const monthStr = String(nextDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(nextDate.getDate()).padStart(2, '0');
        const fullDateStr = `${yearStr}-${monthStr}-${dayStr}`;

        const activeCarsOnDate = queues.filter(q => 
          q.isApproved && isDateInRange(fullDateStr, q.startDate, q.endDate)
        );
        const holCheck = isHoliday(fullDateStr, holidayConfig);

        days.push({
          dayNumber: n,
          dateStr: fullDateStr,
          activeCars: activeCarsOnDate,
          isOtherMonth: true,
          holidayInfo: holCheck
        });
      }
    }

    return days;
  };

  const daysList = getDaysInMonth(currentYear, currentMonth);

  const monthNames = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];

  const weekdayNames = [
    { code: 'SEN', label: 'Senin', num: 1 },
    { code: 'SEL', label: 'Selasa', num: 2 },
    { code: 'RAB', label: 'Rabu', num: 3 },
    { code: 'KAM', label: 'Kamis', num: 4 },
    { code: 'JUM', label: 'Jumat', num: 5 },
    { code: 'SAB', label: 'Sabtu', num: 6 },
    { code: 'MIN', label: 'Minggu', num: 0, isRed: true }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#18181b', border: '1px solid #27272a', padding: '0.3rem 0.75rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
          <CalendarIcon size={15} color="#f59e0b" />
          <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>JADWAL RESMI WORKSHOP (READ-ONLY)</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', color: '#f4f4f5' }}>Agenda Pengerjaan & Slot Kosong</h2>
        <p style={{ color: '#a1a1aa', fontSize: '0.9rem', maxWidth: '650px', margin: '0.25rem auto 0' }}>
          Kalender memperhitungkan <strong>Hari Libur Workshop</strong> secara otomatis. Hari libur tidak dihitung sebagai durasi pengerjaan.
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
            <span>Pengerjaan Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
            <span>Slot Penuh (2 Unit)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#a1a1aa' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3f3f46' }}></span>
            <span>Libur Workshop</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isAdmin && (
            <button 
              className="btn-secondary btn-sm" 
              onClick={() => setShowHolidayModal(true)}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderColor: '#f59e0b', color: '#fbbf24' }}
            >
              <Settings size={14} /> Pengaturan Hari Libur
            </button>
          )}

          {onNavigateToBooking && (
            <button className="btn-primary btn-sm" onClick={onNavigateToBooking}>
              Formulir Booking <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', overflowX: 'auto' }}>
        
        <div style={{ minWidth: '768px' }}>
          {/* Dynamic Month Navigation Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: '#18181b', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={handlePrevMonth}
                style={{ background: '#27272a', border: 'none', color: '#f4f4f5', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
              >
                <ChevronLeft size={16} /> Bulan Sebelum
              </button>
              <button 
                onClick={handleTodayReset}
                style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid #06b6d4', color: '#38bdf8', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Bulan Ini
              </button>
            </div>

            <h3 style={{ color: '#06b6d4', fontSize: '1.3rem', margin: 0, fontFamily: 'Rajdhani', fontWeight: 800, letterSpacing: '1px' }}>
              {monthNames[currentMonth]} {currentYear}
            </h3>

            <button 
              onClick={handleNextMonth}
              style={{ background: '#27272a', border: 'none', color: '#f4f4f5', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
            >
              Bulan Berikut <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
            {weekdayNames.map(w => (
              <div key={w.code} style={{ color: w.isRed || (holidayConfig.weeklyOff || []).includes(w.num) ? '#ef4444' : '#a1a1aa' }}>
                {w.code} {(holidayConfig.weeklyOff || []).includes(w.num) && <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>(LIBUR)</span>}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem' }}>
            {daysList.map((day, index) => {
              const isHol = day.holidayInfo.isHoliday;
              const activeCount = day.activeCars.length;
              const isFull = activeCount >= 2;
              
              let cellBg = '#121216';
              let borderColor = '#27272a';
              let textColor = '#f4f4f5';

              if (day.isOtherMonth) {
                cellBg = '#09090b';
                borderColor = '#18181b';
                textColor = '#52525b';
              } else if (isHol) {
                cellBg = 'rgba(239, 68, 68, 0.06)';
                borderColor = 'rgba(239, 68, 68, 0.2)';
                textColor = '#94a3b8';
              } else if (isFull) {
                cellBg = 'rgba(239, 68, 68, 0.12)';
                borderColor = 'rgba(239, 68, 68, 0.35)';
              } else if (activeCount > 0) {
                cellBg = 'rgba(245, 158, 11, 0.12)';
                borderColor = 'rgba(245, 158, 11, 0.35)';
              }

              return (
                <div
                  key={`${day.dateStr}-${index}`}
                  onClick={() => setActiveDateModal(day)}
                  style={{
                    minHeight: '88px',
                    minWidth: 0,
                    borderRadius: '6px',
                    background: cellBg,
                    border: `1px solid ${borderColor}`,
                    padding: '0.35rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: day.isOtherMonth ? 0.45 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Date Number & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      fontFamily: 'Rajdhani',
                      color: isHol ? '#f87171' : textColor
                    }}>
                      {day.dayNumber}
                    </span>

                    {isHol ? (
                      <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 800, background: 'rgba(239, 68, 68, 0.2)', padding: '1px 4px', borderRadius: '3px' }}>
                        LIBUR
                      </span>
                    ) : isFull ? (
                      <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 700 }}>FULL</span>
                    ) : activeCount > 0 ? (
                      <span style={{ fontSize: '0.6rem', color: '#f59e0b', fontWeight: 700 }}>{activeCount} MOBIL</span>
                    ) : (
                      <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 600 }}>KOSONG</span>
                    )}
                  </div>

                  {/* Holiday Title if applicable */}
                  {isHol && (
                    <div style={{ fontSize: '0.6rem', color: '#ef4444', fontStyle: 'italic', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {day.holidayInfo.reason}
                    </div>
                  )}

                  {/* Car Schedule Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                    {day.activeCars.map(car => {
                      const progress = getWorkdayProgressIndex(day.dateStr, car.startDate, car.durationDays);
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
                          🚗 {car.licensePlate} ({progress.currentWorkday}/{progress.totalWorkdays}H)
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* POPUP MODAL: DETAIL AGENDA TANGGAL */}
      {activeDateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '1.5rem', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>AGENDA WORKSHOP</span>
                <h3 style={{ color: '#f59e0b', fontSize: '1.25rem', fontFamily: 'Rajdhani', margin: 0 }}>
                  {new Date(activeDateModal.dateStr + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <button 
                onClick={() => setActiveDateModal(null)}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {activeDateModal.holidayInfo.isHoliday ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#a1a1aa', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px' }}>
                <Info size={36} color="#ef4444" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                <strong style={{ color: '#ef4444', fontSize: '1.1rem' }}>Bengkel Libur / Tutup</strong>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.4rem' }}>
                  Keterangan: <strong>{activeDateModal.holidayInfo.reason}</strong>
                </p>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', display: 'block', marginTop: '0.5rem' }}>
                  * Pekerjaan mobil pada hari libur ditangguhkan dan dilanjutkan pada hari kerja berikutnya.
                </span>
              </div>
            ) : activeDateModal.activeCars.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#10b981' }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                <strong>Slot Hari Ini Masih Kosong!</strong>
                <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '0.25rem' }}>
                  Belum ada mobil yang dijadwalkan pengerjaan pada tanggal ini.
                </p>
                <button className="btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => { setActiveDateModal(null); onNavigateToBooking(); }}>
                  Daftarkan Mobil Sekarang
                </button>
              </div>
            ) : (
              <div>
                <h4 style={{ color: '#f4f4f5', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                  Mobil Sedang Dikerjakan ({activeDateModal.activeCars.length} Unit):
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeDateModal.activeCars.map(car => {
                    const progress = getWorkdayProgressIndex(activeDateModal.dateStr, car.startDate, car.durationDays);
                    const statusObj = STATUS_MAP[car.status] || STATUS_MAP.PENGERJAAN;

                    return (
                      <div key={car.id} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', padding: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <strong style={{ color: '#fbbf24', fontSize: '1.05rem', fontFamily: 'Rajdhani' }}>{car.licensePlate}</strong>
                          <span className="badge badge-warning">{statusObj.label}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#f4f4f5', fontWeight: 600 }}>{car.carModel}</div>
                        <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>
                          Pemilik: <span style={{ color: '#fff' }}>{car.customerName}</span>
                        </div>
                        
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#38bdf8' }}>
                          <span>Masuk: {car.startDate}</span>
                          <strong style={{ color: '#f59e0b' }}>Hari Kerja ke-{progress.currentWorkday} dari {progress.totalWorkdays} Hari</strong>
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

      {/* POPUP MODAL: PENGATURAN HARI LIBUR WORKSHOP */}
      {showHolidayModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#f59e0b', fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} /> Pengaturan Hari Libur Workshop
              </h3>
              <button onClick={() => setShowHolidayModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Tentukan hari libur rutin mingguan dan tanggal libur khusus (misal: acara mendadak / hari besar nasional). Hari libur tidak akan dihitung dalam estimasi waktu pengerjaan mobil.
            </p>

            {/* 1. WEEKLY OFF-DAYS CHECKBOXES */}
            <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#f8fafc', fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem' }}>
                🗓️ Hari Libur Rutin Mingguan:
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {weekdayNames.map(w => {
                  const isChecked = (holidayConfig.weeklyOff || []).includes(w.num);
                  return (
                    <label key={w.code} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem', background: isChecked ? 'rgba(239, 68, 68, 0.15)' : '#09090b',
                      border: isChecked ? '1px solid #ef4444' : '1px solid #27272a', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: isChecked ? '#ef4444' : '#cbd5e1'
                    }}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleWeeklyOffDay(w.num)} style={{ accentColor: '#ef4444' }} />
                      <span>{w.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. ADD SPECIFIC HOLIDAY DATES */}
            <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#f8fafc', fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem' }}>
                ➕ Tambah Tanggal Libur Khusus / Mendadak:
              </strong>
              
              <form onSubmit={handleAddSpecificHoliday} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.5rem', alignItems: 'end' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Pilih Tanggal</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    required
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Alasan / Keterangan Libur</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Contoh: Acara Gathering / HUT RI / Cuti Bersama"
                    value={newHolidayTitle}
                    onChange={(e) => setNewHolidayTitle(e.target.value)}
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem' }}>
                  <Plus size={16} /> Tambah Libur
                </button>
              </form>
            </div>

            {/* 3. LIST OF SPECIFIC HOLIDAYS */}
            <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#f8fafc', fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem' }}>
                📋 Daftar Tanggal Libur Khusus Terdaftar:
              </strong>

              {(!holidayConfig.specificHolidays || holidayConfig.specificHolidays.length === 0) ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Belum ada tanggal libur khusus ditambahkan.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {holidayConfig.specificHolidays.map((item, idx) => {
                    const dateVal = typeof item === 'string' ? item : item.date;
                    const titleVal = typeof item === 'string' ? 'Hari Libur Khusus' : item.title || 'Hari Libur Khusus';
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#09090b', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #27272a' }}>
                        <div>
                          <strong style={{ color: '#ef4444', fontSize: '0.85rem', marginRight: '0.5rem' }}>📅 {dateVal}</strong>
                          <span style={{ color: '#f4f4f5', fontSize: '0.8rem' }}>{titleVal}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteSpecificHoliday(dateVal)}
                          style={{ background: 'rgba(244, 63, 94, 0.2)', border: 'none', color: '#f43f5e', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setShowHolidayModal(false)}>
                Selesai & Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
