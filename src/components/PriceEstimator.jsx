import React, { useState } from 'react';
import { INITIAL_SERVICES } from '../utils/storage';
import { Calculator, Check, Info, ChevronRight, Wrench, Shield, AlertTriangle, ArrowRight } from 'lucide-react';

export default function PriceEstimator({ onBookWithServices }) {
  const [carType, setCarType] = useState('suv'); // citycar, sedan, suv, luxury
  const [selectedItems, setSelectedItems] = useState(['free_inspection', 'spooring_balancing_3d']);

  const carTypeMultiplier = {
    citycar: 1.0,
    sedan: 1.0,
    suv: 1.15,
    luxury: 1.35
  };

  const handleToggleItem = (id) => {
    if (selectedItems.includes(id)) {
      if (selectedItems.length === 1) return;
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const mult = carTypeMultiplier[carType] || 1.0;

  const calculateSubtotal = () => {
    return selectedItems.reduce((acc, id) => {
      const s = INITIAL_SERVICES.find(srv => srv.id === id);
      return acc + Math.round((s ? s.price : 0) * mult);
    }, 0);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.35rem 1rem', borderRadius: '9999px', marginBottom: '0.75rem' }}>
          <Calculator size={16} color="#f59e0b" />
          <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>TRANSPARENT PRICING SIMULATOR</span>
        </div>
        <h2 style={{ fontSize: '2.2rem', color: '#f8fafc' }}>Kalkulator Estimasi Biaya Kaki-Kaki</h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
          Simulasikan estimasi perbaikan kaki-kaki mobil Anda secara transparan sebelum datang ke bengkel.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Car Category & Service Checklist */}
        <div>
          {/* Step 1: Select Car Category */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '1.1rem', marginBottom: '1rem' }}>1. Pilih Kategori / Ukuran Kendaraan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {[
                { id: 'citycar', label: 'City Car / Hatchback', desc: 'Brio, Yaris, Jazz, Agya' },
                { id: 'sedan', label: 'Sedan / MPV Compact', desc: 'Avanza, Xpander, Vios, Civic' },
                { id: 'suv', label: 'Medium SUV / MPV Big', desc: 'Fortuner, Pajero, CR-V, Innova' },
                { id: 'luxury', label: 'Luxury & Europe Car', desc: 'BMW, Mercedes, Audi, Alphard' }
              ].map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setCarType(cat.id)}
                  style={{
                    background: carType === cat.id ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: carType === cat.id ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>{cat.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cat.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Repairs */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#06b6d4', fontSize: '1.1rem', marginBottom: '1rem' }}>2. Pilih Item Perbaikan / Servis</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {INITIAL_SERVICES.map(srv => {
                const isSelected = selectedItems.includes(srv.id);
                const itemPrice = Math.round(srv.price * mult);

                return (
                  <div
                    key={srv.id}
                    onClick={() => handleToggleItem(srv.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                      border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ accentColor: '#06b6d4', width: '18px', height: '18px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{srv.name}</div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Est. Waktu: {srv.estimatedDuration}</span>
                      </div>
                    </div>

                    <strong style={{ color: itemPrice === 0 ? '#10b981' : '#fbbf24', fontSize: '0.95rem' }}>
                      {itemPrice === 0 ? 'FREE' : formatCurrency(itemPrice)}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Cost Breakdown & Booking CTA */}
        <div>
          <div className="glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
              Rincian Estimasi Biaya Perbaikan
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {selectedItems.map(id => {
                const srv = INITIAL_SERVICES.find(s => s.id === id);
                if (!srv) return null;
                const price = Math.round(srv.price * mult);

                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    <span>{srv.name}</span>
                    <strong style={{ color: price === 0 ? '#10b981' : '#f8fafc' }}>
                      {price === 0 ? 'FREE' : formatCurrency(price)}
                    </strong>
                  </div>
                );
              })}
            </div>

            {/* Total Display */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>TOTAL ESTIMASI BIAYA BENGKEL</span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'Rajdhani' }}>
                {calculateSubtotal() === 0 ? 'GRATIS / FREE' : formatCurrency(calculateSubtotal())}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>*Biaya pasti akan dipastikan kembali setelah diagnosa fisik langsung oleh mekanik.</span>
            </div>

            {/* Guarantees Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} color="#10b981" />
                <span>Garansi Part & Pengerjaan Hingga 1 Tahun</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={16} color="#06b6d4" />
                <span>Tanpa Biaya Tersembunyi (No Hidden Fees)</span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={onBookWithServices} 
              style={{ width: '100%', justifyContent: 'center', fontSize: '1.05rem', padding: '0.85rem' }}
            >
              Booking Antrian Dengan Rincian Ini <ArrowRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
