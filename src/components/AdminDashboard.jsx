import React, { useState, useEffect } from 'react';
import { 
  STATUS_MAP, generateBookingId,
  getStoredServices, saveServicesToStorage,
  getStoredSymptoms, saveSymptomsToStorage
} from '../utils/storage';
import { speakQueueCall } from '../utils/audio';
import { 
  ShieldCheck, Plus, Volume2, Printer, Trash2, CheckCircle2, Clock, 
  Calendar as CalendarIcon, Check, Settings, DollarSign, Wrench, Edit, 
  FileText, AlertCircle, PlusCircle, Search, Filter, TrendingUp, Package, X, History, Sliders, Star, Smartphone, Monitor
} from 'lucide-react';

export default function AdminDashboard({ 
  queues, 
  setQueues, 
  onOpenSPK, 
  siteConfig, 
  setSiteConfig, 
  testimonials = [], 
  setTestimonials 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState('acc_pending'); // 'acc_pending', 'active_progress', 'financial_report', 'services', 'symptoms', 'cms'
  const [searchFilter, setSearchFilter] = useState('');

  // Device Identification State: 'PC' or 'HP'
  const [deviceType, setDeviceType] = useState('PC');

  useEffect(() => {
    const detectDevice = () => {
      const isMobileScreen = window.innerWidth <= 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobileScreen || isMobileUA) {
        setDeviceType('HP');
      } else {
        setDeviceType('PC');
      }
    };
    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // CMS Content State
  const [cmsState, setCmsState] = useState(siteConfig || {
    heroBadge: 'Undercarriage Specialist',
    heroHeadline: 'FSTWORKS UNDERCARRIAGE SPECIALIST',
    heroSubheadline: 'Penanganan profesional & presisi suspensi kendaraan dari team FSTWORKS. Penjadwalan pengerjaan & estimasi biaya ditentukan langsung oleh Admin.',
    whatsappNumber: '6281234567890',
    operatingHours: 'Senin - Sabtu: 08:30 - 17:00 WIB',
    operatingHoursSunday: 'Minggu & Hari Libur: Tutup (Reservasi WA)',
    address: 'Jl. Raya Utama Otomotif No. 88, Pusat Suspensi & Steering, Jakarta / Indonesia',
    hotlinePhone: '0812-3456-7890',
    guaranteeText: 'Garansi Servis Sampai 12 Bulan'
  });

  // Testimonials Form State
  const [newTestiName, setNewTestiName] = useState('');
  const [newTestiRating, setNewTestiRating] = useState(5);
  const [newTestiComment, setNewTestiComment] = useState('');

  // Dynamic Services & Symptoms state
  const [services, setServices] = useState(getStoredServices());
  const [symptoms, setSymptoms] = useState(getStoredSymptoms());

  // Form state for adding/editing services
  const [editingService, setEditingService] = useState(null);
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] = useState('Suspensi');
  const [srvPrice, setSrvPrice] = useState(250000);
  const [srvDuration, setSrvDuration] = useState('60 Menit');
  const [srvDesc, setSrvDesc] = useState('');

  // Form state for adding new symptom
  const [newSymptomText, setNewSymptomText] = useState('');

  // CMS Handlers
  const handleSaveCMS = (e) => {
    e.preventDefault();
    if (setSiteConfig) {
      setSiteConfig(cmsState);
      alert('✅ Konten & Teks Halaman Customer Berhasil Diperbarui!');
    }
  };

  const handleAddTestimonial = (e) => {
    e.preventDefault();
    if (!newTestiName || !newTestiComment) return;
    const item = {
      id: Date.now(),
      name: newTestiName,
      rating: Number(newTestiRating),
      comment: newTestiComment
    };
    if (setTestimonials) {
      setTestimonials(prev => [item, ...prev]);
    }
    setNewTestiName('');
    setNewTestiComment('');
    setNewTestiRating(5);
  };

  const handleDeleteTestimonial = (id) => {
    if (confirm('Yakin ingin menghapus ulasan ini?')) {
      if (setTestimonials) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
      }
    }
  };

  // Add Walk-in state
  const [showAddWalkin, setShowAddWalkin] = useState(false);
  const [wName, setWName] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wPlate, setWPlate] = useState('');
  const [wCar, setWCar] = useState('');
  const [wService, setWService] = useState('free_inspection');

  // ACC Schedule Modal state
  const [selectedACCQueue, setSelectedACCQueue] = useState(null);
  const [accStartDate, setAccStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [accDurationDays, setAccDurationDays] = useState(5);
  const [accCustomPrice, setAccCustomPrice] = useState(0);
  const [sendWAOnACC, setSendWAOnACC] = useState(true);

  // Manage Spareparts Modal state
  const [selectedPartQueue, setSelectedPartQueue] = useState(null);
  const [partNameInput, setPartNameInput] = useState('');
  const [partPriceInput, setPartPriceInput] = useState('');

  // Custom Status Text Modal / Editing
  const [selectedCustomStatusQueue, setSelectedCustomStatusQueue] = useState(null);
  const [customStatusInput, setCustomStatusInput] = useState('');

  // Grouped datasets
  const pendingACCQueues = queues.filter(q => !q.isApproved || q.status === 'BOOKING');
  const activeWorkQueues = queues.filter(q => q.isApproved && (q.status === 'INSPEKSI' || q.status === 'PENGERJAAN' || q.status === 'TEST_DRIVE' || q.status === 'CUSTOM'));
  const completedQueues = queues.filter(q => q.status === 'SELESAI');

  // Revenue calculation for financial report
  const totalCompletedRevenue = completedQueues.reduce((sum, q) => sum + (q.estimatedCost || 0), 0);
  const totalPotentialRevenue = queues.reduce((sum, q) => sum + (q.estimatedCost || 0), 0);

  // Filter helper
  const filterListBySearch = (list) => {
    return list.filter(q => 
      q.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.licensePlate.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.carModel.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.id.toLowerCase().includes(searchFilter.toLowerCase())
    );
  };

  // Helper to format date-time string
  const getCurrentFormattedDateTime = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr}, ${timeStr} WIB`;
  };

  // Recalculate queue total cost
  const calculateQueueTotalCost = (queue) => {
    let baseServicesTotal = 0;
    if (queue.services && Array.isArray(queue.services)) {
      queue.services.forEach(srvId => {
        const found = services.find(s => s.id === srvId);
        if (found && !found.isManual) {
          baseServicesTotal += found.price;
        }
      });
    }
    const customPrice = queue.customManualPrice || 0;
    const partsTotal = (queue.parts || []).reduce((sum, p) => sum + (p.price || 0), 0);
    return baseServicesTotal + customPrice + partsTotal;
  };

  // Update status handler with AUTOMATIC HISTORY LOGGING
  const handleUpdateStatus = (queueId, newStatus) => {
    const queueToUpdate = queues.find(q => q.id === queueId);
    if (newStatus === 'CUSTOM') {
      setSelectedCustomStatusQueue(queueToUpdate);
      setCustomStatusInput(queueToUpdate?.customStatusText || 'Sedang Bubut Disc Brake / Inden Part');
      return;
    }

    const statusObj = STATUS_MAP[newStatus];
    const statusLabel = statusObj ? statusObj.label : newStatus;
    const timestamp = getCurrentFormattedDateTime();

    const updatedHistoryItem = {
      status: newStatus,
      label: statusLabel,
      timestamp: timestamp
    };

    const updated = queues.map(q => {
      if (q.id === queueId) {
        const existingHistory = q.statusHistory || [];
        return { 
          ...q, 
          status: newStatus, 
          updatedAt: new Date().toISOString(),
          statusHistory: [updatedHistoryItem, ...existingHistory]
        };
      }
      return q;
    });
    setQueues(updated);
  };

  // Submit Custom Status Text with AUTOMATIC HISTORY LOGGING
  const handleSaveCustomStatus = (e) => {
    e.preventDefault();
    if (!selectedCustomStatusQueue || !customStatusInput.trim()) return;

    const timestamp = getCurrentFormattedDateTime();
    const updatedHistoryItem = {
      status: 'CUSTOM',
      label: `📝 Status Custom: "${customStatusInput.trim()}"`,
      timestamp: timestamp
    };

    const updated = queues.map(q => {
      if (q.id === selectedCustomStatusQueue.id) {
        const existingHistory = q.statusHistory || [];
        return {
          ...q,
          status: 'CUSTOM',
          customStatusText: customStatusInput.trim(),
          updatedAt: new Date().toISOString(),
          statusHistory: [updatedHistoryItem, ...existingHistory]
        };
      }
      return q;
    });

    setQueues(updated);
    setSelectedCustomStatusQueue(null);
  };

  // Sparepart Handlers
  const handleAddPartToQueue = (e) => {
    e.preventDefault();
    if (!selectedPartQueue || !partNameInput.trim()) return;

    const newPart = {
      id: `part_${Date.now()}`,
      name: partNameInput.trim(),
      price: parseInt(partPriceInput, 10) || 0
    };

    const existingParts = selectedPartQueue.parts || [];
    const updatedParts = [...existingParts, newPart];

    const updatedQueues = queues.map(q => {
      if (q.id === selectedPartQueue.id) {
        const updatedObj = { ...q, parts: updatedParts };
        updatedObj.estimatedCost = calculateQueueTotalCost(updatedObj);
        return updatedObj;
      }
      return q;
    });

    setQueues(updatedQueues);
    setSelectedPartQueue(updatedQueues.find(q => q.id === selectedPartQueue.id));
    setPartNameInput('');
    setPartPriceInput('');
  };

  const handleDeletePartFromQueue = (partId) => {
    if (!selectedPartQueue) return;

    const updatedParts = (selectedPartQueue.parts || []).filter(p => p.id !== partId);

    const updatedQueues = queues.map(q => {
      if (q.id === selectedPartQueue.id) {
        const updatedObj = { ...q, parts: updatedParts };
        updatedObj.estimatedCost = calculateQueueTotalCost(updatedObj);
        return updatedObj;
      }
      return q;
    });

    setQueues(updatedQueues);
    setSelectedPartQueue(updatedQueues.find(q => q.id === selectedPartQueue.id));
  };

  // Service Management Handlers
  const handleSaveService = (e) => {
    e.preventDefault();
    if (!srvName.trim()) return;

    let updatedServices;
    if (editingService) {
      updatedServices = services.map(s => s.id === editingService.id ? {
        ...s,
        name: srvName,
        category: srvCategory,
        price: parseInt(srvPrice, 10) || 0,
        estimatedDuration: srvDuration,
        description: srvDesc
      } : s);
    } else {
      const newServiceObj = {
        id: `srv_${Date.now()}`,
        name: srvName,
        category: srvCategory,
        price: parseInt(srvPrice, 10) || 0,
        estimatedDuration: srvDuration,
        description: srvDesc
      };
      updatedServices = [...services, newServiceObj];
    }

    setServices(updatedServices);
    saveServicesToStorage(updatedServices);
    setEditingService(null);
    setSrvName(''); setSrvPrice(0); setSrvDesc('');
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
      const updated = services.filter(s => s.id !== serviceId);
      setServices(updated);
      saveServicesToStorage(updated);
    }
  };

  // Symptom Management Handlers
  const handleAddSymptom = (e) => {
    e.preventDefault();
    if (!newSymptomText.trim()) return;

    const updated = [...symptoms, newSymptomText.trim()];
    setSymptoms(updated);
    saveSymptomsToStorage(updated);
    setNewSymptomText('');
  };

  const handleDeleteSymptom = (index) => {
    const updated = symptoms.filter((_, idx) => idx !== index);
    setSymptoms(updated);
    saveSymptomsToStorage(updated);
  };

  const handleDeleteQueue = (queueId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const updated = queues.filter(q => q.id !== queueId);
      setQueues(updated);
    }
  };

  const handleCallCustomer = (queue) => {
    speakQueueCall(queue);
  };

  const formatWAPhone = (phoneStr) => {
    let cleaned = (phoneStr || '').replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  const sendWhatsAppACCMessage = (queue) => {
    if (!queue || !queue.phone) {
      alert('Nomor WhatsApp pelanggan tidak valid/tidak ditemukan.');
      return;
    }

    const waPhone = formatWAPhone(queue.phone);

    const servicesList = (queue.services || []).map(sid => {
      const sObj = services.find(s => s.id === sid);
      return sObj ? sObj.name : sid;
    }).join(', ');

    const totalCostStr = formatCurrency(calculateQueueTotalCost(queue));

    const message = 
`*SURAT KONFIRMASI PENJADWALAN & RESERVASI WORKSHOP FSTWORKS* 🚗⚙️
━━━━━━━━━━━━━━━━━━━━━━━━━━

