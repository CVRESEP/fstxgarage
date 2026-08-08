import React, { useState } from 'react';
import { getStoredServices } from '../utils/storage';
import { Calculator, Check, Info, Wrench, Shield, ArrowRight, ShoppingCart, Trash2, Plus, Minus, Printer, Store, CreditCard, Tag } from 'lucide-react';

export default function PriceEstimator({ onBookWithServices, services: customServices }) {
  const servicesList = customServices || [];
  const [carType, setCarType] = useState('suv'); // citycar, sedan, suv, luxury
  const [cartItems, setCartItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const carTypeMultiplier = {
    citycar: 1.0,
    sedan: 1.0,
    suv: 1.15,
    luxury: 1.35
  };

  const mult = carTypeMultiplier[carType] || 1.0;

  const categories = ['ALL', 'Inspeksi & Diagnosa', 'Presisi Wheel Alignment', 'Kemudi & Ball Joint', 'Suspensi', 'Bushing & Arm'];

  const filteredServices = activeCategory === 'ALL' 
    ? servicesList 
    : servicesList.filter(s => s.category.toLowerCase().includes(activeCategory.toLowerCase()));

  const handleAddToCart = (serviceId) => {
    const existing = cartItems.find(item => item.id === serviceId);
    if (existing) {
      setCartItems(cartItems.map(item => item.id === serviceId ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCartItems([...cartItems, { id: serviceId, qty: 1 }]);
    }
  };

  const handleRemoveFromCart = (serviceId) => {
    setCartItems(cartItems.filter(item => item.id !== serviceId));
  };

  const handleUpdateQty = (serviceId, delta) => {
    setCartItems(cartItems.map(item => {
      if (item.id === serviceId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const calculateTotalCost = () => {
    return cartItems.reduce((total, cartItem) => {
      const srv = servicesList.find(s => s.id === cartItem.id);
      if (!srv) return total;
      const unitPrice = Math.round(srv.price * mult);
      return total + (unitPrice * cartItem.qty);
    }, 0);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* POS Kasir Header Terminal Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
        border: '1px solid #27272a',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justify: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f59e0b', color: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#f4f4f5', margin: 0, fontFamily: 'Rajdhani', fontWeight: 800 }}>
                TERMINAL KASIR ESTIMASI BIAYA (POS WORKSHOP)
              </h2>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>● ONLINE</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
              No. Struk Simulasi: <strong style={{ color: '#f59e0b' }}>POS-FST-20260808-99</strong> • Operator: Customer Self-Service
            </span>
          </div>
        </div>

        {/* Car Category Quick Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#121216', padding: '0.35rem 0.65rem', borderRadius: '8px', border: '1px solid #27272a' }}>
          <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Tipe Mobil:</span>
          <select 
            value={carType} 
            onChange={(e) => setCarType(e.target.value)}
            style={{ background: '#09090b', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >
            <option value="citycar">City Car / Hatchback (1.0x)</option>
            <option value="sedan">Sedan / Compact MPV (1.0x)</option>
            <option value="suv">Medium SUV / Big MPV (1.15x)</option>
            <option value="luxury">Luxury / Europe Car (1.35x)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: TOUCHSCREEN POS CATALOGUE */}
        <div style={{ flex: 1 }}>
          
          {/* Category Tabs Header */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? '#f59e0b' : '#18181b',
                  color: activeCategory === cat ? '#090d16' : '#a1a1aa',
                  border: activeCategory === cat ? '1px solid #f59e0b' : '1px solid #27272a',
                  borderRadius: '6px',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* POS Touch Item Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {filteredServices.map(srv => {
              const unitPrice = Math.round(srv.price * mult);
              const inCart = cartItems.find(item => item.id === srv.id);

              return (
                <div
                  key={srv.id}
                  onClick={() => handleAddToCart(srv.id)}
                  style={{
                    background: inCart ? 'rgba(245, 158, 11, 0.12)' : '#121216',
                    border: inCart ? '2px solid #f59e0b' : '1px solid #27272a',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    minHeight: '130px',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <span className="badge badge-info" style={{ fontSize: '0.6rem', marginBottom: '0.35rem' }}>{srv.category}</span>
                    <h4 style={{ fontSize: '0.85rem', color: '#f4f4f5', margin: '2px 0 6px 0', lineHeight: 1.3, fontWeight: 700 }}>
                      {srv.name}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <strong style={{ color: unitPrice === 0 ? '#10b981' : '#fbbf24', fontSize: '0.95rem', fontFamily: 'Rajdhani' }}>
                      {unitPrice === 0 ? 'FREE' : formatCurrency(unitPrice)}
                    </strong>

                    <button 
                      style={{
                        background: inCart ? '#f59e0b' : '#27272a',
                        color: inCart ? '#090d16' : '#f4f4f5',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      {inCart ? `✓ (${inCart.qty})` : '+ Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: POS RECEIPT STRUK KASIR */}
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          
          <div className="glass-panel" style={{
            background: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
            border: '1px dashed #f59e0b',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 20px 30px -10px rgba(0,0,0,0.7)',
            position: 'relative'
          }}>
            
            {/* Struk Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #27272a', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ color: '#f59e0b', fontSize: '1.4rem', fontFamily: 'Rajdhani', margin: 0, fontWeight: 900, letterSpacing: '1px' }}>
                FSTWORKS GARAGE
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#a1a1aa', display: 'block', marginTop: '2px' }}>
                Undercarriage & Suspension Specialist
              </span>
              <div style={{ fontSize: '0.65rem', color: '#71717a', marginTop: '4px' }}>
                JL. RAYA OTOMOTIF NO. 88 • TELP: 0812-3456-7890
              </div>
            </div>

            {/* Receipt Table Items */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 700, borderBottom: '1px solid #27272a', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
                <span>ITEM LAYANAN</span>
                <span>QTY / HARGA</span>
              </div>

              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#71717a', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  🛒 Keranjang Kasir Kosong.<br />Pilih item di katalog untuk menambahkan.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                  {cartItems.map(item => {
                    const srv = servicesList.find(s => s.id === item.id);
                    if (!srv) return null;
                    const unitPrice = Math.round(srv.price * mult);
                    const itemTotal = unitPrice * item.qty;

                    return (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
                        <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                          <div style={{ color: '#f4f4f5', fontWeight: 600, fontSize: '0.8rem' }}>{srv.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>
                            {unitPrice === 0 ? 'FREE' : formatCurrency(unitPrice)} x {item.qty}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', background: '#09090b', border: '1px solid #27272a', borderRadius: '4px' }}>
                            <button onClick={() => handleUpdateQty(item.id, -1)} style={{ background: 'none', border: 'none', color: '#a1a1aa', padding: '2px 5px', cursor: 'pointer' }}><Minus size={11} /></button>
                            <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 700, padding: '0 4px' }}>{item.qty}</span>
                            <button onClick={() => handleUpdateQty(item.id, 1)} style={{ background: 'none', border: 'none', color: '#a1a1aa', padding: '2px 5px', cursor: 'pointer' }}><Plus size={11} /></button>
                          </div>

                          <strong style={{ color: itemTotal === 0 ? '#10b981' : '#f59e0b', fontSize: '0.85rem', fontFamily: 'Rajdhani', minWidth: '65px', textAlign: 'right' }}>
                            {itemTotal === 0 ? 'FREE' : formatCurrency(itemTotal)}
                          </strong>

                          <button onClick={() => handleRemoveFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calculations & LED Display */}
            <div style={{ borderTop: '2px dashed #27272a', paddingTop: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.35rem' }}>
                <span>Subtotal Item:</span>
                <span style={{ color: '#fff' }}>{formatCurrency(calculateTotalCost())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.85rem' }}>
                <span>Multiplier Tipe Mobil ({carType.toUpperCase()}):</span>
                <span style={{ color: '#38bdf8' }}>{mult}x</span>
              </div>

              {/* POS Cashier LED Total Box */}
              <div style={{
                background: '#090d16',
                border: '2px solid #10b981',
                borderRadius: '8px',
                padding: '0.85rem',
                textAlign: 'center',
                boxShadow: 'inset 0 0 10px rgba(16, 185, 129, 0.2)'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, letterSpacing: '1px', display: 'block' }}>
                  TOTAL ESTIMASI KASIR
                </span>
                <div style={{ fontSize: '2rem', color: '#10b981', fontWeight: 900, fontFamily: 'Rajdhani', lineHeight: 1.1, marginTop: '2px' }}>
                  {calculateTotalCost() === 0 ? 'GRATIS / FREE' : formatCurrency(calculateTotalCost())}
                </div>
              </div>
            </div>

            {/* CTA & Print Buttons (PDF / WA & Thermal) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                className="btn-primary"
                onClick={onBookWithServices}
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', background: '#f59e0b', borderColor: '#f59e0b', color: '#090d16', fontWeight: 800 }}
              >
                <CreditCard size={16} /> Lanjut Booking Dengan Struk Ini
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    const totalCostStr = calculateTotalCost() === 0 ? 'FREE' : formatCurrency(calculateTotalCost());
                    const itemListStr = cartItems.map(i => {
                      const s = INITIAL_SERVICES.find(srv => srv.id === i.id);
                      return `  • ${s ? s.name : i.id} x${i.qty}`;
                    }).join('\n');

                    const text = `*STRUK ESTIMASI KASIR - FSTWORKS GARAGE*\n\nTipe Mobil: ${carType.toUpperCase()}\n\nItem Layanan:\n${itemListStr}\n\n*TOTAL ESTIMASI:* *${totalCostStr}*\n\nSimpan nota ini untuk referensi saat datang ke workshop!`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  style={{ justifyContent: 'center', padding: '0.5rem 0.35rem', fontSize: '0.73rem', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700 }}
                >
                  📄 PDF / WA Struk
                </button>

                <button 
                  className="btn-secondary"
                  onClick={() => window.print()}
                  style={{ justifyContent: 'center', padding: '0.5rem 0.35rem', fontSize: '0.73rem', background: '#06b6d4', color: '#000', border: 'none', fontWeight: 700 }}
                >
                  🧾 Print Thermal POS
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
