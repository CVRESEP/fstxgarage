import React, { useState } from 'react';
import { getStoredServices, getStoredSymptoms, generateBookingId } from '../utils/storage';
import { saveQueueToTurso } from '../utils/turso';
import { INDONESIA_CAR_DATABASE, CAR_BRAND_LIST } from '../utils/carData';
import { Car, User, Phone, FileText, CheckCircle2, ChevronRight, ChevronLeft, Wrench, Sparkles, Printer, Edit3, Clock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingModal({ onQueueCreated, onClose, existingQueues, initialDate, services: propServices, symptoms: propSymptoms }) {
  const [step, setStep] = useState(1);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Dynamic services & symptoms from props/storage (managed by Admin & Turso DB)
  const availableServices = (propServices && propServices.length > 0) ? propServices : getStoredServices();
  const availableSymptoms = (propSymptoms && propSymptoms.length > 0) ? propSymptoms : getStoredSymptoms();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  
  // Indonesia Car Brand & Model Dropdown State
  const [carBrand, setCarBrand] = useState('Toyota');
  const [carModelOption, setCarModelOption] = useState('Fortuner (VRZ / SRZ / GR Sport)');
  const [customCarModel, setCustomCarModel] = useState('');
  const [carYear, setCarYear] = useState('2020');

  const [selectedServices, setSelectedServices] = useState(['free_inspection']);
  const [customManualText, setCustomManualText] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState('');

  const handleBrandChange = (newBrand) => {
    setCarBrand(newBrand);
    const models = INDONESIA_CAR_DATABASE[newBrand] || [];
    if (models.length > 0) {
      setCarModelOption(models[0]);
    } else {
      setCarModelOption('');
    }
  };

  const handleToggleService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      if (selectedServices.length === 1) return;
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleToggleSymptom = (symptomText) => {
    if (symptoms.includes(symptomText)) {
      setSymptoms(symptoms.filter(s => s !== symptomText));
    } else {
      setSymptoms([...symptoms, symptomText]);
    }
  };

  const calculateTotalEstimatedCost = () => {
    return selectedServices.reduce((total, id) => {
      const s = availableServices.find(srv => srv.id === id);
      return total + (s ? s.price : 0);
    }, 0);
  };

  const getCurrentFormattedDateTime = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr}, ${timeStr} WIB`;
  };

  const handleSubmitBooking = (e) => {
    if (e) e.preventDefault();

    const fullCarModelText = (carBrand === 'Lainnya / Merk Khusus' || carModelOption === 'Input Manual Tipe Mobil...')
      ? (customCarModel.trim() || 'Mobil Custom')
      : `${carBrand} ${carModelOption}`;

    if (!customerName || !phone || !licensePlate || !fullCarModelText) {
      alert('Mohon lengkapi Nama, No HP, Plat Nomor, dan Merek & Model Mobil.');
      return;
    }

    if (selectedServices.includes('custom_manual_service') && !customManualText.trim()) {
      alert('Mohon tuliskan deskripsi perbaikan custom/manual yang Anda minta.');
      return;
    }

    const bookingId = generateBookingId();
    const todayStr = new Date().toISOString().slice(0, 10);
    const timestamp = getCurrentFormattedDateTime();

    const fullNotes = [
      customManualText ? `Layanan Custom Manual: ${customManualText}` : '',
      symptoms.length > 0 ? `Gejala: ${symptoms.join('; ')}` : '',
      notes ? `Catatan Tambahan: ${notes}` : ''
    ].filter(Boolean).join('\n');

    const initialHistory = [
      { status: 'BOOKING', label: 'Pendaftaran Reservasi Diterima (Menunggu ACC Admin)', timestamp: timestamp }
    ];

    const newBookingData = {
      id: bookingId,
      customerName,
      phone,
      licensePlate: licensePlate.toUpperCase(),
      carModel: `${fullCarModelText} (${carYear})`,
      bookingDate: todayStr,
      startDate: todayStr,
      durationDays: 3,
      endDate: todayStr,
      isApproved: false,
      bookingTime: 'Pending Admin ACC',
      services: selectedServices,
      customManualText,
      customManualPrice: 0,
      status: 'BOOKING',
      estimatedCost: calculateTotalEstimatedCost(),
      parts: [],
      notes: fullNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: initialHistory
    };

    saveQueueToTurso(newBookingData);
    onQueueCreated(newBookingData);
    setCreatedBooking(newBookingData);
    setStep(3); // Success Ticket Screen

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {}
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.35rem 1rem', borderRadius: '9999px', marginBottom: '0.75rem' }}>
            <Sparkles size={16} color="#f59e0b" />
            <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>FORM PENDAFTARAN RESERVASI FSTWORKS</span>
          </div>
          <h2 style={{ fontSize: '2rem', color: '#f8fafc' }}>Pendaftaran Service Kaki-Kaki Mobil</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Isi data kendaraan dan keluhan. Penjadwalan tanggal pengerjaan akan disetujui (ACC) langsung oleh Admin Workshop.
          </p>
        </div>

        {/* Step Indicator (2 Steps Only) */}
        {step <= 2 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '2.5rem', position: 'relative' }}>
            <div style={{ zIndex: 1, textAlign: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: step >= 1 ? '#f59e0b' : '#1e293b', color: step >= 1 ? '#090d16' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, margin: '0 auto 0.5rem' }}>1</div>
              <span style={{ fontSize: '0.85rem', color: step >= 1 ? '#f8fafc' : '#64748b', fontWeight: 600 }}>1. Data Pelanggan & Mobil</span>
            </div>

            <div style={{ zIndex: 1, textAlign: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: step >= 2 ? '#f59e0b' : '#1e293b', color: step >= 2 ? '#090d16' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, margin: '0 auto 0.5rem' }}>2</div>
              <span style={{ fontSize: '0.85rem', color: step >= 2 ? '#f8fafc' : '#64748b', fontWeight: 600 }}>2. Layanan & Gejala Keluhan</span>
            </div>
          </div>
        )}

        {/* STEP 1: Customer & Vehicle Info */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label"><User size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Nama Lengkap Pelanggan *</label>
                <input type="text" className="form-control" placeholder="Contoh: Bapak Hendra" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label"><Phone size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> No. WhatsApp / HP *</label>
                <input type="tel" className="form-control" placeholder="Contoh: 081234567890" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label"><Car size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Nomor Polisi (Plat Mobil) *</label>
                <input type="text" className="form-control" placeholder="Contoh: B 1234 FST" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value.toUpperCase())} required />
              </div>

              <div className="form-group">
                <label className="form-label"><Car size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Merek Mobil *</label>
                <select 
                  className="form-control"
                  value={carBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  required
                >
                  {CAR_BRAND_LIST.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label"><Wrench size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Tipe / Model Mobil *</label>
                <select 
                  className="form-control"
                  value={carModelOption}
                  onChange={(e) => setCarModelOption(e.target.value)}
                  required
                >
                  {(INDONESIA_CAR_DATABASE[carBrand] || []).map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tahun Mobil</label>
                <select className="form-control" value={carYear} onChange={(e) => setCarYear(e.target.value)}>
                  {Array.from({ length: 25 }, (_, i) => 2026 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {(carBrand === 'Lainnya / Merk Khusus' || carModelOption === 'Input Manual Tipe Mobil...') && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ color: '#38bdf8', fontWeight: 600 }}>Tuliskan Merek & Tipe Mobil Spesifik Anda *</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Contoh: Isuzu Panther Grand Royal 1997 / Nissan Fairlady 370Z..."
                    value={customCarModel}
                    onChange={(e) => setCustomCarModel(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primary">
                Lanjut Pilih Layanan & Gejala <ChevronRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Services & Symptom Checklist -> Direct Submit */}
        {step === 2 && (
          <div>
            <h3 style={{ color: '#f59e0b', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wrench size={18} /> Pilih Layanan Kaki-Kaki & Suspensi:
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {availableServices.map(service => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <div 
                    key={service.id}
                    onClick={() => handleToggleService(service.id)}
                    style={{
                      background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                      border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{service.category}</span>
                      <input type="checkbox" checked={isSelected} onChange={() => {}} style={{ accentColor: '#f59e0b', width: '18px', height: '18px' }} />
                    </div>
                    <h4 style={{ color: '#f8fafc', fontSize: '0.95rem', marginBottom: '0.35rem' }}>{service.name}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>{service.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: '#06b6d4', fontWeight: 600 }}>{service.estimatedDuration}</span>
                      <strong style={{ color: service.price === 0 ? '#10b981' : '#fbbf24', fontSize: '1rem' }}>
                        {service.isManual ? 'DITENTUKAN ADMIN' : service.price === 0 ? 'FREE / GRATIS' : formatCurrency(service.price)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MANUAL CUSTOM INPUT SLOT (If selected) */}
            {selectedServices.includes('custom_manual_service') && (
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1.5px dashed #06b6d4', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
                <label className="form-label" style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit3 size={18} /> Tuliskan Permintaan Layanan Custom / Perbaikan Spesifik Anda:
                </label>
                <textarea 
                  className="form-control"
                  rows="3"
                  placeholder="Contoh: Rakit custom per keong 32-step, ganti bushing polyurethane custom sasis belakang, atau rakit swaybar custom..."
                  value={customManualText}
                  onChange={(e) => setCustomManualText(e.target.value)}
                  style={{ background: '#090d16', color: '#f8fafc' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', display: 'block' }}>
                  💡 Catatan: Estimasi biaya untuk layanan custom ini akan ditentukan & di-ACC oleh Admin Workshop setelah pendaftaran Anda diterima.
                </span>
              </div>
            )}

            {/* Dynamic Symptom Checklist Managed by Admin */}
            <h3 style={{ color: '#06b6d4', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} /> Ceklis Gejala Kaki-Kaki Yang Dirasakan:
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {availableSymptoms.map((sym, index) => {
                const isChecked = symptoms.includes(sym);
                return (
                  <label 
                    key={index} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: isChecked ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                      border: isChecked ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: isChecked ? '#f8fafc' : '#94a3b8'
                    }}
                  >
                    <input type="checkbox" checked={isChecked} onChange={() => handleToggleSymptom(sym)} style={{ accentColor: '#06b6d4', width: '16px', height: '16px' }} />
                    <span>{sym}</span>
                  </label>
                );
              })}
            </div>

            {/* Additional Notes */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Catatan Tambahan Pelanggan (Opsional)</label>
              <textarea 
                className="form-control" 
                rows="2" 
                placeholder="Misal: Mobil hanya bisa diantar jam 5 sore atau tolong diperiksa juga rem belakang..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                <ChevronLeft size={18} /> Kembali
              </button>
              <button type="button" className="btn-primary" onClick={handleSubmitBooking}>
                Kirim Pendaftaran Reservasi <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS TICKET CONFIRMATION */}
        {step === 3 && createdBooking && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={40} />
            </div>

            <h2 style={{ color: '#f8fafc', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Pendaftaran Reservasi Berhasil!</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '550px', margin: '0 auto 1.5rem' }}>
              Pendaftaran Anda telah diterima. **Penjadwalan tanggal pengerjaan & penentuan harga custom** akan ditentukan dan di-ACC langsung oleh Admin Workshop FSTWORKS.
            </p>

            {/* Booking Ticket Card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.6) 100%)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '1.75rem', maxWidth: '520px', margin: '0 auto 2rem', textAlign: 'left', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>KODE BOOKING UNIK</span>
                  <strong style={{ fontSize: '1.5rem', color: '#f59e0b', fontFamily: 'Rajdhani' }}>{createdBooking.id}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Pelanggan:</span>
                  <strong style={{ color: '#fff' }}>{createdBooking.customerName}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', display: 'block' }}>Plat & Mobil:</span>
                  <strong style={{ color: '#fbbf24' }}>{createdBooking.licensePlate}</strong> ({createdBooking.carModel})
                </div>
              </div>

              <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#38bdf8' }}>
                <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                <strong>Status: MENUNGGU PENENTUAN TANGGAL & ACC ADMIN</strong>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '4px 0 0 0' }}>
                  Admin akan menyetujui jadwal di kalender workshop dan menghubungi Anda via WhatsApp.
                </p>
              </div>

              <div style={{ fontSize: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Estimasi Biaya Awal:</span>
                <strong style={{ color: '#10b981', fontSize: '1.1rem', fontFamily: 'Rajdhani' }}>
                  {createdBooking.estimatedCost === 0 ? 'DITENTUKAN ADMIN' : formatCurrency(createdBooking.estimatedCost)}
                </strong>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {onClose && (
                <button className="btn-secondary" onClick={onClose}>
                  Tutup Form
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