Halo Bpk/Ibu *${queue.customerName}*,

Pendaftaran reservasi service kendaraan Anda telah *DISETUJUI (ACC)* oleh Admin Bengkel Rumahan *FSTWORKS*.

📋 *DETAIL KENDARAAN & BOOKING:*
• Kode Booking : *${queue.id}*
• Plat Mobil   : *${queue.licensePlate}*
• Merek/Model  : *${queue.carModel}*

📅 *JADWAL PENGERJAAN WORKSHOP:*
• Tanggal Mulai : *${queue.startDate}*
• Durasi Est.   : *${queue.durationDays} Hari Kerja*
• Tanggal Selesai: *${queue.endDate}*

🛠️ *LAYANAN & PERKIRAAN TAGIHAN:*
• Layanan      : ${servicesList}
${queue.customManualText ? `• Layanan Custom: "${queue.customManualText}"\n` : ''}• Total Biaya Est.: *${totalCostStr}*

🔍 *CEK STATUS KENDARAAN ONLINE:*
Anda dapat memantau progress pengerjaan kendaraan secara berkala di web FSTWORKS dengan Kode Booking: *${queue.id}*

━━━━━━━━━━━━━━━━━━━━━━━━━━
Terima kasih telah mempercayakan kendaraan Anda pada *FSTWORKS Home Workshop*! 🙏`;

    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const sendWhatsAppProgressMessage = (queue) => {
    if (!queue || !queue.phone) {
      alert('Nomor WhatsApp pelanggan tidak ditemukan.');
      return;
    }
    const waPhone = formatWAPhone(queue.phone);
    const currentStatusLabel = STATUS_MAP[queue.status]?.label || queue.status;
    const totalCostStr = formatCurrency(calculateQueueTotalCost(queue));

    const partsDetail = queue.parts && queue.parts.length > 0
      ? queue.parts.map(p => `  • ${p.name}: ${formatCurrency(p.price)}`).join('\n')
      : '  • Belum ada penggantian sparepart tambahan';

    const message = 
`*UPDATE PROGRESS PEKERJAAN - WORKSHOP FSTWORKS* 🚗🔧
━━━━━━━━━━━━━━━━━━━━━━━━━━

Yth. Bpk/Ibu *${queue.customerName}*,
Berikut adalah update perkembangan pengerjaan kendaraan Anda:

🚘 *MOBIL:* *${queue.licensePlate}* (${queue.carModel})
📌 *STATUS TERBARU:* *${currentStatusLabel}*

