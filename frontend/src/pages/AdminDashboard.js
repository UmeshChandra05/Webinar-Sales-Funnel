import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../services/googleSheetsService';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [showDropdown, setShowDropdown] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalLeads: 0,
    conversionRate: 0,
    engagement: 0,
    roleDistribution: {},
    paymentStats: {
      successful: 0,
      pending: 0,
      failed: 0
    },
    funnel: {
      leads: 0,
      registered: 0,
      paid: 0,
      completed: 0
    },
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const dateRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  // Function to load data from Google Sheets
  const loadData = async (selectedDateRange) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchSheetData(selectedDateRange || dateRange);
      
      if (result.success) {
        setDashboardData(result.data);
        setCountdown(30); // Reset countdown
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load data from Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and reload when date range changes
  useEffect(() => {
    loadData(dateRange);
  }, [dateRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(dateRange);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [dateRange]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 30; // Will reset on next data load
        }
        return prev - 1;
      });
    }, 1000); // 1 second

    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.date-range-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleExport = () => {
    // Export current data as CSV
    const csvContent = convertToCSV(dashboardData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleDateRangeChange = (value) => {
    console.log('Date range changed to:', value);
    setDateRange(value);
    setShowDropdown(false);
  };

  const getDateRangeLabel = () => {
    const option = dateRangeOptions.find(opt => opt.value === dateRange);
    return option ? option.label : 'Select Range';
  };

  const convertToCSV = (data) => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Revenue', `₹${data.totalRevenue}`],
      ['Total Leads', data.totalLeads],
      ['Conversion Rate', `${data.conversionRate}%`],
      ['Engagement', `${data.engagement}%`],
      ['Payment Successful', data.paymentStats.successful],
      ['Payment Pending', data.paymentStats.pending],
      ['Payment Failed', data.paymentStats.failed],
      ['Funnel - Leads', data.funnel.leads],
      ['Funnel - Registered', data.funnel.registered],
      ['Funnel - Paid', data.funnel.paid],
      ['Funnel - Completed', data.funnel.completed],
      ['Last Updated', data.lastUpdated]
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            padding: '2rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-primary)' }}>Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: '400px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Header Section */}
      <header className="flex justify-between items-center p-4" style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            Webinar Sales Funnel – Admin Analytics Dashboard
          </h1>
          {dashboardData.lastUpdated && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Last updated: {dashboardData.lastUpdated} • Next refresh in: {countdown}s
            </p>
          )}
        </div>
        <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
          {/* Date Range Dropdown */}
          <div className="date-range-dropdown" style={{ position: 'relative' }}>
            <button 
              className="btn"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '160px',
                justifyContent: 'space-between'
              }}
            >
              <span>{getDateRangeLabel()}</span>
              <span style={{ fontSize: '0.75rem' }}>▼</span>
            </button>
            
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '0.25rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                zIndex: 1000,
                minWidth: '160px',
                overflow: 'hidden'
              }}>
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDateRangeChange(option.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: dateRange === option.value ? 'var(--primary)' : 'transparent',
                      color: 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (dateRange !== option.value) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-light)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (dateRange !== option.value) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            className="btn"
            onClick={handleExport}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--surface-light)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Export
          </button>
          <button 
            className="btn"
            onClick={handleRefresh}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--surface-light)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="grid grid-cols-2 gap-6 p-4">
        {/* Left Column */}
        <div className="flex flex-col" style={{ gap: '1.5rem' }}>
          {/* Role Distribution Panel */}
          <section className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Role Distribution
            </h2>
            <div className="flex items-center justify-center" style={{ height: '12rem', backgroundColor: 'var(--surface-light)', borderRadius: '0.5rem' }}>
              <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '30px solid var(--primary)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {dashboardData.totalLeads}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Leads</p>
                </div>
              </div>
            </div>
            {/* Role Distribution Details */}
            {Object.keys(dashboardData.roleDistribution).length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  By Role:
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(dashboardData.roleDistribution).map(([role, count]) => (
                    <div key={role} style={{ 
                      padding: '0.5rem', 
                      backgroundColor: 'var(--surface-light)', 
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{role}:</span>{' '}
                      <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Payment Stats Panel */}
          <section className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Payment Stats
            </h2>
            <div className="flex" style={{ height: '1.5rem', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <span style={{ flex: '1', backgroundColor: 'var(--success)' }}></span>
              <span style={{ flex: '1', backgroundColor: 'var(--warning)' }}></span>
              <span style={{ flex: '1', backgroundColor: 'var(--error)' }}></span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              <span>✓ Successful: {dashboardData.paymentStats.successful}</span>
              <span>⏳ Pending: {dashboardData.paymentStats.pending}</span>
              <span>✗ Failed: {dashboardData.paymentStats.failed}</span>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col" style={{ gap: '1.5rem' }}>
          {/* Overall Performance Panel */}
          <section className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Overall Performance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1rem', textAlign: 'center' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Revenue</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  ₹{dashboardData.totalRevenue}
                </p>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1rem', textAlign: 'center' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Leads</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {dashboardData.totalLeads}
                </p>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1rem', textAlign: 'center' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Conv. Rate</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {dashboardData.conversionRate}%
                </p>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1rem', textAlign: 'center' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Engagement</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {dashboardData.engagement}%
                </p>
              </div>
            </div>
          </section>

          {/* Webinar Sales Funnel Panel */}
          <section className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Webinar Sales Funnel
            </h2>
            <div className="flex flex-col items-center justify-center" style={{ height: '14rem', backgroundColor: 'var(--surface-light)', borderRadius: '0.5rem', gap: '0.5rem' }}>
              <div style={{ width: '75%', height: '2rem', backgroundColor: 'var(--primary)', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
                Leads ({dashboardData.funnel.leads})
              </div>
              <div style={{ width: '66%', height: '2rem', backgroundColor: 'var(--primary)', opacity: '0.8', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
                Registered ({dashboardData.funnel.registered})
              </div>
              <div style={{ width: '50%', height: '2rem', backgroundColor: 'var(--primary)', opacity: '0.6', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
                Paid ({dashboardData.funnel.paid})
              </div>
              <div style={{ width: '33%', height: '2rem', backgroundColor: 'var(--primary)', opacity: '0.4', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
                Completed ({dashboardData.funnel.completed})
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;