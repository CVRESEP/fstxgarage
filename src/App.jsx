import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CalendarView from './components/CalendarView';
import BookingModal from './components/BookingModal';
import QueueTracker from './components/QueueTracker';
import PriceEstimator from './components/PriceEstimator';
import ServicesSection from './components/ServicesSection';
import AdminDashboard from './components/AdminDashboard';
import WorkOrderModal from './components/WorkOrderModal';
import Footer from './components/Footer';

import { 
  getStoredQueues, 
  saveQueuesToStorage,
  getStoredServices,
  saveServicesToStorage,
  getStoredSiteConfig,
  saveSiteConfigToStorage,
  getStoredTestimonials,
  saveTestimonialsToStorage
} from './utils/storage';
import { 
  fetchQueuesFromTurso, 
  fetchServicesFromTurso,
  fetchSiteConfigFromTurso,
  fetchTestimonialsFromTurso
} from './utils/turso';

export default function App() {
  const [activeRole, setActiveRole] = useState('customer'); // Default: Clean Customer View
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'calendar', 'booking', 'tracker', 'estimator', 'admin'
  const [queues, setQueues] = useState(getStoredQueues());
  const [services, setServices] = useState(getStoredServices());
  const [siteConfig, setSiteConfig] = useState(getStoredSiteConfig());
  const [testimonials, setTestimonials] = useState(getStoredTestimonials());
  const [activeSPKQueue, setActiveSPKQueue] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');

  // Load live data from Turso Edge DB on mount if connected
  useEffect(() => {
    const loadTursoData = async () => {
      const tursoQueues = await fetchQueuesFromTurso();
      if (tursoQueues && Array.isArray(tursoQueues)) {
        setQueues(tursoQueues);
      }
      const tursoServices = await fetchServicesFromTurso();
      if (tursoServices && Array.isArray(tursoServices) && tursoServices.length > 0) {
        setServices(tursoServices);
      } else {
        saveServicesToTurso(services);
      }
      const tursoConfig = await fetchSiteConfigFromTurso();
      if (tursoConfig) {
        setSiteConfig(tursoConfig);
      }
      const tursoTestimonials = await fetchTestimonialsFromTurso();
      if (tursoTestimonials && Array.isArray(tursoTestimonials) && tursoTestimonials.length > 0) {
        setTestimonials(tursoTestimonials);
      }
    };
    loadTursoData();
  }, []);

  // Check URL hash for direct admin access e.g., #admin
  useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === '#admin') {
        setActiveRole('admin');
        setActiveTab('admin');
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  // Sync queues state to storage & Turso
  useEffect(() => {
    saveQueuesToStorage(queues);
  }, [queues]);

  // Sync services state to storage & Turso
  useEffect(() => {
    saveServicesToStorage(services);
  }, [services]);

  // Sync siteConfig state to storage & Turso
  useEffect(() => {
    saveSiteConfigToStorage(siteConfig);
  }, [siteConfig]);

  // Sync testimonials state to storage & Turso
  useEffect(() => {
    saveTestimonialsToStorage(testimonials);
  }, [testimonials]);

  const handleQueueCreated = (newQueue) => {
    setQueues(prev => [newQueue, ...prev]);
  };

  const handleSelectDateFromCalendar = (dateStr, duration) => {
    setSelectedCalendarDate(dateStr);
    setActiveTab('booking');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Navbar */}
      <Navbar 
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        queues={queues} 
      />

      {/* Main Content View */}
      <main style={{ flex: 1 }}>
        {activeRole === 'customer' ? (
          /* TAMPILAN CUSTOMER / PELANGGAN */
          <>
            {activeTab === 'home' && (
              <>
                <Hero 
                  onStartBooking={() => setActiveTab('calendar')}
                  onTrackQueue={() => setActiveTab('tracker')}
                  siteConfig={siteConfig}
                />
                <ServicesSection 
                  onBookService={() => setActiveTab('calendar')} 
                  services={services}
                  testimonials={testimonials}
                />
              </>
            )}

            {activeTab === 'calendar' && (
              <CalendarView 
                queues={queues}
                onNavigateToBooking={() => setActiveTab('booking')}
              />
            )}

            {activeTab === 'booking' && (
              <BookingModal 
                onQueueCreated={handleQueueCreated}
                onClose={() => setActiveTab('home')}
                existingQueues={queues}
                initialDate={selectedCalendarDate}
                services={services}
              />
            )}

            {activeTab === 'tracker' && (
              <QueueTracker 
                queues={queues}
                onSelectQueue={(q) => setActiveSPKQueue(q)}
              />
            )}

            {activeTab === 'estimation' && (
              <PriceEstimator 
                onBookWithServices={() => setActiveTab('calendar')}
                services={services}
              />
            )}
          </>
        ) : (
          /* TAMPILAN ADMIN WORKSHOP BENGKEL */
          <AdminDashboard 
            queues={queues}
            setQueues={setQueues}
            services={services}
            setServices={setServices}
            onOpenSPK={(q) => setActiveSPKQueue(q)}
            siteConfig={siteConfig}
            setSiteConfig={setSiteConfig}
            testimonials={testimonials}
            setTestimonials={setTestimonials}
          />
        )}
      </main>

      {/* Printable SPK Modal */}
      {activeSPKQueue && (
        <WorkOrderModal 
          queue={activeSPKQueue}
          onClose={() => setActiveSPKQueue(null)}
        />
      )}

      {/* Footer */}
      <Footer 
        siteConfig={siteConfig}
        onNavigate={(tab) => {
          if (tab === 'admin') {
            setActiveRole('admin');
            setActiveTab('admin');
            window.location.hash = 'admin';
          } else {
            setActiveRole('customer');
            setActiveTab(tab);
          }
        }}
      />

    </div>
  );
}