🛠️ *SPAREPART & PENGGANTIAN:*
${partsDetail}

💰 *ESTIMASI TOTAL TAGIHAN:* *${totalCostStr}*

Cek riwayat lengkap pengerjaan di web FSTWORKS (Kode Booking: *${queue.id}*)
Terima kasih! 🙏`;

    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const sendWhatsAppInvoiceMessage = (queue) => {
    if (!queue || !queue.phone) {
      alert('Nomor WhatsApp pelanggan tidak ditemukan.');
      return;
    }
    const waPhone = formatWAPhone(queue.phone);
    const totalCostStr = formatCurrency(calculateQueueTotalCost(queue));

    const message = 
`*NOTA / INVOICE PENYELESAIAN SERVICE - FSTWORKS* 📜✅
━━━━━━━━━━━━━━━━━━━━━━━━━━

Yth. Bpk/Ibu *${queue.customerName}*,

Pengerjaan kaki-kaki kendaraan Anda telah *SELESAI 100%* dan siap diambil.

🚘 *DETAIL PENYERAHAN:*
• Plat Mobil   : *${queue.licensePlate}* (${queue.carModel})
• Kode Booking : *${queue.id}*
• Total Tagihan: *${totalCostStr}*
• Status Bayar : *LUNAS & SELESAI*

