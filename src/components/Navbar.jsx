import React, { useState } from 'react';
import { Wrench, Calendar as CalendarIcon, Search, Calculator, ShieldCheck, Menu, X, LogOut, ClipboardList } from 'lucide-react';

export default function Navbar({ activeRole, setActiveRole, activeTab, setActiveTab, queues, onOpenAdminLogin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    if (tab === 'admin') {
      if (onOpenAdminLogin) {
        onOpenAdminLogin();
      } else {
        setActiveRole('admin');
        setActiveTab('admin');
      }
    } else {
      setActiveTab(tab);
    }
    setMobileMenuOpen(false);
  };

  const handleExitAdmin = () => {
    setActiveRole('customer');
    setActiveTab('home');
    if (window.location.hash === '#admin') {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  return (
    <>
      {/* Admin Header Bar (ONLY IN ADMIN MODE) */}
      {activeRole === 'admin' && (
        <div style={{
          background: '#121216',
          borderBottom: '1px solid #27272a',
          padding: '0.4rem 1rem',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>⚙️ ADMIN PORTAL</span>
            <span style={{ color: '#a1a1aa', fontSize: '0.75rem' }}>FSTWORKS Workshop Management</span>
          </div>

          <button
            onClick={handleExitAdmin}
            style={{
              background: '#27272a',
              color: '#f4f4f5',
              border: 'none',
              borderRadius: '6px',
              padding: '0.25rem 0.65rem',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <LogOut size={13} /> Keluar
          </button>
        </div>
      )}

      {/* Main Navbar (PC & Top Mobile Bar) */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#0a0a0d',
        borderBottom: '1px solid #27272a',
        padding: '0.35rem 1rem 0.4rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          {/* ROW 1: BRAND LOGO (FIT ROW HEIGHT WITH MAXIMIZED IMAGE) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            width: '100%',
            height: '90px',
            position: 'relative',
            overflow: 'visible'
          }}>
            <div 
              onClick={() => handleNavClick(activeRole === 'admin' ? 'admin' : 'home')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                margin: '0 auto',
                height: '100%'
              }}
            >
              <img 
                src="/fst.png" 
                alt="FSTWORKS" 
                style={{ 
                  height: '135px', 
                  width: 'auto', 
                  objectFit: 'contain',
                  marginTop: '-5px',
                  marginBottom: '-5px',
                  filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.35))'
                }}
              />
            </div>

            {/* Mobile Toggle Button on top right */}
            <div className="view-hp-only" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  color: '#f4f4f5',
                  padding: '0.45rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* ROW 2: MENU BAR DIRECTLY BELOW LOGO (PC View) */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.65rem',
            width: '100%',
            paddingTop: '0.6rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap'
          }} className="view-pc-flex">
            {activeRole === 'customer' ? (
              <>
                <button
                  className={`btn-secondary btn-sm ${activeTab === 'home' ? 'active-nav' : ''}`}
                  onClick={() => handleNavClick('home')}
                  style={activeTab === 'home' ? { background: '#f59e0b', color: '#000000', borderColor: '#f59e0b', fontWeight: 700 } : {}}
                >
                  <Wrench size={15} /> Beranda & Jasa
                </button>

                <button
                  className={`btn-secondary btn-sm ${activeTab === 'calendar' ? 'active-nav' : ''}`}
                  onClick={() => handleNavClick('calendar')}
                  style={activeTab === 'calendar' ? { background: '#f59e0b', color: '#000000', borderColor: '#f59e0b', fontWeight: 700 } : {}}
                >
                  <CalendarIcon size={15} /> Agenda Workshop
                </button>

                <button
                  className={`btn-secondary btn-sm ${activeTab === 'tracker' ? 'active-nav' : ''}`}
                  onClick={() => handleNavClick('tracker')}
                  style={activeTab === 'tracker' ? { background: '#06b6d4', color: '#000000', borderColor: '#06b6d4', fontWeight: 700 } : {}}
                >
                  <Search size={15} /> Cek Status Kendaraan
                </button>

                <button
                  className={`btn-secondary btn-sm ${activeTab === 'estimation' ? 'active-nav' : ''}`}
                  onClick={() => handleNavClick('estimation')}
                  style={activeTab === 'estimation' ? { background: '#27272a', color: '#f4f4f5', fontWeight: 700 } : {}}
                >
                  <Calculator size={15} /> Perkiraan Biaya
                </button>

                <button
                  className={`btn-secondary btn-sm ${activeTab === 'booking' ? 'active-nav' : ''}`}
                  onClick={() => handleNavClick('booking')}
                  style={activeTab === 'booking' ? { background: '#06b6d4', color: '#000000', borderColor: '#06b6d4', fontWeight: 700 } : {}}
                >
                  <ClipboardList size={15} /> Formulir Booking
                </button>

                <button
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    if (onOpenAdminLogin) onOpenAdminLogin();
                    else { setActiveRole('admin'); setActiveTab('admin'); }
                  }}
                  style={{ marginLeft: '0.5rem', borderStyle: 'dashed', borderColor: '#f59e0b', color: '#f59e0b', fontWeight: 700 }}
                >
                  <ShieldCheck size={15} /> Login Admin
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{
            background: '#0a0a0d',
            borderTop: '1px solid #27272a',
            padding: '0.75rem',
            marginTop: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }} className="view-hp-only">
            {activeRole === 'customer' ? (
              <>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleNavClick('home')}
                  style={activeTab === 'home' ? { background: '#f59e0b', color: '#000' } : {}}
                >
                  <Wrench size={16} /> Beranda & Jasa
                </button>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleNavClick('calendar')}
                  style={activeTab === 'calendar' ? { background: '#f59e0b', color: '#000' } : {}}
                >
                  <CalendarIcon size={16} /> Agenda Workshop
                </button>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleNavClick('tracker')}
                  style={activeTab === 'tracker' ? { background: '#06b6d4', color: '#000' } : {}}
                >
                  <Search size={16} /> Cek Status Kendaraan
                </button>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleNavClick('estimation')}
                  style={activeTab === 'estimation' ? { background: '#27272a', color: '#fff' } : {}}
                >
                  <Calculator size={16} /> Perkiraan Biaya
                </button>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleNavClick('booking')}
                  style={activeTab === 'booking' ? { background: '#06b6d4', color: '#000' } : {}}
                >
                  <ClipboardList size={16} /> Formulir Booking
                </button>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAdminLogin) onOpenAdminLogin();
                    else { setActiveRole('admin'); setActiveTab('admin'); }
                  }}
                  style={{ borderStyle: 'dashed', borderColor: '#f59e0b', color: '#f59e0b' }}
                >
                  <ShieldCheck size={16} /> Login Admin
                </button>
              </>
            ) : null}
          </div>
        )}
      </nav>

      {/* DEDICATED BOTTOM MOBILE NAV BAR (HP View Only) */}
      <div 
        className="view-hp-only" 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 990,
          background: '#0a0a0d',
          borderTop: '1px solid #27272a',
          padding: '0.4rem 0.5rem 0.5rem',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <button
            onClick={() => handleNavClick('home')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'home' ? '#f59e0b' : '#a1a1aa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.68rem',
              fontWeight: activeTab === 'home' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            <Wrench size={18} color={activeTab === 'home' ? '#f59e0b' : '#a1a1aa'} />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => handleNavClick('calendar')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'calendar' ? '#f59e0b' : '#a1a1aa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.68rem',
              fontWeight: activeTab === 'calendar' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            <CalendarIcon size={18} color={activeTab === 'calendar' ? '#f59e0b' : '#a1a1aa'} />
            <span>Agenda</span>
          </button>

          <button
            onClick={() => handleNavClick('tracker')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'tracker' ? '#06b6d4' : '#a1a1aa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.68rem',
              fontWeight: activeTab === 'tracker' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            <Search size={18} color={activeTab === 'tracker' ? '#06b6d4' : '#a1a1aa'} />
            <span>Cek Status</span>
          </button>

          <button
            onClick={() => handleNavClick('estimation')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'estimation' ? '#f4f4f5' : '#a1a1aa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.68rem',
              fontWeight: activeTab === 'estimation' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            <Calculator size={18} color={activeTab === 'estimation' ? '#f4f4f5' : '#a1a1aa'} />
            <span>Biaya</span>
          </button>

          <button
            onClick={() => handleNavClick('booking')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'booking' ? '#06b6d4' : '#a1a1aa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.68rem',
              fontWeight: activeTab === 'booking' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            <ClipboardList size={18} color={activeTab === 'booking' ? '#06b6d4' : '#a1a1aa'} />
            <span>Booking</span>
          </button>

          <button
            onClick={() => {
              if (onOpenAdminLogin) onOpenAdminLogin();
              else { setActiveRole('admin'); setActiveTab('admin'); }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: activeRole === 'admin' ? '#f59e0b' : '#a1a1aa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              fontSize: '0.68rem',
              fontWeight: activeRole === 'admin' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={18} color={activeRole === 'admin' ? '#f59e0b' : '#a1a1aa'} />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </>
  );
}
