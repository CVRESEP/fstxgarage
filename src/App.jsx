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
  saveTestimonialsToStorage,
  getStoredProducts,
  saveProductsToStorage,
  getStoredSymptoms,
  saveSymptomsToStorage,
  getStoredHolidayConfig,
  saveHolidayConfigToStorage
} from './utils/storage';
import { 
  fetchQueuesFromTurso, 
  fetchServicesFromTurso,
  fetchSiteConfigFromTurso,
  fetchTestimonialsFromTurso,
  fetchProductsFromTurso,
  fetchSymptomsFromTurso,
  fetchHolidaysFromTurso,
  saveServicesToTurso,
  saveSiteConfigToTurso,
  saveSymptomsToTurso,
  saveHolidaysToTurso
} from './utils/turso';

export default function App() {
  const [activeRole, setActiveRole] = useState('customer');
  const [activeTab, setActiveTab] = useState('home');
  const [queues, setQueues] = useState(getStoredQueues());
  const [services, setServices] = useState(getStoredServices());
  const [siteConfig, setSiteConfig] = useState(getStoredSiteConfig());
  const [testimonials, setTestimonials] = useState(getStoredTestimonials());
  const [products, setProducts] = useState(getStoredProducts());
  const [symptoms, setSymptoms] = useState(getStoredSymptoms());
  const [holidays, setHolidays] = useState(getStoredHolidayConfig());
  const [activeSPKQueue, setActiveSPKQueue] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');

  // Load ALL live data from Turso Edge DB on mount
  useEffect(() => {
    const loadTursoData = async () => {
      // 1. Queues
      const tursoQueues = await fetchQueuesFromTurso();
      if (tursoQueues && Array.isArray(tursoQueues)) {
        setQueues(tursoQueues);
      }

      // 2. Services Catalog
      const tursoServices = await fetchServicesFromTurso();
      if (tursoServices && Array.isArray(tursoServices) && tursoServices.length > 0) {
        setServices(tursoServices);
      } else {
        saveServicesToTurso(services);
      }

      // 3. Site Config (CMS)
      const tursoConfig = await fetchSiteConfigFromTurso();
      if (tursoConfig) {
        setSiteConfig(tursoConfig);
      } else {
        saveSiteConfigToTurso(siteConfig);
      }

      // 4. Testimonials
      const tursoTestimonials = await fetchTestimonialsFromTurso();
      if (tursoTestimonials && Array.isArray(tursoTestimonials)) {
        setTestimonials(tursoTestimonials);
      }

      // 5. Products (Sparepart)
      const tursoProducts = await fetchProductsFromTurso();
      if (tursoProducts && Array.isArray(tursoProducts)) {
        setProducts(tursoProducts);
      }

      // 6. Symptoms
      const tursoSymptoms = await fetchSymptomsFromTurso();
      if (tursoSymptoms && Array.isArray(tursoSymptoms)) {
        setSymptoms(tursoSymptoms);
      } else {
        saveSymptomsToTurso(symptoms);
      }

      // 7. Holidays
      const tursoHolidays = await fetchHolidaysFromTurso();
      if (tursoHolidays) {
        setHolidays(tursoHolidays);
      } else {
        saveHolidaysToTurso(holidays);
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

  // Sync ALL state changes to localStorage + Turso
  useEffect(() => { saveQueuesToStorage(queues); }, [queues]);
  useEffect(() => { saveServicesToStorage(services); }, [services]);
  useEffect(() => { saveSiteConfigToStorage(siteConfig); }, [siteConfig]);
  useEffect(() => { saveTestimonialsToStorage(testimonials); }, [testimonials]);
  useEffect(() => { saveProductsToStorage(products); }, [products]);
  useEffect(() => { saveSymptomsToStorage(symptoms); }, [symptoms]);
  useEffect(() => { saveHolidayConfigToStorage(holidays); }, [holidays]);

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
          <AdminDashboard 
            queues={queues}
            setQueues={setQueues}
            services={services}
            setServices={setServices}
            products={products}
            setProducts={setProducts}
            symptoms={symptoms}
            setSymptoms={setSymptoms}
            holidays={holidays}
            setHolidays={setHolidays}
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