Terima kasih telah melakukan perawatan & perbaikan di *FSTWORKS Home Workshop*! 🙏`;

    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleACCBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedACCQueue) return;

    const d = new Date(accStartDate);
    d.setDate(d.getDate() + (parseInt(accDurationDays, 10) || 1));
    const endDateStr = d.toISOString().slice(0, 10);

    const addedCustomPrice = parseInt(accCustomPrice, 10) || 0;
    const timestamp = getCurrentFormattedDateTime();

    const accHistoryItem = {
      status: 'PENGERJAAN',
      label: `Disetujui Admin (ACC) - Mulai Tgl ${accStartDate} (${accDurationDays} Hari)`,
      timestamp: timestamp
    };

    const updatedQueueObj = {
      ...selectedACCQueue,
      startDate: accStartDate,
      durationDays: parseInt(accDurationDays, 10),
      endDate: endDateStr,
      isApproved: true,
      status: 'PENGERJAAN',
      customManualPrice: addedCustomPrice,
      updatedAt: new Date().toISOString(),
      statusHistory: [accHistoryItem, ...(selectedACCQueue.statusHistory || [])]
    };
    updatedQueueObj.estimatedCost = calculateQueueTotalCost(updatedQueueObj);

    const updated = queues.map(q => {
      if (q.id === selectedACCQueue.id) {
        return updatedQueueObj;
      }
      return q;
    });

    setQueues(updated);
    setSelectedACCQueue(null);

    // Automatically send WhatsApp message / open WhatsApp click-to-chat
    if (sendWAOnACC) {
      sendWhatsAppACCMessage(updatedQueueObj);
    }
  };

  const handleAddWalkinSubmit = (e) => {
    e.preventDefault();
    if (!wName || !wPlate || !wCar) {
      alert('Isi Nama, Plat Nomor, dan Model Mobil.');
      return;
    }

    const srvObj = services.find(s => s.id === wService);

    const todayStr = new Date().toISOString().slice(0, 10);
    const d = new Date();
    d.setDate(d.getDate() + 3);

    const timestamp = getCurrentFormattedDateTime();
    const initialHistory = [
      { status: 'INSPEKSI', label: 'Pendaftaran Walk-In di Workshop (Inspeksi)', timestamp: timestamp }
    ];

    const newWalkin = {
      id: generateBookingId(),
      customerName: wName,
      phone: wPhone || '0800000000',
      licensePlate: wPlate.toUpperCase(),
      carModel: wCar,
      bookingDate: todayStr,
      startDate: todayStr,
      durationDays: 3,
      endDate: d.toISOString().slice(0, 10),
      isApproved: true,
      bookingTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      services: [wService],
      status: 'INSPEKSI',
      estimatedCost: srvObj ? srvObj.price : 0,
      parts: [],
      notes: 'Walk-in langsung di bengkel FSTWORKS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: initialHistory
    };

    setQueues([newWalkin, ...queues]);
    setShowAddWalkin(false);
    setWName(''); setWPlate(''); setWCar('');
    speakQueueCall(newWalkin);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '450px', margin: '4rem auto', padding: '1rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <ShieldCheck size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Akses Dashboard Workshop</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Masukkan Kode Passcode Staff Bengkel FSTWORKS.</p>
          <input 
            type="password"
            className="form-control"
            placeholder="Passcode (Default: fst123)"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '1rem' }}
          />
          <button 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              if (passcode === 'fst123' || passcode === '') {
                setIsAuthenticated(true);
              } else {
                alert('Passcode salah. Gunakan fst123');
              }
            }}
          >
            Masuk Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.25rem 0.85rem' }}>
      
      {/* Top Admin Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-warning">WORKSHOP MANAGEMENT</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#f4f4f5', margin: '2px 0 0' }}>Dashboard Admin FSTWORKS</h2>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => setShowAddWalkin(true)}>
            <Plus size={18} /> Customer Walk-In
          </button>

          <button className="btn-secondary" onClick={() => setIsAuthenticated(false)}>
            Kunci Dashboard
          </button>
        </div>
      </div>

      {/* KPI Analytics Cards Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>1. ACC & Harga Custom</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'Rajdhani' }}>{pendingACCQueues.length} Mobil</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Perlu persetujuan & penentuan harga</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>2. Dalam Pengerjaan</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4', fontFamily: 'Rajdhani' }}>{activeWorkQueues.length} Mobil</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sedang di-pit / menginap</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>3. Mobil Selesai</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', fontFamily: 'Rajdhani' }}>{completedQueues.length} Mobil</div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Siap diambil customer</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Omzet Realisasi (Selesai)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'Rajdhani' }}>{formatCurrency(totalCompletedRevenue)}</div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Potensi Total: {formatCurrency(totalPotentialRevenue)}</span>
        </div>
      </div>

      {/* DEVICE IDENTIFICATION BANNER */}
      <div style={{ 
        background: deviceType === 'HP' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(245, 158, 11, 0.12)', 
        border: `1px solid ${deviceType === 'HP' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        padding: '0.75rem 1.25rem', 
        borderRadius: '10px', 
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {deviceType === 'HP' ? <Smartphone size={20} color="#38bdf8" /> : <Monitor size={20} color="#fbbf24" />}
          <div>
            <div style={{ color: '#f4f4f5', fontSize: '0.875rem' }}>
              Identifikasi Perangkat: <strong style={{ color: deviceType === 'HP' ? '#38bdf8' : '#fbbf24' }}>
                {deviceType === 'HP' ? '📱 SMARTPHONE / HP (MOBILE VIEW)' : '💻 PC / LAPTOP (DESKTOP VIEW)'}
              </strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
              {deviceType === 'HP' 
                ? 'Terdeteksi Layar Smartphone: Tampilan tabel otomatis dibuat RINGKAS dalam format kartu data penting saja'
                : 'Terdeteksi Layar PC/Desktop: Menampilkan tabel spasial multi-kolom lengkap dengan rincian instrumen'}
            </span>
          </div>
        </div>

        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          padding: '0.3rem 0.75rem', 
          borderRadius: '6px',
          background: deviceType === 'HP' ? '#06b6d4' : '#f59e0b',
          color: '#050507'
        }}>
          {deviceType === 'HP' ? 'Mode Tabel Ringkas (HP)' : 'Mode Tabel Spasial (PC)'}
        </span>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        
        {/* GROUP 1 */}
        <button 
          className={`btn-secondary ${activeAdminTab === 'acc_pending' ? 'active-nav' : ''}`}
          onClick={() => setActiveAdminTab('acc_pending')}
          style={activeAdminTab === 'acc_pending' ? { background: '#f59e0b', color: '#090d16', fontWeight: 800 } : {}}
        >
          <CalendarIcon size={16} /> 1. ACC Mobil & Harga Custom ({pendingACCQueues.length})
        </button>

        {/* GROUP 2 */}
        <button 
          className={`btn-secondary ${activeAdminTab === 'active_progress' ? 'active-nav' : ''}`}
          onClick={() => setActiveAdminTab('active_progress')}
          style={activeAdminTab === 'active_progress' ? { background: '#06b6d4', color: '#090d16', fontWeight: 800 } : {}}
        >
          <Wrench size={16} /> 2. Perubahan Status Pekerjaan & Sparepart ({activeWorkQueues.length})
        </button>

        {/* GROUP 3 */}
        <button 
          className={`btn-secondary ${activeAdminTab === 'financial_report' ? 'active-nav' : ''}`}
          onClick={() => setActiveAdminTab('financial_report')}
          style={activeAdminTab === 'financial_report' ? { background: '#10b981', color: '#090d16', fontWeight: 800 } : {}}
        >
          <TrendingUp size={16} /> 3. Mobil Selesai & Laporan Keuangan
        </button>

        {/* MASTER SETTINGS */}
        <button 
          className={`btn-secondary ${activeAdminTab === 'services' ? 'active-nav' : ''}`}
          onClick={() => setActiveAdminTab('services')}
          style={activeAdminTab === 'services' ? { background: '#64748b', color: '#fff', marginLeft: 'auto' } : { marginLeft: 'auto' }}
        >
          <DollarSign size={16} /> Kelola Layanan & Harga
        </button>

        <button 
          className={`btn-secondary ${activeAdminTab === 'symptoms' ? 'active-nav' : ''}`}
          onClick={() => setActiveAdminTab('symptoms')}
          style={activeAdminTab === 'symptoms' ? { background: '#64748b', color: '#fff' } : {}}
        >
          <FileText size={16} /> Kelola Ceklis Keluhan
        </button>

        <button 
          className={`btn-secondary ${activeAdminTab === 'cms' ? 'active-nav' : ''}`}
          onClick={() => setActiveAdminTab('cms')}
          style={activeAdminTab === 'cms' ? { background: '#f59e0b', color: '#090d16', fontWeight: 800 } : {}}
        >
          <Sliders size={16} /> Edit Teks & Halaman Customer
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          className="form-control"
          placeholder="Cari berdasarkan Plat Nomor, Nama Customer, Tipe Mobil, atau Kode Booking..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.95rem' }}
        />
      </div>

      {/* SECTION 1: ACC MOBIL & PENENTUAN HARGA CUSTOM */}
      {activeAdminTab === 'acc_pending' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ color: '#fbbf24', fontSize: '1.25rem', margin: 0, fontFamily: 'Rajdhani', fontWeight: 800 }}>
                📌 TABEL 1: PERSETUJUAN ACC BOOKING & PENENTUAN HARGA CUSTOM
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Gunakan tabel ini untuk memeriksa booking baru, menyetujui tanggal pengerjaan di kalender, dan menentukan harga custom.
              </p>
            </div>
          </div>

          {/* PC / DESKTOP VIEW MODE (SPATIAL TABLE) */}
          <div className="view-pc-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 0.75rem' }}>Kode Booking</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Plat & Mobil</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Pelanggan (WhatsApp)</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Layanan / Isian Manual Customer</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Estimasi Awal</th>
                  <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>Aksi ACC & Penentuan Harga</th>
                </tr>
              </thead>
              <tbody>
                {filterListBySearch(pendingACCQueues).length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      ✓ Tidak ada booking baru yang perlu di-ACC saat ini. Semua booking sudah disetujui!
                    </td>
                  </tr>
                ) : (
                  filterListBySearch(pendingACCQueues).map((q, idx) => (
                    <tr key={q.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: idx % 2 === 0 ? 'rgba(245, 158, 11, 0.03)' : 'transparent' }}>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'Rajdhani', display: 'block' }}>{q.id}</span>
                      </td>

                      <td style={{ padding: '1rem 0.75rem' }}>
                        <strong style={{ color: '#fbbf24', fontSize: '1.05rem', fontFamily: 'Rajdhani', display: 'block' }}>{q.licensePlate}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{q.carModel}</span>
                      </td>

                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{q.customerName}</div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{q.phone}</span>
                      </td>

                      <td style={{ padding: '1rem 0.75rem', maxWidth: '300px' }}>
                        {q.customManualText ? (
                          <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1.5px dashed #06b6d4', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#fff' }}>
                            <span style={{ color: '#38bdf8', fontWeight: 700, display: 'block' }}>📝 ISIAN MANUAL:</span>
                            "{q.customManualText}"
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                            {q.services && q.services.join(', ')}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 0.75rem' }}>
                        <strong style={{ color: '#10b981', fontSize: '1rem', fontFamily: 'Rajdhani' }}>
                          {formatCurrency(q.estimatedCost)}
                        </strong>
                      </td>

                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            onClick={() => sendWhatsAppACCMessage(q)} 
                            title="Kirim Surat Konfirmasi / Chat Customer Ke WhatsApp"
                            className="btn-cyan btn-sm"
                            style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', fontWeight: 700 }}
                          >
                            📱 WA
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedACCQueue(q);
                              setAccStartDate(q.bookingDate || new Date().toISOString().slice(0, 10));
                              setAccCustomPrice(q.customManualPrice || 0);
                            }}
                            className="btn-primary"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                          >
                            <CalendarIcon size={16} /> ACC & Set Tanggal + Harga Custom
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* HP / MOBILE VIEW MODE (COMPACT ESSENTIAL CARDS) */}
          <div className="view-hp-only">
            {filterListBySearch(pendingACCQueues).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                ✓ Tidak ada booking baru yang perlu di-ACC saat ini.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filterListBySearch(pendingACCQueues).map((q) => (
                  <div key={q.id} className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ color: '#fbbf24', fontSize: '1.15rem', fontFamily: 'Rajdhani', display: 'block' }}>
                          {q.licensePlate}
                        </strong>
                        <span style={{ fontSize: '0.825rem', color: '#e2e8f0', fontWeight: 600 }}>
                          {q.carModel} • {q.customerName}
                        </span>
                      </div>
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{q.id}</span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                      {q.customManualText ? (
                        <div>
                          <strong style={{ color: '#38bdf8' }}>📝 Permintaan Manual:</strong>
                          <div style={{ fontStyle: 'italic', color: '#fff', marginTop: '2px' }}>"{q.customManualText}"</div>
                        </div>
                      ) : (
                        <div><strong>Layanan:</strong> {q.services && q.services.join(', ')}</div>
                      )}
                      <div style={{ marginTop: '4px', color: '#10b981', fontWeight: 700, fontSize: '0.875rem' }}>
                        Est: {formatCurrency(q.estimatedCost)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => sendWhatsAppACCMessage(q)} 
                        className="btn-cyan btn-sm"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', flexShrink: 0 }}
                      >
                        📱 WA
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedACCQueue(q);
                          setAccStartDate(q.bookingDate || new Date().toISOString().slice(0, 10));
                          setAccCustomPrice(q.customManualPrice || 0);
                        }}
                        className="btn-primary btn-sm"
                        style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                      >
                        <CalendarIcon size={14} /> ⚡ ACC & Harga
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* SECTION 2: PERUBAHAN STATUS PEKERJAAN & OTOMATIS SUB-BARIS RIWAYAT STATUS */}
      {activeAdminTab === 'active_progress' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ color: '#06b6d4', fontSize: '1.25rem', margin: 0, fontFamily: 'Rajdhani', fontWeight: 800 }}>
                🔧 TABEL 2: PERUBAHAN STATUS PEKERJAAN & OTOMATIS SUB-BARIS TANGGAL STATUS
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Setiap perubahan status pekerjaan otomatis membuat sub-baris riwayat tanggal & detail perubahan di bawahnya.
              </p>
            </div>
          </div>

          {/* PC / DESKTOP VIEW MODE (SPATIAL TABLE WITH SUB-ROWS) */}
          <div className="view-pc-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(6, 182, 212, 0.3)', color: '#38bdf8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem 0.75rem' }}>Kode Booking</th>
                <th style={{ padding: '1rem 0.75rem' }}>Plat & Mobil</th>
                <th style={{ padding: '1rem 0.75rem' }}>Pelanggan</th>
                <th style={{ padding: '1rem 0.75rem' }}>Sparepart Pengganti & Biaya</th>
                <th style={{ padding: '1rem 0.75rem' }}>Status Pekerjaan (Pilih / Custom)</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Total Biaya Final</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>Aksi Voice & SPK</th>
              </tr>
            </thead>
            <tbody>
              {filterListBySearch(activeWorkQueues).length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Tidak ada mobil yang sedang dikerjakan saat ini.
                  </td>
                </tr>
              ) : (
                filterListBySearch(activeWorkQueues).map((q, idx) => {
                  const isCustomStatus = q.status === 'CUSTOM';
                  const statusObj = STATUS_MAP[q.status] || STATUS_MAP.PENGERJAAN;
                  const partsCount = (q.parts || []).length;
                  const historyList = q.statusHistory || [];

                  return (
                    <React.Fragment key={q.id}>
                      {/* MAIN VEHICLE ROW */}
                      <tr style={{ borderBottom: 'none', background: idx % 2 === 0 ? 'rgba(6, 182, 212, 0.04)' : 'transparent' }}>
                        
                        {/* Kode Booking */}
                        <td style={{ padding: '1rem 0.75rem 0.4rem 0.75rem' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'Rajdhani', display: 'block' }}>{q.id}</span>
                        </td>

                        {/* Plat & Mobil */}
                        <td style={{ padding: '1rem 0.75rem 0.4rem 0.75rem' }}>
                          <strong style={{ color: '#fbbf24', fontSize: '1.05rem', fontFamily: 'Rajdhani', display: 'block' }}>{q.licensePlate}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{q.carModel}</span>
                        </td>

                        {/* Pelanggan */}
                        <td style={{ padding: '1rem 0.75rem 0.4rem 0.75rem' }}>
                          <div style={{ color: '#fff', fontWeight: 600 }}>{q.customerName}</div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{q.phone}</span>
                        </td>

                        {/* Sparepart Pengganti & Harga */}
                        <td style={{ padding: '1rem 0.75rem 0.4rem 0.75rem', maxWidth: '260px' }}>
                          {partsCount > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px' }}>
                              {q.parts.map((p) => (
                                <div key={p.id} style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#a7f3d0', padding: '2px 6px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>📦 {p.name}</span>
                                  <strong>{formatCurrency(p.price)}</strong>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', display: 'block', marginBottom: '4px' }}>
                              Belum ada penggantian part
                            </span>
                          )}

                          <button 
                            onClick={() => setSelectedPartQueue(q)}
                            className="btn-cyan btn-sm"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                          >
                            <Package size={12} /> {partsCount > 0 ? `Edit Part (${partsCount})` : '+ Ganti Part & Biaya'}
                          </button>
                        </td>

                        {/* STATUS PEKERJAAN (DROPDOWN + ISIAN MANUAL) */}
                        <td style={{ padding: '1rem 0.75rem 0.4rem 0.75rem', minWidth: '220px' }}>
                          <select 
                            className="form-control"
                            value={q.status}
                            onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', background: '#090d16', color: statusObj.color, border: `2px solid ${statusObj.color}`, fontWeight: 700, marginBottom: isCustomStatus ? '6px' : 0 }}
                          >
                            {Object.keys(STATUS_MAP).map(k => (
                              <option key={k} value={k}>{STATUS_MAP[k].label}</option>
                            ))}
                          </select>

                          {/* DISPLAY CUSTOM STATUS TEXT IF MANUAL */}
                          {isCustomStatus && (
                            <div style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1px solid #ec4899', borderRadius: '6px', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#f472b6', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                "{q.customStatusText || 'Isian manual status...'}"
                              </span>
                              <button 
                                onClick={() => {
                                  setSelectedCustomStatusQueue(q);
                                  setCustomStatusInput(q.customStatusText || '');
                                }}
                                style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer', padding: '2px' }}
                                title="Edit Teks Status Custom"
                              >
                                <Edit size={12} />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Total Biaya Final */}
                        <td style={{ padding: '1rem 0.75rem 0.4rem 0.75rem', textAlign: 'right' }}>
                          <strong style={{ color: '#10b981', fontSize: '1.1rem', fontFamily: 'Rajdhani' }}>
                            {formatCurrency(q.estimatedCost)}
                          </strong>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem 0.75rem 0.4rem 0.75rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', alignItems: 'center' }}>
                            <button onClick={() => sendWhatsAppProgressMessage(q)} title="Kirim Update Progress ke WhatsApp" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 700 }}>
                              📱 WA
                            </button>
                            <button onClick={() => handleCallCustomer(q)} title="Panggil Antrian Voice" style={{ background: 'rgba(245, 158, 11, 0.2)', border: 'none', color: '#fbbf24', borderRadius: '6px', padding: '7px', cursor: 'pointer' }}>
                              <Volume2 size={15} />
                            </button>
                            <button onClick={() => onOpenSPK(q)} title="Cetak SPK / Invoice" style={{ background: 'rgba(6, 182, 212, 0.2)', border: 'none', color: '#38bdf8', borderRadius: '6px', padding: '7px', cursor: 'pointer' }}>
                              <Printer size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* OTOMATIS SUB-BARIS RIWAYAT STATUS & TANGGAL */}
                      <tr style={{ background: idx % 2 === 0 ? 'rgba(6, 182, 212, 0.04)' : 'transparent', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <td colSpan="7" style={{ padding: '0.2rem 0.75rem 1rem 1.5rem' }}>
                          <div style={{ background: 'rgba(9, 13, 22, 0.75)', borderLeft: '3px solid #06b6d4', borderRadius: '6px', padding: '0.6rem 0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                              <Clock size={13} /> RIWAYAT OTOMATIS TANGGAL & STATUS:
                            </div>

                            {historyList.length === 0 ? (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                ⏱️ Status Aktif: <strong style={{ color: '#fff' }}>{statusObj.label}</strong> (Terdaftar pada {q.updatedAt ? new Date(q.updatedAt).toLocaleString('id-ID') : 'Hari ini'})
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                {historyList.map((hist, hIdx) => (
                                  <div key={hIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem' }}>
                                    <span style={{ color: '#fbbf24', fontWeight: 600, fontFamily: 'monospace', minWidth: '150px' }}>
                                      📅 {hist.timestamp}
                                    </span>
                                    <span style={{ color: '#94a3b8' }}>➔ Status Dirubah Ke:</span>
                                    <span style={{ color: '#fff', fontWeight: 700, background: 'rgba(255, 255, 255, 0.08)', padding: '1px 6px', borderRadius: '4px' }}>
                                      {hist.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* HP / MOBILE VIEW MODE (COMPACT ESSENTIAL CARDS) */}
        <div className="view-hp-only">
          {filterListBySearch(activeWorkQueues).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
              Tidak ada mobil yang sedang dikerjakan saat ini.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filterListBySearch(activeWorkQueues).map((q) => {
                const isCustomStatus = q.status === 'CUSTOM';
                const statusObj = STATUS_MAP[q.status] || STATUS_MAP.PENGERJAAN;
                const partsCount = (q.parts || []).length;
                const historyList = q.statusHistory || [];

                return (
                  <div key={q.id} className="glass-card" style={{ padding: '1rem', borderLeft: `4px solid ${statusObj.color}` }}>
                    {/* Top Bar: License & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ color: '#fbbf24', fontSize: '1.15rem', fontFamily: 'Rajdhani', display: 'block' }}>
                          {q.licensePlate}
                        </strong>
                        <span style={{ fontSize: '0.825rem', color: '#e2e8f0', fontWeight: 600 }}>
                          {q.carModel} • {q.customerName}
                        </span>
                      </div>
                      <span className={`badge ${statusObj.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                        {isCustomStatus ? `📝 ${q.customStatusText || 'Custom'}` : statusObj.label}
                      </span>
                    </div>

                    {/* Sub-row History Compact */}
                    {historyList.length > 0 && (
                      <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '0.5rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.65rem' }}>
                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>📅 Status Terakhir:</span>
                        <div style={{ color: '#fff', fontSize: '0.73rem', marginTop: '2px' }}>
                          {historyList[historyList.length - 1].dateStr} — <strong style={{ color: '#fbbf24' }}>{historyList[historyList.length - 1].statusText}</strong>
                        </div>
                      </div>
                    )}

                    {/* Status Dropdown */}
                    <div style={{ marginBottom: '0.65rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Update Status Pekerjaan:</label>
                      <select 
                        className="form-control"
                        value={q.status}
                        onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', background: '#090d16', color: statusObj.color, border: `1.5px solid ${statusObj.color}`, fontWeight: 700 }}
                      >
                        {Object.keys(STATUS_MAP).map(k => (
                          <option key={k} value={k}>{STATUS_MAP[k].label}</option>
                        ))}
                      </select>

                      {isCustomStatus && (
                        <div style={{ marginTop: '4px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid #ec4899', borderRadius: '6px', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#f472b6', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            "{q.customStatusText || 'Isian manual status...'}"
                          </span>
                          <button 
                            onClick={() => {
                              setSelectedCustomStatusQueue(q);
                              setCustomStatusInput(q.customStatusText || '');
                            }}
                            style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer', padding: '2px' }}
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Total Biaya & Sparepart button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.65rem', borderRadius: '6px' }}>
                      <button 
                        onClick={() => setSelectedPartQueue(q)}
                        className="btn-cyan btn-sm"
                        style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                      >
                        <Package size={12} /> {partsCount > 0 ? `Part (${partsCount})` : '+ Biaya Part'}
                      </button>
                      <strong style={{ color: '#10b981', fontSize: '1.05rem', fontFamily: 'Rajdhani' }}>
                        {formatCurrency(calculateQueueTotalCost(q))}
                      </strong>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => sendWhatsAppProgressMessage(q)} className="btn-cyan btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }}>📱 WA</button>
                      <button onClick={() => handleCallCustomer(q)} className="btn-secondary btn-sm" style={{ padding: '6px' }} title="Panggil Antrian Voice"><Volume2 size={14} /></button>
                      <button onClick={() => onOpenSPK(q)} className="btn-secondary btn-sm" style={{ padding: '6px' }} title="SPK / Invoice"><Printer size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    )}

      {/* SECTION 3: DAFTAR MOBIL SELESAI & LAPORAN KEUANGAN */}
      {activeAdminTab === 'financial_report' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          
          {/* Header Summary Laporan */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ color: '#34d399', fontSize: '1.25rem', margin: 0, fontFamily: 'Rajdhani', fontWeight: 800 }}>
                💰 TABEL 3: LAPORAN KEUANGAN & DAFTAR MOBIL SELESAI
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Daftar transaksi perbaikan mobil yang telah selesai dikerjakan beserta rincian penggantian sparepart & total omzet pendapatan workshop.
              </p>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '0.75rem 1.25rem', borderRadius: '10px', textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>TOTAL OMZET REALISASI (SELESAI)</span>
              <strong style={{ fontSize: '1.5rem', color: '#10b981', fontFamily: 'Rajdhani' }}>{formatCurrency(totalCompletedRevenue)}</strong>
            </div>
          </div>

          {/* PC / DESKTOP VIEW MODE */}
          <div className="view-pc-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 0.75rem' }}>Kode Booking</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Plat & Mobil</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Pelanggan</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Layanan & Sparepart Pengganti</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Tanggal Selesai</th>
                  <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Total Pembayaran (Rp)</th>
                  <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>Cetak Nota</th>
                </tr>
              </thead>
              <tbody>
                {filterListBySearch(completedQueues).length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      Belum ada mobil yang ditandai Selesai. Ubah status mobil di Tabel 2 ke "Selesai / Siap Diambil".
                    </td>
                  </tr>
                ) : (
                  filterListBySearch(completedQueues).map((q, idx) => (
                    <tr key={q.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: idx % 2 === 0 ? 'rgba(16, 185, 129, 0.03)' : 'transparent' }}>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', fontFamily: 'Rajdhani', display: 'block' }}>{q.id}</span>
                      </td>

                      <td style={{ padding: '1rem 0.75rem' }}>
                        <strong style={{ color: '#fbbf24', fontSize: '1rem', fontFamily: 'Rajdhani', display: 'block' }}>{q.licensePlate}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{q.carModel}</span>
                      </td>

                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{q.customerName}</div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{q.phone}</span>
                      </td>

                      <td style={{ padding: '1rem 0.75rem', maxWidth: '280px' }}>
                        {q.customManualText && (
                          <div style={{ color: '#38bdf8', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '4px' }}>
                            "📝 {q.customManualText}"
                          </div>
                        )}
                        
                        {/* List Services */}
                        {q.services && (
                          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
                            🛠️ {q.services.join(', ')}
                          </div>
                        )}

                        {/* List Parts */}
                        {q.parts && q.parts.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {q.parts.map(p => (
                              <span key={p.id} style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>
                                📦 {p.name} ({formatCurrency(p.price)})
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem 0.75rem' }}>
                        <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>{q.endDate || q.bookingDate}</span>
                      </td>

                      <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                        <strong style={{ color: '#34d399', fontSize: '1.1rem', fontFamily: 'Rajdhani' }}>
                          {formatCurrency(calculateQueueTotalCost(q))}
                        </strong>
                      </td>

                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button onClick={() => sendWhatsAppInvoiceMessage(q)} title="Kirim Nota / Invoice Lunas ke WhatsApp" className="btn-secondary btn-sm" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', fontWeight: 700 }}>
                            📱 WA Invoice
                          </button>
                          <button onClick={() => onOpenSPK(q)} title="Cetak Nota / Invoice PDF" className="btn-secondary btn-sm">
                            <Printer size={14} /> Cetak Nota
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* HP / MOBILE VIEW MODE (COMPACT ESSENTIAL CARDS) */}
          <div className="view-hp-only">
            {filterListBySearch(completedQueues).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                Belum ada mobil yang ditandai Selesai.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filterListBySearch(completedQueues).map((q) => (
                  <div key={q.id} className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ color: '#fbbf24', fontSize: '1.15rem', fontFamily: 'Rajdhani', display: 'block' }}>
                          {q.licensePlate}
                        </strong>
                        <span style={{ fontSize: '0.825rem', color: '#e2e8f0', fontWeight: 600 }}>
                          {q.carModel} • {q.customerName}
                        </span>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>SELESAI</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0 0.75rem 0', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>Omzet Selesai:</span>
                      <strong style={{ color: '#34d399', fontSize: '1.15rem', fontFamily: 'Rajdhani' }}>
                        {formatCurrency(calculateQueueTotalCost(q))}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => sendWhatsAppInvoiceMessage(q)} className="btn-cyan btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}>
                        📱 WA Invoice
                      </button>
                      <button onClick={() => onOpenSPK(q)} className="btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', background: '#10b981', borderColor: '#10b981' }}>
                        <Printer size={14} /> Cetak Nota
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* MASTER SETTINGS: KELOLA LAYANAN & HARGA */}
      {activeAdminTab === 'services' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ color: '#06b6d4', fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} /> {editingService ? 'Edit Layanan Kaki-Kaki' : 'Tambah Layanan Baru'}
            </h3>

            <form onSubmit={handleSaveService}>
              <div className="form-group">
                <label className="form-label">Nama Layanan *</label>
                <input type="text" className="form-control" placeholder="Contoh: Ganti Bearing Roda Depan Set" value={srvName} onChange={(e) => setSrvName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori Layanan</label>
                <select className="form-control" value={srvCategory} onChange={(e) => setSrvCategory(e.target.value)}>
                  <option value="Suspensi">Suspensi</option>
                  <option value="Kemudi & Ball Joint">Kemudi & Ball Joint</option>
                  <option value="Bushing & Arm">Bushing & Arm</option>
                  <option value="Presisi Wheel Alignment">Presisi Wheel Alignment</option>
                  <option value="Inspeksi & Diagnosa">Inspeksi & Diagnosa</option>
                  <option value="Custom Service">Custom Service</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Biaya / Harga (Rp) *</label>
                  <input type="number" className="form-control" placeholder="250000" value={srvPrice} onChange={(e) => setSrvPrice(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimasi Durasi</label>
                  <input type="text" className="form-control" placeholder="60 Menit" value={srvDuration} onChange={(e) => setSrvDuration(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Singkat Layanan</label>
                <textarea className="form-control" rows="3" placeholder="Penjelasan teknis pengerjaan..." value={srvDesc} onChange={(e) => setSrvDesc(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {editingService && (
                  <button type="button" className="btn-secondary" onClick={() => { setEditingService(null); setSrvName(''); setSrvPrice(0); setSrvDesc(''); }}>
                    Batal
                  </button>
                )}
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {editingService ? 'Simpan Perubahan' : 'Tambah Layanan'}
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '1.25rem' }}>
              Daftar Layanan & Harga Saat Ini ({services.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {services.map(srv => (
                <div key={srv.id} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{srv.category}</span>
                    <h4 style={{ color: '#f8fafc', fontSize: '0.95rem', margin: '0.25rem 0' }}>{srv.name}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>{srv.description || '-'}</p>
                    <div style={{ color: '#06b6d4', fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>
                      {srv.isManual ? '📝 ISIAN MANUAL (HARGA BY ADMIN)' : formatCurrency(srv.price)} • {srv.estimatedDuration}
                    </div>
                  </div>

                  {!srv.isManual && (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button 
                        onClick={() => {
                          setEditingService(srv);
                          setSrvName(srv.name);
                          setSrvCategory(srv.category);
                          setSrvPrice(srv.price);
                          setSrvDuration(srv.estimatedDuration);
                          setSrvDesc(srv.description || '');
                        }}
                        style={{ background: 'rgba(6, 182, 212, 0.2)', border: 'none', color: '#38bdf8', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteService(srv.id)}
                        style={{ background: 'rgba(244, 63, 94, 0.2)', border: 'none', color: '#f43f5e', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MASTER SETTINGS: KELOLA CEKLIS KELUHAN */}
      {activeAdminTab === 'symptoms' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
            <h3 style={{ color: '#38bdf8', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} /> Tambah Item Ceklis Keluhan Kaki-Kaki Baru
            </h3>

            <form onSubmit={handleAddSymptom} style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                type="text"
                className="form-control"
                placeholder="Contoh: Bunyi berdengung pada kecepatan 60 km/jam saat belok kanan"
                value={newSymptomText}
                onChange={(e) => setNewSymptomText(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <button type="submit" className="btn-primary">
                Tambah Ceklis
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '1.25rem' }}>
              Item Ceklis Keluhan Di Halaman Customer ({symptoms.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {symptoms.map((sym, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 500 }}>
                    {idx + 1}. {sym}
                  </span>
                  <button 
                    onClick={() => handleDeleteSymptom(idx)}
                    style={{ background: 'rgba(244, 63, 94, 0.2)', border: 'none', color: '#f43f5e', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                    title="Hapus Item Ceklis"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MASTER CMS: EDIT TEKS & HALAMAN CUSTOMER */}
      {activeAdminTab === 'cms' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Section 1: Hero & Branding Text Editor */}
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={20} /> Pengaturan Teks Hero & Branding Utama
            </h3>

            <form onSubmit={handleSaveCMS}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Tagline Badge Teks (Atas Title)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={cmsState.heroBadge}
                    onChange={(e) => setCmsState({ ...cmsState, heroBadge: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Nomor WhatsApp Konsultasi (Format: 628xxx)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={cmsState.whatsappNumber}
                    onChange={(e) => setCmsState({ ...cmsState, whatsappNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Judul Utama Hero (Headline)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={cmsState.heroHeadline}
                  onChange={(e) => setCmsState({ ...cmsState, heroHeadline: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Deskripsi / Sub-headline Hero</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  value={cmsState.heroSubheadline}
                  onChange={(e) => setCmsState({ ...cmsState, heroSubheadline: e.target.value })}
                  required
                />
              </div>

              <h4 style={{ color: '#06b6d4', fontSize: '1rem', marginBottom: '1rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                Informasi Jam Operasional, Lokasi & Garansi
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Jam Operasional (Senin - Sabtu)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={cmsState.operatingHours}
                    onChange={(e) => setCmsState({ ...cmsState, operatingHours: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Jam Operasional (Minggu / Libur)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={cmsState.operatingHoursSunday}
                    onChange={(e) => setCmsState({ ...cmsState, operatingHoursSunday: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Hotline Phone Booking</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={cmsState.hotlinePhone}
                    onChange={(e) => setCmsState({ ...cmsState, hotlinePhone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Teks Garansi Servis</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={cmsState.guaranteeText}
                    onChange={(e) => setCmsState({ ...cmsState, guaranteeText: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Alamat Lengkap Workshop (Footer)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={cmsState.address}
                  onChange={(e) => setCmsState({ ...cmsState, address: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ background: '#f59e0b', color: '#090d16', fontWeight: 800 }}>
                <Check size={18} /> Simpan Perubahan Teks & Konten Customer
              </button>
            </form>
          </div>

          {/* Section 2: Manage Testimonials */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#10b981', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} color="#10b981" /> Kelola Ulasan / Testimoni Pelanggan
            </h3>

            {/* Form Add New Testimonial */}
            <form onSubmit={handleAddTestimonial} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Nama Pelanggan & Mobil *</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Contoh: Bapak Hendra (Owner Pajero Sport)"
                    value={newTestiName}
                    onChange={(e) => setNewTestiName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Rating (Bintang)</label>
                  <select 
                    className="form-control"
                    value={newTestiRating}
                    onChange={(e) => setNewTestiRating(e.target.value)}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                    <option value="3">⭐⭐⭐ (3 Bintang)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Komentar / Isian Ulasan *</label>
                <textarea 
                  className="form-control"
                  rows="2"
                  placeholder="Tuliskan testimoni positif dari pelanggan..."
                  value={newTestiComment}
                  onChange={(e) => setNewTestiComment(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }}>
                <Plus size={16} /> Tambah Ulasan Baru
              </button>
            </form>

            {/* List Existing Testimonials */}
            <h4 style={{ color: '#f8fafc', fontSize: '1rem', marginBottom: '1rem' }}>
              Daftar Ulasan Tampil Di Halaman Customer ({testimonials.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {testimonials.map(t => (
                <div key={t.id} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{t.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>{'★'.repeat(t.rating)}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, fontStyle: 'italic' }}>
                      "{t.comment}"
                    </p>
                  </div>

                  <button 
                    onClick={() => handleDeleteTestimonial(t.id)}
                    style={{ background: 'rgba(244, 63, 94, 0.2)', border: 'none', color: '#f43f5e', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0 }}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* MODAL 1: EDIT / ISIAN MANUAL CUSTOM STATUS TEXT */}
      {selectedCustomStatusQueue && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: '#0f172a' }}>
            <h3 style={{ color: '#ec4899', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              📝 Isian Manual Status Pekerjaan
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Mobil: <strong style={{ color: '#fff' }}>{selectedCustomStatusQueue.licensePlate}</strong> ({selectedCustomStatusQueue.customerName})
            </p>

            <form onSubmit={handleSaveCustomStatus}>
              <div className="form-group">
                <label className="form-label">Tuliskan Status Khusus / Progress Pekerjaan *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Contoh: Inden Seal Kit Power Steering (3 Hari) / Bubut Disc Brake..."
                  value={customStatusInput}
                  onChange={(e) => setCustomStatusInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setSelectedCustomStatusQueue(null)}>Batal</button>
                <button type="submit" className="btn-primary" style={{ background: '#ec4899' }}>Simpan Status Custom</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INPUT SPAREPART PENGGANTI & HARGA PART */}
      {selectedPartQueue && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 210, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '2rem', background: '#0f172a' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#38bdf8', fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} /> Input Penggantian Sparepart
              </h3>
              <button onClick={() => setSelectedPartQueue(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Mobil: <strong style={{ color: '#fff' }}>{selectedPartQueue.licensePlate}</strong> - {selectedPartQueue.carModel} ({selectedPartQueue.customerName})
            </p>

            {/* Form Add New Part */}
            <form onSubmit={handleAddPartToQueue} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Nama Part / Sparepart *</label>
                  <input type="text" className="form-control" placeholder="Contoh: Ball Joint Depan 555" value={partNameInput} onChange={(e) => setPartNameInput(e.target.value)} required />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Harga Part (Rp) *</label>
                  <input type="number" className="form-control" placeholder="450000" value={partPriceInput} onChange={(e) => setPartPriceInput(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={16} /> Tambah Item Part Ke Tagihan
              </button>
            </form>

            {/* List Existing Parts */}
            <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: '0.75rem' }}>
              Daftar Sparepart Pengganti Terpasang ({ (selectedPartQueue.parts || []).length })
            </h4>

            {(!selectedPartQueue.parts || selectedPartQueue.parts.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                Belum ada item sparepart yang ditambahkan.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {selectedPartQueue.parts.map(p => (
                  <div key={p.id} style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block' }}>📦 {p.name}</strong>
                      <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>{formatCurrency(p.price)}</span>
                    </div>

                    <button 
                      onClick={() => handleDeletePartFromQueue(p.id)}
                      style={{ background: 'rgba(244, 63, 94, 0.2)', border: 'none', color: '#f43f5e', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Pembayaran Baru:</span>
              <strong style={{ color: '#10b981', fontSize: '1.3rem', fontFamily: 'Rajdhani' }}>
                {formatCurrency(calculateQueueTotalCost(selectedPartQueue))}
              </strong>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: ACC BOOKING & PRICE QUOTING */}
      {selectedACCQueue && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '2rem', background: '#0f172a' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              ACC, Set Penjadwalan & Harga Custom
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Mobil: <strong style={{ color: '#fff' }}>{selectedACCQueue.licensePlate}</strong> - {selectedACCQueue.carModel} ({selectedACCQueue.customerName})
            </p>

            <form onSubmit={handleACCBookingSubmit}>
              
              {selectedACCQueue.services.includes('custom_manual_service') && (
                <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ color: '#38bdf8', fontWeight: 700 }}>
                    📝 Isian Manual Permintaan Customer:
                  </label>
                  <p style={{ color: '#fff', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                    "{selectedACCQueue.customManualText}"
                  </p>

                  <label className="form-label" style={{ color: '#fbbf24' }}>
                    Cantumkan Biaya / Harga Layanan Custom Ini (Rp) *
                  </label>
                  <input 
                    type="number"
                    className="form-control"
                    placeholder="1500000"
                    value={accCustomPrice}
                    onChange={(e) => setAccCustomPrice(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tanggal Mulai Pengerjaan (Start Date) *</label>
                <input type="date" className="form-control" value={accStartDate} onChange={(e) => setAccStartDate(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Lama Pengerjaan di Bengkel (Dalam Jumlah Hari) *</label>
                <input type="number" min="1" max="14" className="form-control" value={accDurationDays} onChange={(e) => setAccDurationDays(e.target.value)} required />
              </div>

              {/* WhatsApp Notification Feature */}
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#34d399', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={sendWAOnACC} 
                    onChange={(e) => setSendWAOnACC(e.target.checked)} 
                    style={{ accentColor: '#10b981', width: '18px', height: '18px' }}
                  />
                  <span>📱 Otomatis Buka WhatsApp & Kirim Surat Konfirmasi ACC Ke Customer</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.35rem', marginLeft: '1.8rem' }}>
                  Sistem akan membuatkan pesan konfirmasi berisi Kode Booking, Tanggal Mulai, Est. Selesai & Total Biaya secara otomatis ke WhatsApp ({selectedACCQueue.phone}).
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setSelectedACCQueue(null)}>Batal</button>
                <button type="submit" className="btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }}>
                  <Check size={18} /> ACC & Kirim Konfirmasi WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Walk-in Customer Form */}
      {showAddWalkin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '2rem', background: '#0f172a' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '1.4rem', marginBottom: '1rem' }}>Pendaftaran Antrian Walk-In</h3>
            <form onSubmit={handleAddWalkinSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Pelanggan *</label>
                <input type="text" className="form-control" value={wName} onChange={(e) => setWName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">No. WhatsApp / HP</label>
                <input type="text" className="form-control" value={wPhone} onChange={(e) => setWPhone(e.target.value)} placeholder="08123456789" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Plat Nomor *</label>
                  <input type="text" className="form-control" value={wPlate} onChange={(e) => setWPlate(e.target.value.toUpperCase())} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Model Mobil *</label>
                  <input type="text" className="form-control" value={wCar} onChange={(e) => setWCar(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Layanan Utama</label>
                <select className="form-control" value={wService} onChange={(e) => setWService(e.target.value)}>
                  {services.map(srv => (
                    <option key={srv.id} value={srv.id}>{srv.name} ({srv.price === 0 ? 'FREE' : formatCurrency(srv.price)})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddWalkin(false)}>Batal</button>
                <button type="submit" className="btn-primary">Simpan & Panggil Antrian</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
