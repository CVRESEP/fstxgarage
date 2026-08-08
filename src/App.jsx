import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CalendarView from './components/CalendarView';
import BookingModal from './components/BookingModal';
import QueueTracker from './components/QueueTracker';
import PriceEstimator from './components/PriceEstimator';
import ServicesSection from './components/ServicesSection';
import AdminDashboard from './components/AdminDashboard';
import WorkOrderModal from './components/WorkOrderModal';
import AdminLoginModal from './components/AdminLoginModal';
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
  initTursoSchema,
  fetchQueuesFromTurso, 
  fetchServicesFromTurso,
  fetchSiteConfigFromTurso,
  fetchTestimonialsFromTurso,
  fetchProductsFromTurso,
  fetchSymptomsFromTurso,
  fetchHolidaysFromTurso,
  saveQueueToTurso,
  saveServicesToTurso,
  saveSiteConfigToTurso,
  saveSymptomsToTurso,
  saveHolidaysToTurso,
  saveTestimonialsToTurso
} from './utils/turso';

export default function App() {
  const [activeRole, setActiveRole] = useState('customer');
  const [activeTab, setActiveTab] = useState('home');
  const [queues, setQueues] = useState([]);
  const [services, setServices] = useState([]);
  const [siteConfig, setSiteConfig] = useState(getStoredSiteConfig());
  const [testimonials, setTestimonials] = useState([]);
  const [products, setProducts] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [holidays, setHolidays] = useState(getStoredHolidayConfig());
  const [activeSPKQueue, setActiveSPKQueue] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Fetch ALL live data from Turso Cloud Database on mount
  const refreshAllData = useCallback(async () => {
    try {
      await initTursoSchema();

      const [
        tursoQueues,
        tursoServices,
        tursoConfig,
        tursoTestimonials,
        tursoProducts,
        tursoSymptoms,
        tursoHolidays
      ] = await Promise.all([
        fetchQueuesFromTurso(),
        fetchServicesFromTurso(),
        fetchSiteConfigFromTurso(),
        fetchTestimonialsFromTurso(),
        fetchProductsFromTurso(),
        fetchSymptomsFromTurso(),
        fetchHolidaysFromTurso()
      ]);

      // 1. Queues
      if (tursoQueues && Array.isArray(tursoQueues)) {
        setQueues(tursoQueues);
        saveQueuesToStorage(tursoQueues);
      } else {
        const localQ = getStoredQueues();
        setQueues(localQ);
      }

      // 2. Services
      if (tursoServices && Array.isArray(tursoServices)) {
        setServices(tursoServices);
        saveServicesToStorage(tursoServices);
      } else {
        const localS = getStoredServices();
        setServices(localS);
      }

      // 3. Site Config
      if (tursoConfig && Object.keys(tursoConfig).length > 0) {
        setSiteConfig(tursoConfig);
        saveSiteConfigToStorage(tursoConfig);
      } else {
        const localC = getStoredSiteConfig();
        setSiteConfig(localC);
      }

      // 4. Testimonials
      if (tursoTestimonials && Array.isArray(tursoTestimonials)) {
        setTestimonials(tursoTestimonials);
        saveTestimonialsToStorage(tursoTestimonials);
      } else {
        setTestimonials(getStoredTestimonials());
      }

      // 5. Products
      if (tursoProducts && Array.isArray(tursoProducts)) {
        setProducts(tursoProducts);
        saveProductsToStorage(tursoProducts);
      } else {
        setProducts(getStoredProducts());
      }

      // 6. Symptoms
      if (tursoSymptoms && Array.isArray(tursoSymptoms)) {
        setSymptoms(tursoSymptoms);
        saveSymptomsToStorage(tursoSymptoms);
      } else {
        const localSym = getStoredSymptoms();
        setSymptoms(localSym);
      }

      // 7. Holidays
      if (tursoHolidays && Object.keys(tursoHolidays).length > 0) {
        setHolidays(tursoHolidays);
        saveHolidayConfigToStorage(tursoHolidays);
      } else {
        const localH = getStoredHolidayConfig();
        setHolidays(localH);
      }

      setIsDataLoaded(true);
    } catch (err) {
      console.error('Error fetching live data from Turso Cloud Database:', err);
      setQueues(getStoredQueues());
      setServices(getStoredServices());
      setSiteConfig(getStoredSiteConfig());
      setTestimonials(getStoredTestimonials());
      setProducts(getStoredProducts());
      setSymptoms(getStoredSymptoms());
      setHolidays(getStoredHolidayConfig());
      setIsDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Check URL hash for direct admin access e.g., #admin or #login
  useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === '#admin') {
        setActiveRole('admin');
        setActiveTab('admin');
      } else if (window.location.hash === '#login') {
        setShowAdminLoginModal(true);
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  // Save changes to localStorage only when user modifies state post-initialization
  useEffect(() => { if (isDataLoaded) saveQueuesToStorage(queues); }, [queues, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) saveServicesToStorage(services); }, [services, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) saveSiteConfigToStorage(siteConfig); }, [siteConfig, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) saveTestimonialsToStorage(testimonials); }, [testimonials, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) saveProductsToStorage(products); }, [products, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) saveSymptomsToStorage(symptoms); }, [symptoms, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) saveHolidayConfigToStorage(holidays); }, [holidays, isDataLoaded]);

  const handleQueueCreated = async (newQueue) => {
    setQueues(prev => [newQueue, ...prev]);
    await saveQueueToTurso(newQueue);
  };

  const handleSelectDateFromCalendar = (dateStr) => {
    setSelectedCalendarDate(dateStr);
    setActiveTab('booking');
  };

  const handleAdminLoginSuccess = () => {
    setActiveRole('admin');
    setActiveTab('admin');
    setShowAdminLoginModal(false);
    window.location.hash = 'admin';
  };

  const handleExitAdminMode = () => {
    setActiveRole('customer');
    setActiveTab('home');
    if (window.location.hash === '#admin' || window.location.hash === '#login') {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
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
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
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
                holidayConfig={holidays}
                onSaveHolidayConfig={async (updated) => {
                  setHolidays(updated);
                  await saveHolidaysToTurso(updated);
                }}
                isAdmin={activeRole === 'admin'}
              />
            )}

            {activeTab === 'booking' && (
              <BookingModal 
                onQueueCreated={handleQueueCreated}
                onClose={() => setActiveTab('home')}
                existingQueues={queues}
                initialDate={selectedCalendarDate}
                services={services}
                symptoms={symptoms}
              />
            )}

            {activeTab === 'tracker' && (
              <QueueTracker 
                queues={queues}
                services={services}
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
            onExitAdmin={handleExitAdminMode}
          />
        )}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal 
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        siteConfig={siteConfig}
      />

      {/* Printable SPK Modal */}
      {activeSPKQueue && (
        <WorkOrderModal 
          queue={activeSPKQueue}
          services={services}
          onClose={() => setActiveSPKQueue(null)}
        />
      )}

      {/* Footer */}
      <Footer 
        siteConfig={siteConfig}
        onNavigate={(tab) => {
          if (tab === 'admin') {
            setShowAdminLoginModal(true);
          } else {
            setActiveRole('customer');
            setActiveTab(tab);
          }
        }}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
      />

    </div>
  );
}
