import React, { useState, useEffect } from 'react';
import CalendarView from './CalendarView';
import { 
  STATUS_MAP, generateBookingId,
  getStoredServices, saveServicesToStorage,
  getStoredSymptoms, saveSymptomsToStorage,
  getStoredProducts, saveProductsToStorage,
  getStoredSiteConfig,
  calculateWorkdayEndDate
} from '../utils/storage';
import { 
  getStoredTursoCredentials, saveTursoCredentials, 
  testTursoConnection, initTursoSchema, resetTursoClient 
} from '../utils/turso';
import { speakQueueCall } from '../utils/audio';
import { 
  ShieldCheck, Plus, Volume2, Printer, Trash2, CheckCircle2, Clock, 
  Calendar as CalendarIcon, Check, Settings, DollarSign, Wrench, Edit, 
  FileText, AlertCircle, PlusCircle, Search, Filter, TrendingUp, Package, X, History, Sliders, Star, Smartphone, Monitor, Database
} from 'lucide-react';

const WhatsAppIcon = ({ size = 15, color = '#25D366' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ color: color, display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function AdminDashboard({ 
  queues, 
  setQueues, 
  onOpenSPK, 
  siteConfig, 
  setSiteConfig, 
  testimonials = [], 
  setTestimonials 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  // Dynamic Services, Symptoms & Products state
  const [services, setServices] = useState(getStoredServices());
  const [symptoms, setSymptoms] = useState(getStoredSymptoms());
  const [products, setProducts] = useState(getStoredProducts());

  // Modal states for adding/editing services and products
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Form state for adding/editing services
  const [editingService, setEditingService] = useState(null);
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] = useState('Suspensi');
  const [srvPrice, setSrvPrice] = useState(250000);
  const [srvDuration, setSrvDuration] = useState('1 Hari');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvStage, setSrvStage] = useState(1);

  // Stage / Level configuration state
  const DEFAULT_STAGE_CONFIGS = {
    1: { label: 'Pemeriksaan / Ringan', duration: '1 Hari', color: '#10b981' },
    2: { label: 'Servis Standard', duration: '2 Hari', color: '#06b6d4' },
    3: { label: 'Servis Medium / Fitting', duration: '3 Hari', color: '#38bdf8' },
    4: { label: 'Heavy Service / Overhaul', duration: '4 Hari', color: '#f59e0b' },
    5: { label: 'Major Reconstruction', duration: '5 Hari', color: '#ef4444' }
  };

  const [maxStage, setMaxStage] = useState(() => parseInt(localStorage.getItem('FSTWORKS_MAX_STAGE') || '5', 10));
  
  const [stageConfigs, setStageConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('FSTWORKS_STAGE_CONFIG_V1');
      return saved ? JSON.parse(saved) : DEFAULT_STAGE_CONFIGS;
    } catch {
      return DEFAULT_STAGE_CONFIGS;
    }
  });

  const [showStageConfigModal, setShowStageConfigModal] = useState(false);
  const [tempMaxStage, setTempMaxStage] = useState(maxStage);
  const [tempStageConfigs, setTempStageConfigs] = useState(stageConfigs);

  const getStageInfo = (stageNum) => {
    const num = parseInt(stageNum, 10) || 1;
    const cfg = stageConfigs[num] || { label: `Stage ${num}`, duration: `${num} Hari`, color: '#a855f7' };
    return {
      label: `Stage ${num} (${cfg.label})`,
      duration: cfg.duration || `${num} Hari`,
      color: cfg.color || '#a855f7',
      bg: `${cfg.color || '#a855f7'}25`
    };
  };

  const handleSaveStageConfigs = (e) => {
    e.preventDefault();
    const newMax = parseInt(tempMaxStage, 10) || 5;
    setMaxStage(newMax);
    localStorage.setItem('FSTWORKS_MAX_STAGE', newMax.toString());
    setStageConfigs(tempStageConfigs);
    localStorage.setItem('FSTWORKS_STAGE_CONFIG_V1', JSON.stringify(tempStageConfigs));
    setShowStageConfigModal(false);
  };

  // Form state for adding/editing products
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodCode, setProdCode] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Suspensi');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(10);

  // Form state for adding new symptom
  const [newSymptomText, setNewSymptomText] = useState('');

  // Product CRUD Handlers
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map(p => p.id === editingProduct.id ? {
        ...p,
        code: prodCode || p.code,
        name: prodName.trim(),
        category: prodCategory,
        price: parseInt(prodPrice, 10) || 0,
        stock: parseInt(prodStock, 10) || 0
      } : p);
    } else {
      const newProd = {
        id: `prd_${Date.now()}`,
        code: prodCode.trim() || `PRD-00${products.length + 1}`,
        name: prodName.trim(),
        category: prodCategory,
        price: parseInt(prodPrice, 10) || 0,
        stock: parseInt(prodStock, 10) || 0
      };
      updatedProducts = [newProd, ...products];
    }

    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
    setShowAddProductModal(false);
    setEditingProduct(null);
    setProdCode(''); setProdName(''); setProdPrice(0); setProdStock(10);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Yakin ingin menghapus produk ini dari katalog?')) {
      const updated = products.filter(p => p.id !== productId);
      setProducts(updated);
      saveProductsToStorage(updated);
    }
  };

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

  // Manage Additional Service Mid-Progress Modal state
  const [selectedAddServiceQueue, setSelectedAddServiceQueue] = useState(null);
  const [addSrvName, setAddSrvName] = useState('');
  const [addSrvPrice, setAddSrvPrice] = useState(0);
  const [addSrvOption, setAddSrvOption] = useState('HARI_LAIN'); // 'HARI_LAIN' or 'TAMBAH_BIAYA'
  const [addSrvNewDate, setAddSrvNewDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [addSrvExtraFee, setAddSrvExtraFee] = useState(100000);
  const [addSrvNotes, setAddSrvNotes] = useState('');

  const resetAddServiceForm = () => {
    setAddSrvName('');
    setAddSrvPrice(0);
    setAddSrvOption('HARI_LAIN');
    setAddSrvNewDate(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
    setAddSrvExtraFee(100000);
    setAddSrvNotes('');
  };

  // Custom Status Text Modal / Editing
  const [selectedCustomStatusQueue, setSelectedCustomStatusQueue] = useState(null);
  const [customStatusInput, setCustomStatusInput] = useState('');

  // Row Detail Modal
  const [selectedRowDetail, setSelectedRowDetail] = useState(null);

  // Turso Database State
  const [showTursoModal, setShowTursoModal] = useState(false);
  const [tursoUrl, setTursoUrl] = useState(() => getStoredTursoCredentials().url);
  const [tursoToken, setTursoToken] = useState(() => getStoredTursoCredentials().authToken);
  const [tursoEnabled, setTursoEnabled] = useState(() => getStoredTursoCredentials().isEnabled);
  const [tursoStatus, setTursoStatus] = useState(null);

  const handleTestTurso = async () => {
    if (!tursoUrl) {
      setTursoStatus({ type: 'error', text: 'Silakan masukkan Turso Database URL terlebih dahulu.' });
      return;
    }
    setTursoStatus({ type: 'info', text: 'Menguji koneksi ke Turso DB...' });
    const res = await testTursoConnection(tursoUrl, tursoToken);
    if (res.success) {
      setTursoStatus({ type: 'success', text: '✅ ' + res.message });
    } else {
      setTursoStatus({ type: 'error', text: '❌ ' + res.message });
    }
  };

  const handleInitTursoSchema = async () => {
    saveTursoCredentials({ url: tursoUrl, authToken: tursoToken, isEnabled: true });
    resetTursoClient();
    setTursoStatus({ type: 'info', text: 'Membuat skema tabel di Turso DB...' });
    const ok = await initTursoSchema();
    if (ok) {
      setTursoStatus({ type: 'success', text: '✅ Skema tabel Turso (queues, services, products, site_config, holidays) berhasil dibuat!' });
    } else {
      setTursoStatus({ type: 'error', text: '❌ Gagal membuat skema tabel. Periksa URL dan Token.' });
    }
  };

  const handleSaveTursoSettings = (e) => {
    e.preventDefault();
    saveTursoCredentials({ url: tursoUrl, authToken: tursoToken, isEnabled: tursoEnabled });
    resetTursoClient();
    setTursoStatus({ type: 'success', text: '✅ Konfigurasi Turso berhasil disimpan!' });
    setTimeout(() => {
      setShowTursoModal(false);
    }, 1200);
  };

  // Grouped datasets
  const pendingACCQueues = queues.filter(q => !q.isApproved || q.status === 'BOOKING');
  const activeWorkQueues = queues.filter(q => q.isApproved && q.status !== 'SELESAI');
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
    const additionalServicesTotal = (queue.additionalServices || []).reduce((sum, s) => {
      const baseP = s.price || 0;
      const extraP = s.option === 'TAMBAH_BIAYA' ? (s.extraFee || 0) : 0;
      return sum + baseP + extraP;
    }, 0);
    return baseServicesTotal + customPrice + partsTotal + additionalServicesTotal;
  };

  // Calculate automatic duration based on service list
  const calculateAutoDurationFromServices = (queueServices) => {
    if (!queueServices || !Array.isArray(queueServices) || queueServices.length === 0) return 3;

    let maxDuration = 1;
    queueServices.forEach(sid => {
      const srv = services.find(s => s.id === sid);
      if (srv) {
        let days = srv.stage || 1;
        if (srv.estimatedDuration) {
          const match = srv.estimatedDuration.match(/(\d+)/);
          if (match) {
            days = parseInt(match[1], 10);
          }
        }
        if (days > maxDuration) {
          maxDuration = days;
        }
      }
    });

    return maxDuration;
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

  // Additional Service Mid-Progress Handlers
  const handleAddServiceToQueue = (e) => {
    e.preventDefault();
    if (!selectedAddServiceQueue || !addSrvName.trim()) return;

    const newAddSrv = {
      id: `add_srv_${Date.now()}`,
      name: addSrvName.trim(),
      price: parseInt(addSrvPrice, 10) || 0,
      option: addSrvOption, // 'HARI_LAIN' or 'TAMBAH_BIAYA'
      newDate: addSrvOption === 'HARI_LAIN' ? addSrvNewDate : null,
      extraFee: addSrvOption === 'TAMBAH_BIAYA' ? (parseInt(addSrvExtraFee, 10) || 0) : 0,
      notes: addSrvNotes.trim(),
      addedAt: getCurrentFormattedDateTime()
    };

    const existingAddSrvs = selectedAddServiceQueue.additionalServices || [];
    const updatedAddSrvs = [...existingAddSrvs, newAddSrv];

    const timestamp = getCurrentFormattedDateTime();
    const logText = addSrvOption === 'HARI_LAIN'
      ? `⚡ Layanan Tambahan: "${addSrvName.trim()}" (Pengerjaan Hari Lain: ${addSrvNewDate})`
      : `⚡ Layanan Tambahan: "${addSrvName.trim()}" (Selesai Hari Ini + Biaya Extra: ${formatCurrency(parseInt(addSrvExtraFee, 10) || 0)})`;

    const updatedHistoryItem = {
      status: selectedAddServiceQueue.status,
      label: logText,
      timestamp: timestamp
    };

    const updatedQueues = queues.map(q => {
      if (q.id === selectedAddServiceQueue.id) {
        const existingHistory = q.statusHistory || [];
        const updatedObj = { 
          ...q, 
          additionalServices: updatedAddSrvs,
          bookingDate: addSrvOption === 'HARI_LAIN' ? addSrvNewDate : q.bookingDate,
          statusHistory: [updatedHistoryItem, ...existingHistory]
        };
        updatedObj.estimatedCost = calculateQueueTotalCost(updatedObj);
        return updatedObj;
      }
      return q;
    });

    setQueues(updatedQueues);
    setSelectedAddServiceQueue(null);
    resetAddServiceForm();
  };

  const handleDeleteAdditionalService = (queueId, serviceId) => {
    const updatedQueues = queues.map(q => {
      if (q.id === queueId) {
        const updatedAddSrvs = (q.additionalServices || []).filter(s => s.id !== serviceId);
        const updatedObj = { ...q, additionalServices: updatedAddSrvs };
        updatedObj.estimatedCost = calculateQueueTotalCost(updatedObj);
        return updatedObj;
      }
      return q;
    });
    setQueues(updatedQueues);
    if (selectedRowDetail && selectedRowDetail.id === queueId) {
      setSelectedRowDetail(updatedQueues.find(q => q.id === queueId));
    }
  };

  // Service Management Handlers
  const handleSaveService = (e) => {
    e.preventDefault();
    if (!srvName.trim()) return;

    let updatedServices;
    if (editingService) {
      updatedServices = services.map(s => s.id === editingService.id ? {
        ...s,
        name: srvName.trim(),
        category: srvCategory,
        stage: parseInt(srvStage, 10) || 1,
        price: parseInt(srvPrice, 10) || 0,
        estimatedDuration: srvDuration.trim(),
        description: srvDesc.trim()
      } : s);
    } else {
      const newServiceObj = {
        id: `srv_${Date.now()}`,
        name: srvName.trim(),
        category: srvCategory,
        stage: parseInt(srvStage, 10) || 1,
        price: parseInt(srvPrice, 10) || 0,
        estimatedDuration: srvDuration.trim(),
        description: srvDesc.trim()
      };
      updatedServices = [...services, newServiceObj];
    }

    setServices(updatedServices);
    saveServicesToStorage(updatedServices);
    setShowAddServiceModal(false);
    setEditingService(null);
    setSrvName(''); setSrvPrice(250000); setSrvDesc(''); setSrvStage(1);
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

  const handlePrintFinancialRecap = () => {
    const list = filterListBySearch(completedQueues);
    const totalRev = list.reduce((sum, q) => sum + calculateQueueTotalCost(q), 0);
    const printDate = getCurrentFormattedDateTime();
    const siteCfg = getStoredSiteConfig();

    const rowsHtml = list.map((q, idx) => {
      const startDate = q.startDate || q.bookingDate || '-';
      const endDate = q.endDate || q.updatedAt?.slice(0, 10) || q.bookingDate || '-';
      const duration = `${q.durationDays || 1} Hari`;
      const costStr = formatCurrency(calculateQueueTotalCost(q));

      const servicesText = q.services && q.services.length > 0
        ? q.services.map(sid => {
            const sObj = services.find(s => s.id === sid);
            return sObj ? sObj.name : sid;
          }).join(', ')
        : '-';

      const partsText = q.parts && q.parts.length > 0
        ? q.parts.map(p => `${p.name} (${formatCurrency(p.price)})`).join(', ')
        : '-';

      return `
        <tr style="border-bottom: 1px solid #cbd5e1; font-size: 11px;">
          <td style="padding: 8px; text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="padding: 8px; font-weight: bold; color: #0f172a;">${q.licensePlate}<br/><span style="font-weight: normal; color: #475569;">${q.carModel}</span></td>
          <td style="padding: 8px;">${q.customerName}<br/><span style="color: #64748b;">${q.phone}</span></td>
          <td style="padding: 8px;">
            <div><strong>Layanan:</strong> ${servicesText}</div>
            ${q.customManualText ? `<div style="font-style: italic; color: #0284c7;">📝 ${q.customManualText}</div>` : ''}
            <div><strong>Sparepart:</strong> ${partsText}</div>
          </td>
          <td style="padding: 8px; text-align: center; white-space: nowrap;">
            <div>Masuk: <strong>${startDate}</strong></div>
            <div>Keluar: <strong>${endDate}</strong></div>
            <div style="font-weight: bold; color: #d97706;">Lama: ${duration}</div>
          </td>
          <td style="padding: 8px; text-align: right; font-weight: bold; color: #15803d;">
            ${costStr}
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>REKAP LAPORAN KEUANGAN WORKSHOP FSTWORKS</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #fff; color: #000; margin: 0; padding: 0; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
            .sub { font-size: 11px; color: #334155; margin: 3px 0 0; font-weight: 600; }
            .summary-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #0f172a; color: #ffffff; padding: 8px; font-size: 11px; text-transform: uppercase; border: 1px solid #0f172a; }
            td { border: 1px solid #cbd5e1; }
            .footer-sign { display: flex; justify-content: space-between; margin-top: 40px; page-break-inside: avoid; }
            .sign-box { text-align: center; width: 200px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">FSTWORKS SPECIALIST KAKI-KAKI</h1>
              <p class="sub">${siteCfg.address || 'Jl. Raya Utama Otomotif No. 88'}</p>
              <p class="sub">Kontak / Hotline: ${siteCfg.hotlinePhone || '0812-3456-7890'} | Email: admin@fstworks.id</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px; font-weight: 800; color: #059669;">REKAP LAPORAN KEUANGAN</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Tanggal Cetak: ${printDate}</div>
            </div>
          </div>

          <div class="summary-box">
            <div>
              <div style="font-size: 11px; color: #475569; font-weight: 700;">JUMLAH TRANSAKSI SELESAI</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a;">${list.length} Kendaraan</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #475569; font-weight: 700;">TOTAL OMZET REALISASI PENDAPATAN</div>
              <div style="font-size: 20px; font-weight: 900; color: #166534;">${formatCurrency(totalRev)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">No</th>
                <th style="width: 140px;">Kendaraan</th>
                <th style="width: 130px;">Pelanggan</th>
                <th>Rincian Layanan & Sparepart</th>
                <th style="width: 140px;">Waktu Pengerjaan</th>
                <th style="width: 110px; text-align: right;">Total (Rp)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colSpan="6" style="text-align:center; padding: 20px;">Tidak ada data laporan transaksi.</td></tr>'}
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="sign-box">
              <div>Dibuat Oleh,</div>
              <div style="height: 50px;"></div>
              <div style="font-weight: bold; text-decoration: underline;">Admin Service FSTWORKS</div>
            </div>
            <div class="sign-box">
              <div>Disetujui Oleh,</div>
              <div style="height: 50px;"></div>
              <div style="font-weight: bold; text-decoration: underline;">Head Workshop Manager</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 400);
    }
  };

  const handleACCBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedACCQueue) return;

    const endDateStr = calculateWorkdayEndDate(accStartDate, accDurationDays);

    const addedCustomPrice = parseInt(accCustomPrice, 10) || 0;
    const timestamp = getCurrentFormattedDateTime();

    const accHistoryItem = {
      status: 'MENUNGGU_PENGANTARAN',
      label: `Disetujui Admin (ACC) - Menunggu Pengantaran Mobil ke Workshop (Jadwal: ${accStartDate})`,
      timestamp: timestamp
    };

    const updatedQueueObj = {
      ...selectedACCQueue,
      startDate: accStartDate,
      durationDays: parseInt(accDurationDays, 10),
      endDate: endDateStr,
      isApproved: true,
      status: 'MENUNGGU_PENGANTARAN',
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
      <div style={{ maxWidth: '350px', margin: '15vh auto', padding: '1rem', textAlign: 'center' }}>
        <h2 style={{ color: '#f4f4f5', marginBottom: '1.5rem', fontWeight: 600, fontSize: '1.4rem' }}>Login Admin</h2>
        <input 
          type="password"
          className="form-control"
          placeholder="Masukkan PIN"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          style={{ textAlign: 'center', fontSize: '1.2rem', padding: '0.75rem', marginBottom: '1rem', background: '#121216', border: '1px solid #27272a', borderRadius: '8px' }}
        />
        <button 
          className="btn-primary" 
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '8px' }}
          onClick={() => {
            if (passcode === 'fst123' || passcode === '') {
              setIsAuthenticated(true);
            } else {
              alert('Passcode salah. Gunakan fst123');
            }
          }}
        >
          Masuk
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.25rem 0.85rem' }}>
      
      {/* Top Admin Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#f4f4f5', margin: 0, fontWeight: 700 }}>Admin Dashboard</h2>
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



      {/* Global Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

      {/* Main Admin Navigation Tabs */}
      <div style={{ marginBottom: '1.5rem', background: '#121216', padding: '0.5rem', borderRadius: '10px', border: '1px solid #27272a' }}>
        
        {/* Core Operations */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <button 
            className="btn-secondary"
            onClick={() => setActiveAdminTab('acc_pending')}
            style={Object.assign({ flex: 1, justifyContent: 'center' }, activeAdminTab === 'acc_pending' ? { background: '#f59e0b', color: '#090d16', fontWeight: 800, borderColor: '#f59e0b' } : {})}
          >
            <CalendarIcon size={16} /> ACC & Harga ({pendingACCQueues.length})
          </button>

          <button 
            className="btn-secondary"
            onClick={() => setActiveAdminTab('active_progress')}
            style={Object.assign({ flex: 1, justifyContent: 'center' }, activeAdminTab === 'active_progress' ? { background: '#06b6d4', color: '#090d16', fontWeight: 800, borderColor: '#06b6d4' } : {})}
          >
            <Wrench size={16} /> Pengerjaan ({activeWorkQueues.length})
          </button>

          <button 
            className="btn-secondary"
            onClick={() => setActiveAdminTab('financial_report')}
            style={Object.assign({ flex: 1, justifyContent: 'center' }, activeAdminTab === 'financial_report' ? { background: '#10b981', color: '#090d16', fontWeight: 800, borderColor: '#10b981' } : {})}
          >
            <TrendingUp size={16} /> Selesai & Laporan
          </button>
        </div>

        {/* Master Settings */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #27272a', paddingTop: '0.5rem' }}>
          <button 
            className="btn-secondary"
            onClick={() => setActiveAdminTab('services')}
            style={Object.assign({ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }, activeAdminTab === 'services' ? { background: '#3f3f46', color: '#fff', borderColor: '#3f3f46' } : {})}
          >
            <DollarSign size={14} /> Kelola Harga
          </button>

          <button 
            className="btn-secondary"
            onClick={() => setActiveAdminTab('products')}
            style={Object.assign({ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }, activeAdminTab === 'products' ? { background: '#38bdf8', color: '#090d16', fontWeight: 800, borderColor: '#38bdf8' } : {})}
          >
            <Package size={14} /> Daftar Produk
          </button>

          <button 
            className="btn-secondary"
            onClick={() => setActiveAdminTab('symptoms')}
            style={Object.assign({ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }, activeAdminTab === 'symptoms' ? { background: '#3f3f46', color: '#fff', borderColor: '#3f3f46' } : {})}
          >
            <FileText size={14} /> Kelola Ceklis
          </button>

          <button 
            className="btn-secondary"
            onClick={() => setActiveAdminTab('cms')}
            style={Object.assign({ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }, activeAdminTab === 'cms' ? { background: '#f59e0b', color: '#090d16', fontWeight: 800, borderColor: '#f59e0b' } : {})}
          >
            <Sliders size={14} /> Teks Web
          </button>

          <button 
            className="btn-secondary"
            onClick={() => setActiveAdminTab('calendar')}
            style={Object.assign({ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }, activeAdminTab === 'calendar' ? { background: '#f59e0b', color: '#090d16', fontWeight: 800, borderColor: '#f59e0b' } : {})}
          >
            <CalendarIcon size={14} /> Kalender & Libur
          </button>
        </div>
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
                              const autoDur = calculateAutoDurationFromServices(q.services);
                              setSelectedACCQueue(q);
                              setAccStartDate(q.bookingDate || new Date().toISOString().slice(0, 10));
                              setAccDurationDays(autoDur);
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
                          const autoDur = calculateAutoDurationFromServices(q.services);
                          setSelectedACCQueue(q);
                          setAccStartDate(q.bookingDate || new Date().toISOString().slice(0, 10));
                          setAccDurationDays(autoDur);
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
                🔧 TABEL 2: STATUS PEKERJAAN
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Pantau dan perbarui status pengerjaan serta penggunaan sparepart kendaraan.
              </p>
            </div>
          </div>

          {/* STANDARD HTML TABLE */}
          <div style={{ overflowX: 'auto', background: '#121216', border: '1px solid #27272a', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#18181b', borderBottom: '1px solid #27272a', color: '#a1a1aa' }}>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Kendaraan</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Pelanggan</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Part & Layanan</th>
                  <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Status Pekerjaan</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Total Biaya</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filterListBySearch(activeWorkQueues).length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      Tidak ada data mobil yang dikerjakan saat ini.
                    </td>
                  </tr>
                ) : (
                  filterListBySearch(activeWorkQueues).map((q, idx) => {
                    const isCustomStatus = q.status === 'CUSTOM';
                    const statusObj = STATUS_MAP[q.status] || STATUS_MAP.PENGERJAAN;
                    const partsCount = (q.parts || []).length;
                    const addSrvCount = (q.additionalServices || []).length;
                    const partsTotal = partsCount > 0 ? q.parts.reduce((sum, p) => sum + p.price, 0) : 0;
                    
                    // Gunakan fungsi dari file untuk menghitung grand total
                    const grandTotal = typeof calculateQueueTotalCost === 'function' ? calculateQueueTotalCost(q) : (q.estimatedCost || 0) + partsTotal;

                    return (
                      <tr 
                        key={q.id} 
                        style={{ borderBottom: '1px solid #27272a', background: idx % 2 === 0 ? '#121216' : '#0a0a0d', cursor: 'pointer' }}
                        onClick={() => setSelectedRowDetail(q)}
                        title="Klik untuk melihat detail pekerjaan dan riwayat status"
                      >

                        <td style={{ padding: '0.75rem 1rem' }}>
                          <strong style={{ color: '#fbbf24', display: 'block' }}>{q.licensePlate}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{q.carModel}</span>
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ color: '#fff', fontSize: '0.85rem' }}>{q.customerName}</div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{q.phone}</span>
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ marginBottom: '4px', fontSize: '0.75rem', color: (partsCount > 0 || addSrvCount > 0) ? '#10b981' : '#64748b' }}>
                            {partsCount > 0 ? `${partsCount} Part` : ''}
                            {partsCount > 0 && addSrvCount > 0 ? ' • ' : ''}
                            {addSrvCount > 0 ? `${addSrvCount} Extra` : ''}
                            {partsCount === 0 && addSrvCount === 0 ? '-' : ''}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedPartQueue(q); }} className="btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                              + Part
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedAddServiceQueue(q); resetAddServiceForm(); }} className="btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem', color: '#06b6d4', borderColor: '#06b6d4' }}>
                              + Layanan
                            </button>
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem 1rem' }}>
                          <select 
                            className="form-control"
                            value={q.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                            style={{ fontSize: '0.75rem', padding: '0.35rem', background: '#18181b', color: statusObj.color, border: `1px solid ${statusObj.color}`, fontWeight: 700, maxWidth: '160px' }}
                          >
                            {Object.keys(STATUS_MAP).map(k => (
                              <option key={k} value={k}>{STATUS_MAP[k].label}</option>
                            ))}
                          </select>
                          {isCustomStatus && (
                            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#f472b6', fontSize: '0.7rem', fontStyle: 'italic', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                "{q.customStatusText}"
                              </span>
                              <button onClick={(e) => { e.stopPropagation(); setSelectedCustomStatusQueue(q); setCustomStatusInput(q.customStatusText || ''); }} style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer' }}>
                                <Edit size={10} />
                              </button>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <strong style={{ color: '#10b981', fontSize: '0.9rem' }}>
                            {formatCurrency(grandTotal)}
                          </strong>
                        </td>

                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button onClick={(e) => { e.stopPropagation(); sendWhatsAppProgressMessage(q); }} title="WA" style={{ background: 'rgba(16, 185, 129, 0.2)', border: 'none', color: '#34d399', borderRadius: '4px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <WhatsAppIcon size={14} color="#34d399" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onOpenSPK(q); }} title="SPK" style={{ background: 'rgba(6, 182, 212, 0.2)', border: 'none', color: '#38bdf8', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}><Printer size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

      </div>
    )}

      {/* SECTION 3: DAFTAR MOBIL SELESAI & LAPORAN KEUANGAN */}
      {activeAdminTab === 'financial_report' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          
          {/* Header Summary Laporan */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem', gap: '1rem' }}>
            <div>
              <h3 style={{ color: '#34d399', fontSize: '1.25rem', margin: 0, fontFamily: 'Rajdhani', fontWeight: 800 }}>
                💰 TABEL 3: LAPORAN KEUANGAN & DAFTAR MOBIL SELESAI
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Daftar transaksi perbaikan mobil yang telah selesai dikerjakan beserta rincian penggantian sparepart & total omzet pendapatan workshop.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={handlePrintFinancialRecap}
                className="btn-primary"
                style={{ background: '#10b981', color: '#090d16', fontWeight: 800, padding: '0.65rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Printer size={16} /> 🖨️ Cetak Rekap Laporan
              </button>

              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '0.75rem 1.25rem', borderRadius: '10px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>TOTAL OMZET REALISASI (SELESAI)</span>
                <strong style={{ fontSize: '1.5rem', color: '#10b981', fontFamily: 'Rajdhani' }}>{formatCurrency(totalCompletedRevenue)}</strong>
              </div>
            </div>
          </div>

          {/* PC / DESKTOP VIEW MODE */}
          <div className="view-pc-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem 0.75rem' }}>Plat & Mobil</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Pelanggan</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Layanan & Sparepart Pengganti</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Waktu Pengerjaan (Masuk - Keluar)</th>
                  <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Total Pembayaran (Rp)</th>
                  <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>Cetak Nota</th>
                </tr>
              </thead>
              <tbody>
                {filterListBySearch(completedQueues).length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      Belum ada mobil yang ditandai Selesai. Ubah status mobil di Tabel 2 ke "Selesai / Siap Diambil".
                    </td>
                  </tr>
                ) : (
                  filterListBySearch(completedQueues).map((q, idx) => {
                    const startDateStr = q.startDate || q.bookingDate || '-';
                    const endDateStr = q.endDate || q.updatedAt?.slice(0, 10) || q.bookingDate || '-';
                    const durationText = `${q.durationDays || 1} Hari`;

                    return (
                      <tr 
                        key={q.id} 
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: idx % 2 === 0 ? 'rgba(16, 185, 129, 0.03)' : 'transparent', cursor: 'pointer' }}
                        onClick={() => setSelectedRowDetail(q)}
                        title="Klik untuk melihat detail lengkap pengerjaan ini"
                      >
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
                          <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                            <div>Masuk: <strong style={{ color: '#fff' }}>{startDateStr}</strong></div>
                            <div>Keluar: <strong style={{ color: '#34d399' }}>{endDateStr}</strong></div>
                            <div style={{ color: '#fbbf24', fontWeight: 700, marginTop: '2px' }}>Lama: {durationText}</div>
                          </div>
                        </td>

                        <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                          <strong style={{ color: '#34d399', fontSize: '1.1rem', fontFamily: 'Rajdhani' }}>
                            {formatCurrency(calculateQueueTotalCost(q))}
                          </strong>
                        </td>

                        <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button onClick={(e) => { e.stopPropagation(); sendWhatsAppInvoiceMessage(q); }} title="Kirim Nota / Invoice Lunas ke WhatsApp" className="btn-secondary btn-sm" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', fontWeight: 700 }}>
                              📱 WA Invoice
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onOpenSPK(q); }} title="Cetak Nota / Invoice PDF" className="btn-secondary btn-sm">
                              <Printer size={14} /> Cetak Nota
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                {filterListBySearch(completedQueues).map((q) => {
                  const startDateStr = q.startDate || q.bookingDate || '-';
                  const endDateStr = q.endDate || q.updatedAt?.slice(0, 10) || q.bookingDate || '-';
                  const durationText = `${q.durationDays || 1} Hari`;

                  return (
                    <div 
                      key={q.id} 
                      className="glass-card" 
                      style={{ padding: '1rem', borderLeft: '4px solid #10b981', cursor: 'pointer' }}
                      onClick={() => setSelectedRowDetail(q)}
                    >
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

                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                        <div>Masuk: <strong style={{ color: '#fff' }}>{startDateStr}</strong> | Keluar: <strong style={{ color: '#34d399' }}>{endDateStr}</strong></div>
                        <div style={{ color: '#fbbf24', fontWeight: 700, marginTop: '2px' }}>Lama Pengerjaan: {durationText}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0 0.75rem 0', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>Omzet Selesai:</span>
                        <strong style={{ color: '#34d399', fontSize: '1.15rem', fontFamily: 'Rajdhani' }}>
                          {formatCurrency(calculateQueueTotalCost(q))}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={(e) => { e.stopPropagation(); sendWhatsAppInvoiceMessage(q); }} className="btn-cyan btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}>
                          📱 WA Invoice
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onOpenSPK(q); }} className="btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', background: '#10b981', borderColor: '#10b981' }}>
                          <Printer size={14} /> Cetak Nota
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* MASTER SETTINGS: KELOLA LAYANAN & HARGA */}
      {activeAdminTab === 'services' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ color: '#06b6d4', fontSize: '1.25rem', margin: 0, fontFamily: 'Rajdhani', fontWeight: 800 }}>
                💲 KELOLA DAFTAR LAYANAN, STAGE & HARGA
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Atur level/stage pengerjaan, estimasi durasi, dan biaya layanan workshop.
              </p>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => {
                setEditingService(null);
                setSrvName('');
                setSrvCategory('Suspensi');
                setSrvStage(1);
                setSrvPrice(250000);
                setSrvDuration(getStageInfo(1).duration);
                setSrvDesc('');
                setShowAddServiceModal(true);
              }}
            >
              <Plus size={16} /> Tambah Layanan Baru
            </button>
          </div>

          {/* CONTROL BAR: PENGATURAN MAKSIMAL STAGE */}
          <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📊</span>
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.9rem', display: 'block' }}>Pengaturan Master Level / Stage Layanan:</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Atur batasan max stage, nama tingkatan, serta estimasi durasi pengerjaan bawaan per stage.</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setTempMaxStage(maxStage);
                setTempStageConfigs({ ...stageConfigs });
                setShowStageConfigModal(true);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', color: '#38bdf8', borderColor: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              ⚙️ Edit Durasi & Nama Stage
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: '#121216', border: '1px solid #27272a', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#18181b', borderBottom: '1px solid #27272a', color: '#a1a1aa' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Stage / Level</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Kategori</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Nama Layanan</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Estimasi Durasi</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Harga / Biaya</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {services.map((srv, idx) => {
                  const stageInfo = getStageInfo(srv.stage || 1);
                  return (
                    <tr key={srv.id} style={{ borderBottom: '1px solid #27272a', background: idx % 2 === 0 ? '#121216' : '#0a0a0d' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontWeight: 700, 
                          fontSize: '0.75rem', 
                          color: stageInfo.color, 
                          background: stageInfo.bg,
                          border: `1px solid ${stageInfo.color}`
                        }}>
                          ⚡ Stage {srv.stage || 1}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{srv.category}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong style={{ color: '#fff', display: 'block' }}>{srv.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{srv.description || '-'}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                          {stageInfo.duration || srv.estimatedDuration}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <strong style={{ color: '#10b981' }}>
                          {srv.isManual ? 'ISIAN MANUAL' : formatCurrency(srv.price)}
                        </strong>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {!srv.isManual && (
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button 
                              onClick={() => {
                                setEditingService(srv);
                                setSrvName(srv.name);
                                setSrvCategory(srv.category);
                                setSrvStage(srv.stage || 1);
                                setSrvPrice(srv.price);
                                setSrvDuration(srv.estimatedDuration);
                                setSrvDesc(srv.description || '');
                                setShowAddServiceModal(true);
                              }}
                              style={{ background: 'rgba(6, 182, 212, 0.2)', border: 'none', color: '#38bdf8', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}
                              title="Edit Layanan"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteService(srv.id)}
                              style={{ background: 'rgba(244, 63, 94, 0.2)', border: 'none', color: '#f43f5e', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}
                              title="Hapus Layanan"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MASTER SETTINGS: KATALOG PRODUK & SPAREPART */}
      {activeAdminTab === 'products' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ color: '#38bdf8', fontSize: '1.25rem', margin: 0, fontFamily: 'Rajdhani', fontWeight: 800 }}>
                📦 MASTER KATALOG SPAREPART & PRODUK
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Kelola daftar produk sparepart yang tersedia untuk pemilihan cepat saat pengerjaan.
              </p>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => {
                setEditingProduct(null);
                setProdCode(`PRD-00${products.length + 1}`);
                setProdName('');
                setProdCategory('Suspensi');
                setProdPrice(0);
                setProdStock(10);
                setShowAddProductModal(true);
              }}
            >
              <Plus size={16} /> Tambah Produk Baru
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: '#121216', border: '1px solid #27272a', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#f8fafc', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#18181b', borderBottom: '1px solid #27272a', color: '#a1a1aa' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Kode</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Nama Sparepart</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Kategori</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Stok</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Harga Satuan</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      Belum ada produk sparepart terdaftar.
                    </td>
                  </tr>
                ) : (
                  products.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #27272a', background: idx % 2 === 0 ? '#121216' : '#0a0a0d' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{p.code}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong style={{ color: '#fff' }}>{p.name}</strong>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{p.category}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                        {p.stock} pcs
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <strong style={{ color: '#10b981' }}>
                          {formatCurrency(p.price)}
                        </strong>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button 
                            onClick={() => {
                              setEditingProduct(p);
                              setProdCode(p.code);
                              setProdName(p.name);
                              setProdCategory(p.category);
                              setProdPrice(p.price);
                              setProdStock(p.stock);
                              setShowAddProductModal(true);
                            }}
                            style={{ background: 'rgba(6, 182, 212, 0.2)', border: 'none', color: '#38bdf8', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}
                            title="Edit Produk"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            style={{ background: 'rgba(244, 63, 94, 0.2)', border: 'none', color: '#f43f5e', borderRadius: '4px', padding: '6px', cursor: 'pointer' }}
                            title="Hapus Produk"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Alamat Lengkap Workshop (Footer)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={cmsState.address}
                  onChange={(e) => setCmsState({ ...cmsState, address: e.target.value })}
                  required
                />
              </div>

              {/* Bank Account Settings Box */}
              <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#38bdf8', fontSize: '0.95rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  💳 Rekening Bank Pembayaran (Ditampilkan Pada Nota & Struk)
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Nama Bank</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Contoh: BCA / Mandiri / BRI"
                      value={cmsState.bankName || ''}
                      onChange={(e) => setCmsState({ ...cmsState, bankName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Nomor Rekening</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Contoh: 8830-1928-37"
                      value={cmsState.bankAccount || ''}
                      onChange={(e) => setCmsState({ ...cmsState, bankAccount: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Atas Nama (Pemilik Rekening)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Contoh: FSTWORKS GARAGE OFFICIAL"
                      value={cmsState.bankHolder || ''}
                      onChange={(e) => setCmsState({ ...cmsState, bankHolder: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* PIN Keamanan Admin Box */}
              <div style={{ background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.25)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#ec4899', fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🔒 PIN Keamanan Admin & Login Portal
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>
                  Ubah PIN / Passcode rahasia untuk memproteksi akses masuk ke halaman Admin Workshop FSTWORKS.
                </p>
                
                <div style={{ maxWidth: '320px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>PIN Admin / Passcode Baru</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Masukkan PIN baru (Contoh: 1234 atau 8888)"
                    value={cmsState.adminPin || '1234'}
                    onChange={(e) => setCmsState({ ...cmsState, adminPin: e.target.value })}
                  />
                </div>
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

      {/* SECTION MASTER SETTINGS: KALENDER & PENGATURAN HARI LIBUR WORKSHOP */}
      {activeAdminTab === 'calendar' && (
        <div style={{ marginTop: '0.5rem' }}>
          <CalendarView queues={queues} isAdmin={true} />
        </div>
      )}

      {/* MODAL 1: EDIT / ISIAN MANUAL CUSTOM STATUS TEXT */}
      {selectedCustomStatusQueue && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0f172a' }}>
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0f172a' }}>
            
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
              
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                  Pilih Dari Katalog Sparepart (Opsional):
                </label>
                <select 
                  className="form-control"
                  style={{ fontSize: '0.8rem', background: '#121216' }}
                  onChange={(e) => {
                    const foundP = products.find(p => p.id === e.target.value);
                    if (foundP) {
                      setPartNameInput(foundP.name);
                      setPartPriceInput(foundP.price);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">-- Manual / Pilih dari Katalog Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} - {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
              </div>

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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0f172a' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tanggal Mulai Pengerjaan (Start Date) *</label>
                  <input type="date" className="form-control" value={accStartDate} onChange={(e) => setAccStartDate(e.target.value)} style={{ width: '100%', display: 'block', boxSizing: 'border-box' }} required />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Lama Pengerjaan di Bengkel (Hari) *</label>
                  <input type="number" min="1" max="14" className="form-control" value={accDurationDays} onChange={(e) => setAccDurationDays(e.target.value)} style={{ width: '100%', display: 'block', boxSizing: 'border-box' }} required />
                </div>
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0f172a' }}>
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

      {/* MODAL 2.5: TAMBAH LAYANAN DI TENGAH PENGERJAAN */}
      {selectedAddServiceQueue && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#06b6d4', fontSize: '1.25rem', margin: 0 }}>
                ⚡ Tambah Layanan Di Tengah Pengerjaan
              </h3>
              <button onClick={() => setSelectedAddServiceQueue(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid #27272a', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Kendaraan:</div>
              <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1rem' }}>
                {selectedAddServiceQueue.licensePlate} - {selectedAddServiceQueue.carModel}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Pelanggan: {selectedAddServiceQueue.customerName} ({selectedAddServiceQueue.phone})</div>
            </div>

            <form onSubmit={handleAddServiceToQueue}>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                  Pilih Layanan Dari Katalog:
                </label>
                <select 
                  className="form-control"
                  style={{ fontSize: '0.85rem', background: '#121216' }}
                  onChange={(e) => {
                    const foundS = services.find(s => s.id === e.target.value);
                    if (foundS) {
                      setAddSrvName(foundS.name);
                      setAddSrvPrice(foundS.price);
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">-- Manual / Pilih dari Katalog Layanan --</option>
                  {services.filter(s => !s.isManual).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatCurrency(s.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Nama Layanan Tambahan *</label>
                  <input type="text" className="form-control" placeholder="Contoh: Bubut Disc Brake Depan" value={addSrvName} onChange={(e) => setAddSrvName(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Biaya Layanan (Rp)</label>
                  <input type="number" className="form-control" placeholder="150000" value={addSrvPrice} onChange={(e) => setAddSrvPrice(e.target.value)} />
                </div>
              </div>

              {/* OPTION SELECTION: HARI LAIN VS TAMBAH BIAYA */}
              <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', display: 'block' }}>
                  ⚙️ Syarat & Metode Penanganan Waktu Pengerjaan:
                </label>

                {/* Option 1: Hari Lain */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="srvOption" 
                      value="HARI_LAIN" 
                      checked={addSrvOption === 'HARI_LAIN'}
                      onChange={() => setAddSrvOption('HARI_LAIN')}
                      style={{ accentColor: '#06b6d4', marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ color: addSrvOption === 'HARI_LAIN' ? '#38bdf8' : '#cbd5e1', fontSize: '0.85rem' }}>
                        🗓️ Dikerjakan Di Hari Lain (Perpanjang Tanggal Selesai)
                      </strong>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '2px 0 0 0' }}>
                        Tidak ada biaya lembur extra. Estimasi tanggal pengerjaan/selesai mobil akan diundurkan.
                      </p>
                    </div>
                  </label>

                  {addSrvOption === 'HARI_LAIN' && (
                    <div style={{ marginTop: '0.5rem', marginLeft: '1.75rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Tanggal Estimasi Selesai Baru:</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={addSrvNewDate} 
                        onChange={(e) => setAddSrvNewDate(e.target.value)} 
                        required
                        style={{ maxWidth: '200px', fontSize: '0.8rem' }}
                      />
                    </div>
                  )}
                </div>

                {/* Option 2: Tambah Biaya */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="srvOption" 
                      value="TAMBAH_BIAYA" 
                      checked={addSrvOption === 'TAMBAH_BIAYA'}
                      onChange={() => setAddSrvOption('TAMBAH_BIAYA')}
                      style={{ accentColor: '#10b981', marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ color: addSrvOption === 'TAMBAH_BIAYA' ? '#10b981' : '#cbd5e1', fontSize: '0.85rem' }}>
                        ⚡ Selesai Hari Ini (Dengan Biaya Extra / Lembur)
                      </strong>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '2px 0 0 0' }}>
                        Pengerjaan dikejar selesai hari ini dengan menambahkan surcharge biaya extra ke total tagihan.
                      </p>
                    </div>
                  </label>

                  {addSrvOption === 'TAMBAH_BIAYA' && (
                    <div style={{ marginTop: '0.5rem', marginLeft: '1.75rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Nominal Biaya Extra (Rp):</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="100000"
                        value={addSrvExtraFee} 
                        onChange={(e) => setAddSrvExtraFee(e.target.value)} 
                        required
                        style={{ maxWidth: '200px', fontSize: '0.8rem' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Catatan Tambahan (Opsional)</label>
                <input type="text" className="form-control" placeholder="Contoh: Disetujui pak customer via WhatsApp" value={addSrvNotes} onChange={(e) => setAddSrvNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setSelectedAddServiceQueue(null)} style={{ flex: 1, justifyContent: 'center' }}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  <Plus size={16} /> Simpan Layanan Tambahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Row Detail */}
      {selectedRowDetail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <h3 style={{ color: '#38bdf8', fontSize: '1.3rem', margin: 0 }}>
                Detail Pekerjaan: {selectedRowDetail.id}
              </h3>
              <button onClick={() => setSelectedRowDetail(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pelanggan</label>
                <div style={{ color: '#fff', fontWeight: 600 }}>{selectedRowDetail.customerName}</div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{selectedRowDetail.phone}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Kendaraan</label>
                <div style={{ color: '#fbbf24', fontWeight: 700 }}>{selectedRowDetail.licensePlate}</div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{selectedRowDetail.carModel}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#34d399', marginBottom: '0.5rem', borderBottom: '1px solid rgba(16,185,129,0.3)', paddingBottom: '0.25rem' }}>Riwayat Status</h4>
              {(!selectedRowDetail.statusHistory || selectedRowDetail.statusHistory.length === 0) ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Belum ada perubahan status terdaftar.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedRowDetail.statusHistory.map((hist, hIdx) => (
                    <div key={hIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{hist.timestamp}</span>
                      <span style={{ color: '#fff', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>{hist.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DAFTAR LAYANAN TAMBAHAN DI TENGAH PENGERJAAN */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#06b6d4', marginBottom: '0.5rem', borderBottom: '1px solid rgba(6,182,212,0.3)', paddingBottom: '0.25rem' }}>
                Layanan Tambahan (Di Tengah Pengerjaan)
              </h4>
              {(!selectedRowDetail.additionalServices || selectedRowDetail.additionalServices.length === 0) ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Belum ada layanan tambahan di luar paket dasar.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedRowDetail.additionalServices.map((s, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                      <div>
                        <strong style={{ color: '#fff', display: 'block' }}>⚡ {s.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: s.option === 'HARI_LAIN' ? '#38bdf8' : '#10b981' }}>
                          {s.option === 'HARI_LAIN' ? `🗓️ Dikerjakan Hari Lain (${s.newDate})` : `⚡ Selesai Hari Ini (Biaya Extra: ${formatCurrency(s.extraFee)})`}
                        </span>
                        {s.notes && <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>"{s.notes}"</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency((s.price || 0) + (s.option === 'TAMBAH_BIAYA' ? (s.extraFee || 0) : 0))}</span>
                        <button 
                          onClick={() => handleDeleteAdditionalService(selectedRowDetail.id, s.id)}
                          style={{ background: 'rgba(244,63,94,0.2)', border: 'none', color: '#f43f5e', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#10b981', marginBottom: '0.5rem', borderBottom: '1px solid rgba(16,185,129,0.3)', paddingBottom: '0.25rem' }}>Daftar Sparepart Pengganti</h4>
              {(!selectedRowDetail.parts || selectedRowDetail.parts.length === 0) ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Belum ada sparepart.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedRowDetail.parts.map((p, pIdx) => (
                    <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: 'rgba(16,185,129,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                      <span style={{ color: '#fff' }}>📦 {p.name}</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency(p.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Biaya Akhir:</span>
              <strong style={{ color: '#10b981', fontSize: '1.4rem', fontFamily: 'Rajdhani' }}>
                {formatCurrency(calculateQueueTotalCost(selectedRowDetail))}
              </strong>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setSelectedRowDetail(null)}>Tutup Detail</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TAMBAH / EDIT LAYANAN (SERVICES) */}
      {showAddServiceModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#06b6d4', fontSize: '1.25rem', margin: 0 }}>
                {editingService ? '✏️ Edit Layanan Workshop' : '➕ Tambah Layanan Baru'}
              </h3>
              <button onClick={() => setShowAddServiceModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService}>
              <div className="form-group">
                <label className="form-label">Nama Layanan *</label>
                <input type="text" className="form-control" placeholder="Contoh: Ganti Bearing Roda Depan Set" value={srvName} onChange={(e) => setSrvName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                <div className="form-group">
                  <label className="form-label" style={{ color: '#06b6d4', fontWeight: 700 }}>
                    ⚡ Level / Stage (Max {maxStage})
                  </label>
                  <select 
                    className="form-control" 
                    value={srvStage} 
                    onChange={(e) => {
                      const selectedStg = parseInt(e.target.value, 10);
                      setSrvStage(selectedStg);
                      // Auto suggest recommended duration for selected stage
                      const info = getStageInfo(selectedStg);
                      if (info && info.duration) {
                        setSrvDuration(info.duration);
                      }
                    }}
                    style={{ borderColor: '#06b6d4', fontWeight: 700, background: '#121216' }}
                  >
                    {Array.from({ length: maxStage }, (_, i) => i + 1).map(stgNum => (
                      <option key={stgNum} value={stgNum}>
                        Stage {stgNum} - ({getStageInfo(stgNum).duration})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Biaya / Harga (Rp) *</label>
                  <input type="number" className="form-control" placeholder="250000" value={srvPrice} onChange={(e) => setSrvPrice(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimasi Durasi (Hari)</label>
                  <input type="text" className="form-control" placeholder="1 Hari" value={srvDuration} onChange={(e) => setSrvDuration(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Singkat Layanan</label>
                <textarea className="form-control" rows="3" placeholder="Penjelasan teknis pengerjaan..." value={srvDesc} onChange={(e) => setSrvDesc(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddServiceModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {editingService ? 'Simpan Perubahan' : 'Tambah Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5.5: EDIT PENGATURAN MASTER STAGE */}
      {showStageConfigModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#06b6d4', fontSize: '1.25rem', margin: 0 }}>
                ⚙️ Pengaturan Master Level / Stage Layanan
              </h3>
              <button onClick={() => setShowStageConfigModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Sesuaikan batasan maksimal stage, nama tingkatan, estimasi durasi bawaan, dan warna badge per Stage.
            </p>

            <form onSubmit={handleSaveStageConfigs}>
              {/* MAX STAGE DROPDOWN INSIDE MODAL */}
              <div style={{ background: '#18181b', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #06b6d4', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ color: '#06b6d4', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                    📊 Batasan Maksimal Stage (Max Stage)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Tentukan batas level tertinggi yang tersedia di workshop.</span>
                </div>
                <select 
                  className="form-control" 
                  value={tempMaxStage}
                  onChange={(e) => setTempMaxStage(parseInt(e.target.value, 10))}
                  style={{ width: '120px', fontSize: '0.85rem', background: '#09090b', color: '#38bdf8', fontWeight: 700, borderColor: '#06b6d4' }}
                >
                  <option value={3}>3 Stage</option>
                  <option value={5}>5 Stage</option>
                  <option value={7}>7 Stage</option>
                  <option value={10}>10 Stage</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {Array.from({ length: tempMaxStage }, (_, i) => i + 1).map(stgNum => {
                  const currentStg = tempStageConfigs[stgNum] || { label: `Stage ${stgNum}`, duration: `${stgNum} Hari`, color: '#38bdf8' };
                  return (
                    <div key={stgNum} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <span style={{ fontWeight: 800, color: currentStg.color || '#38bdf8', fontSize: '0.9rem' }}>
                          ⚡ STAGE {stgNum}
                        </span>
                        <input 
                          type="color" 
                          value={currentStg.color || '#38bdf8'}
                          onChange={(e) => {
                            const newCol = e.target.value;
                            setTempStageConfigs(prev => ({
                              ...prev,
                              [stgNum]: { ...(prev[stgNum] || {}), color: newCol }
                            }));
                          }}
                          style={{ border: 'none', background: 'none', width: '28px', height: '24px', cursor: 'pointer' }}
                          title="Pilih Warna Badge Stage"
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Nama/Label Stage</label>
                          <input 
                            type="text" 
                            className="form-control"
                            style={{ fontSize: '0.8rem' }}
                            value={currentStg.label || ''} 
                            placeholder={`Contoh: Servis Level ${stgNum}`}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempStageConfigs(prev => ({
                                ...prev,
                                [stgNum]: { ...(prev[stgNum] || {}), label: val }
                              }));
                            }}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Estimasi Durasi Bawaan</label>
                          <input 
                            type="text" 
                            className="form-control"
                            style={{ fontSize: '0.8rem' }}
                            value={currentStg.duration || ''} 
                            placeholder="Contoh: 1 Hari / 60 Menit"
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempStageConfigs(prev => ({
                                ...prev,
                                [stgNum]: { ...(prev[stgNum] || {}), duration: val }
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowStageConfigModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Simpan Master Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: TAMBAH / EDIT PRODUK SPAREPART */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#38bdf8', fontSize: '1.25rem', margin: 0 }}>
                {editingProduct ? '✏️ Edit Produk Sparepart' : '📦 Tambah Sparepart Baru'}
              </h3>
              <button onClick={() => setShowAddProductModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Kode Produk</label>
                  <input type="text" className="form-control" placeholder="PRD-001" value={prodCode} onChange={(e) => setProdCode(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Sparepart *</label>
                  <input type="text" className="form-control" placeholder="Ball Joint Depan Fortuner" value={prodName} onChange={(e) => setProdName(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-control" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                  <option value="Suspensi">Suspensi</option>
                  <option value="Kemudi">Kemudi</option>
                  <option value="Bushing">Bushing</option>
                  <option value="Ball Joint">Ball Joint</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Harga Satuan (Rp) *</label>
                  <input type="number" className="form-control" placeholder="450000" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Jumlah Stok (Pcs)</label>
                  <input type="number" className="form-control" placeholder="10" value={prodStock} onChange={(e) => setProdStock(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddProductModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Ke Katalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
