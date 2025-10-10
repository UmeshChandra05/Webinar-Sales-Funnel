import React, { useState, useEffect, useRef } from 'react';
import { fetchSheetData, fetchContactsData } from '../services/googleSheetsService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

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
  
  // Lead table state
  const [leadData, setLeadData] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Chart data state
  const [registrationTrendData, setRegistrationTrendData] = useState(null);
  const [leadSourceData, setLeadSourceData] = useState(null);
  const [roleDistributionChartData, setRoleDistributionChartData] = useState(null);
  
  // Ticket data state
  const [ticketData, setTicketData] = useState({
    open: 0,
    closed: 0,
    total: 0
  });

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
        setLeadData(result.rawData || []); // Store raw lead data
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

  // Function to load ticket/contact data
  const loadTicketData = async () => {
    try {
      const result = await fetchContactsData();
      if (result.success) {
        setTicketData(result.data);
      }
    } catch (err) {
      console.error('Error loading ticket data:', err);
    }
  };

  // Initial load and reload when date range changes
  useEffect(() => {
    loadData(dateRange);
    loadTicketData(); // Load ticket data on mount
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

  const handleExport = async () => {
    try {
      // Google Sheets CSV export URL
      const SHEET_ID = '1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8';
      const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
      
      // Fetch the CSV file
      const response = await fetch(CSV_URL);
      
      if (!response.ok) {
        throw new Error('Failed to download sheet');
      }
      
      const csvData = await response.text();
      
      // Create blob and download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileName = `PyStack_Webinar_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Sheet exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export sheet. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
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

  // Filter and search leads
  useEffect(() => {
    let filtered = [...leadData];

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => 
        (lead.Source || '').toLowerCase() === sourceFilter.toLowerCase()
      );
    }

    // Apply payment status filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(lead => {
        const status = (lead['Payment Status'] || '').toLowerCase().trim();
        
        // Map filter values to actual CSV values
        if (paymentFilter === 'success') {
          return status === 'success' || status === 'successful' || status === 'paid' || status === 'completed';
        } else if (paymentFilter === 'pending') {
          // Empty status = Pending, or explicit pending/processing
          return status === '' || status === 'pending' || status === 'processing';
        } else if (paymentFilter === 'needtime') {
          return status.includes('need time') || status.includes('needtime') || status === 'need time to confirm';
        } else if (paymentFilter === 'failed') {
          return status === 'failed' || status === 'failure' || status === 'declined';
        }
        
        return false;
      });
    }

    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead => 
        (lead.Name || '').toLowerCase().includes(query) ||
        (lead.Email || '').toLowerCase().includes(query) ||
        (lead.Phone || '').toLowerCase().includes(query)
      );
    }

    setFilteredLeads(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [leadData, sourceFilter, paymentFilter, searchQuery]);

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredLeads].sort((a, b) => {
      const aVal = a[key] || '';
      const bVal = b[key] || '';

      // No numeric sorting needed anymore (removed Paid Amount, Discount, PayableAmount)

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredLeads(sorted);
  };

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get unique sources for filter dropdown
  const uniqueSources = [...new Set(leadData.map(lead => lead.Source).filter(Boolean))];

  // Badge color based on payment status
  const getPaymentBadgeClass = (status) => {
    const s = (status || '').toLowerCase().trim().replace(/_/g, ' '); // Replace underscores with spaces
    if (s === 'success' || s === 'successful' || s === 'paid' || s === 'completed') return 'badge-success';
    // Empty status OR "need time" = Yellow (warning)
    if (s === '' || s === 'pending' || s === 'processing' || s.includes('need time') || s === 'need time to confirm') return 'badge-warning';
    if (s === 'failed' || s === 'failure' || s === 'declined') return 'badge-error';
    return 'badge-default';
  };

  // Get display text for payment status
  const getPaymentStatusDisplay = (status) => {
    const s = (status || '').toLowerCase().trim().replace(/_/g, ' '); // Replace underscores with spaces
    if (s === '') return 'Pending'; // Empty = Pending
    if (s.includes('need time') || s === 'need time to confirm' || s === 'need time to confirm') return 'Need Time';
    // Otherwise return original status with proper capitalization
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  // Format source display text (e.g., "Registration Page" instead of "RegistrationPage")
  const formatSourceDisplay = (source) => {
    if (!source) return '-';
    
    // Handle common patterns
    const formatted = source
      // Add space before capital letters (camelCase/PascalCase)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Add space before numbers
      .replace(/([a-zA-Z])(\d)/g, '$1 $2')
      // Replace underscores and hyphens with spaces
      .replace(/[_-]/g, ' ')
      // Capitalize first letter of each word
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return formatted;
  };

  // Filter leadData by date range
  const getFilteredLeadData = () => {
    if (dateRange === 'all') return leadData;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch(dateRange) {
      case '24h':
        cutoffDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        return leadData;
    }
    
    return leadData.filter(lead => {
      if (!lead.Registration_TS) return false;
      const regDate = new Date(lead.Registration_TS);
      return !isNaN(regDate.getTime()) && regDate >= cutoffDate;
    });
  };

  // Process chart data when leadData or dateRange changes
  useEffect(() => {
    if (leadData.length === 0) return;

    const filteredLeads = getFilteredLeadData();
    
    // Process Registration Trend Data (last 30 days)
    const last30Days = [];
    const registrationCounts = {};
    const today = new Date();
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push(dateStr);
      registrationCounts[dateStr] = 0;
    }

    // Count registrations per day from filtered data
    filteredLeads.forEach(lead => {
      if (lead.Registration_TS) {
        const regDate = new Date(lead.Registration_TS);
        const dateStr = regDate.toISOString().split('T')[0];
        if (registrationCounts.hasOwnProperty(dateStr)) {
          registrationCounts[dateStr]++;
        }
      }
    });

    const trendData = {
      labels: last30Days.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }),
      datasets: [
        {
          label: 'Registrations',
          data: last30Days.map(date => registrationCounts[date]),
          borderColor: 'rgba(139, 92, 246, 1)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: 'rgba(139, 92, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };

    setRegistrationTrendData(trendData);

    // Process Lead Sources Data from filtered data
    const sourceCounts = {};
    filteredLeads.forEach(lead => {
      const source = lead.Source || 'Unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    // Sort by count and get top 10 sources
    const sortedSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const sourceData = {
      labels: sortedSources.map(([source]) => source),
      datasets: [
        {
          label: 'Number of Leads',
          data: sortedSources.map(([, count]) => count),
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(34, 211, 238, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(14, 165, 233, 0.8)'
          ],
          borderColor: [
            'rgba(139, 92, 246, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(34, 211, 238, 1)',
            'rgba(251, 146, 60, 1)',
            'rgba(14, 165, 233, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    setLeadSourceData(sourceData);

    // Process Role Distribution Data (Donut Chart) from filtered data
    // Always include these 4 primary roles even if count is 0
    const primaryRoles = ['Entrepreneur', 'Student', 'Faculty', 'Industry Professional'];
    const roleCounts = {};
    
    // Initialize primary roles with 0
    primaryRoles.forEach(role => {
      roleCounts[role] = 0;
    });
    
    let totalCount = 0;
    
    filteredLeads.forEach(lead => {
      const role = lead.Role || 'Unknown';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
      totalCount++;
    });

    // Sort roles: primary roles first (in order), then others alphabetically
    const sortedRoleEntries = Object.entries(roleCounts).sort((a, b) => {
      const aIsPrimary = primaryRoles.indexOf(a[0]);
      const bIsPrimary = primaryRoles.indexOf(b[0]);
      
      if (aIsPrimary !== -1 && bIsPrimary !== -1) {
        return aIsPrimary - bIsPrimary; // Keep primary roles in defined order
      }
      if (aIsPrimary !== -1) return -1; // a is primary, comes first
      if (bIsPrimary !== -1) return 1;  // b is primary, comes first
      return a[0].localeCompare(b[0]); // Both non-primary, sort alphabetically
    });

    const roleLabels = sortedRoleEntries.map(([role]) => role);
    const roleCounts_array = sortedRoleEntries.map(([, count]) => count);
    
    // Vibrant color palette for roles - inspired by modern UI
    const getColorForRole = (role) => {
      const colorMap = {
        'Student': { bg: 'rgba(99, 179, 237, 0.9)', border: 'rgba(99, 179, 237, 1)' }, // Vibrant Cyan Blue
        'Teacher': { bg: 'rgba(72, 207, 173, 0.9)', border: 'rgba(72, 207, 173, 1)' }, // Vibrant Teal
        'Faculty': { bg: 'rgba(72, 207, 173, 0.9)', border: 'rgba(72, 207, 173, 1)' }, // Vibrant Teal
        'Entrepreneur': { bg: 'rgba(255, 159, 67, 0.9)', border: 'rgba(255, 159, 67, 1)' }, // Vibrant Orange
        'Industry Professional': { bg: 'rgba(142, 124, 255, 0.9)', border: 'rgba(142, 124, 255, 1)' }, // Vibrant Purple
        'Working Professional': { bg: 'rgba(142, 124, 255, 0.9)', border: 'rgba(142, 124, 255, 1)' }, // Vibrant Purple
        'Professional': { bg: 'rgba(142, 124, 255, 0.9)', border: 'rgba(142, 124, 255, 1)' }, // Vibrant Purple
        'HR Professional': { bg: 'rgba(255, 107, 161, 0.9)', border: 'rgba(255, 107, 161, 1)' }, // Vibrant Pink/Coral
        'Consultant': { bg: 'rgba(94, 231, 223, 0.9)', border: 'rgba(94, 231, 223, 1)' }, // Vibrant Light Cyan
        'Business Owner': { bg: 'rgba(255, 195, 113, 0.9)', border: 'rgba(255, 195, 113, 1)' }, // Vibrant Peach
        'Others': { bg: 'rgba(163, 174, 208, 0.9)', border: 'rgba(163, 174, 208, 1)' }, // Soft Blue Grey
        'Unknown': { bg: 'rgba(163, 174, 208, 0.9)', border: 'rgba(163, 174, 208, 1)' } // Soft Blue Grey
      };
      return colorMap[role] || { bg: 'rgba(163, 174, 208, 0.9)', border: 'rgba(163, 174, 208, 1)' }; // Default soft grey
    };

    const roleBackgroundColors = roleLabels.map(role => getColorForRole(role).bg);
    const roleBorderColors = roleLabels.map(role => getColorForRole(role).border);

    const roleChartData = {
      labels: roleLabels,
      datasets: [
        {
          data: roleCounts_array,
          backgroundColor: roleBackgroundColors,
          borderColor: roleBorderColors,
          borderWidth: 2,
          hoverOffset: 4
        }
      ]
    };

    setRoleDistributionChartData({
      ...roleChartData,
      totalCount: totalCount,
      roleCounts: roleCounts
    });
  }, [leadData, dateRange]);

  // Chart options
  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: false // Disable datalabels for this chart
      },
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#a1a1aa',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#a1a1aa',
          stepSize: 1
        }
      }
    }
  };

  const sourceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      datalabels: {
        display: false // Disable datalabels for this chart
      },
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#a1a1aa',
          stepSize: 1
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: '#a1a1aa'
        }
      }
    }
  };

  const roleChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // We'll show custom legend below
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return context[0].label || '';
          },
          label: function(context) {
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `  Count: ${value} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 12
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return percentage > 5 ? `${percentage}%` : ''; // Only show if > 5%
        }
      }
    },
    cutout: '60%' // Makes it a donut (inner circle cutout)
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
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
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--surface-light)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading && (
              <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
            )}
            <span>Refresh</span>
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
            <div style={{ height: '14rem', position: 'relative', padding: '1rem 0' }}>
              {roleDistributionChartData ? (
                <>
                  <Doughnut data={roleDistributionChartData} options={roleChartOptions} />
                  {/* Center Total Count */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0' }}>
                      {roleDistributionChartData.totalCount || 0}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Total Leads
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center" style={{ height: '100%' }}>
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            {/* Role Distribution Legend with Color Dots */}
            {roleDistributionChartData && roleDistributionChartData.labels && (
              <div style={{ 
                marginTop: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {roleDistributionChartData.labels.map((role, index) => {
                  const getColorForRole = (roleName) => {
                    const colorMap = {
                      'Student': 'rgba(99, 179, 237, 1)',
                      'Teacher': 'rgba(72, 207, 173, 1)',
                      'Faculty': 'rgba(72, 207, 173, 1)',
                      'Entrepreneur': 'rgba(255, 159, 67, 1)',
                      'Industry Professional': 'rgba(142, 124, 255, 1)',
                      'Working Professional': 'rgba(142, 124, 255, 1)',
                      'Professional': 'rgba(142, 124, 255, 1)',
                      'HR Professional': 'rgba(255, 107, 161, 1)',
                      'Consultant': 'rgba(94, 231, 223, 1)',
                      'Business Owner': 'rgba(255, 195, 113, 1)',
                      'Others': 'rgba(163, 174, 208, 1)',
                      'Unknown': 'rgba(163, 174, 208, 1)'
                    };
                    return colorMap[roleName] || 'rgba(163, 174, 208, 1)';
                  };

                  return (
                    <div key={role} style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: getColorForRole(role),
                        flexShrink: 0
                      }}></span>
                      <span style={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {role} ({roleDistributionChartData.roleCounts[role]})
                      </span>
                    </div>
                  );
                })}
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

          {/* Query Analytics Panel */}
          <section className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0' }}>
                Query Analytics
              </h2>
              <button
                onClick={() => window.open('https://docs.google.com/spreadsheets/d/1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8/edit#gid=1649167240', '_blank')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                📋 View Tickets
              </button>
            </div>
            
            {/* Ticket Statistics */}
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <div style={{ flex: '1', textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--warning)', marginBottom: '0.25rem' }}>
                  {ticketData.open}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Open Tickets</p>
              </div>
              <div style={{ width: '1px', height: '3rem', backgroundColor: 'var(--border)' }}></div>
              <div style={{ flex: '1', textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)', marginBottom: '0.25rem' }}>
                  {ticketData.closed}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Closed Tickets</p>
              </div>
              <div style={{ width: '1px', height: '3rem', backgroundColor: 'var(--border)' }}></div>
              <div style={{ flex: '1', textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {ticketData.total}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Queries</p>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div style={{ marginTop: '1rem' }}>
              <div className="flex" style={{ height: '2rem', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: ticketData.total > 0 ? `${(ticketData.open / ticketData.total) * 100}%` : '50%',
                    backgroundColor: 'var(--warning)',
                    transition: 'width 0.3s ease'
                  }}
                ></div>
                <div 
                  style={{ 
                    width: ticketData.total > 0 ? `${(ticketData.closed / ticketData.total) * 100}%` : '50%',
                    backgroundColor: 'var(--success)',
                    transition: 'width 0.3s ease'
                  }}
                ></div>
              </div>
              <div className="flex justify-between" style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>
                  ⚠️ Open: {ticketData.total > 0 ? ((ticketData.open / ticketData.total) * 100).toFixed(1) : 0}%
                </span>
                <span>
                  ✓ Resolved: {ticketData.total > 0 ? ((ticketData.closed / ticketData.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col" style={{ gap: '1.5rem' }}>
          {/* Overall Performance Panel */}
          <section className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Overall Performance
            </h2>
            <div className="grid grid-cols-2 gap-4" style={{ height: '19rem' }}>
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '0.5rem' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Total Revenue</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0' }}>
                  ₹{dashboardData.totalRevenue}
                </p>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '0.5rem' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Total Leads</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0' }}>
                  {dashboardData.totalLeads}
                </p>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '0.5rem' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Conversion Rate</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0' }}>
                  {dashboardData.conversionRate}%
                </p>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '0.5rem' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Engagement</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0' }}>
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
            <div className="flex flex-col items-center justify-center" style={{ height: '20rem', backgroundColor: 'var(--surface-light)', borderRadius: '0.5rem', gap: '1rem', padding: '1rem 0' }}>
              <div style={{ width: '80%', height: '3rem', backgroundColor: 'var(--primary)', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)' }}>
                Leads ({dashboardData.funnel.leads})
              </div>
              <div style={{ width: '70%', height: '3rem', backgroundColor: 'var(--primary)', opacity: '0.85', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)' }}>
                Registered ({dashboardData.funnel.registered})
              </div>
              <div style={{ width: '55%', height: '3rem', backgroundColor: 'var(--primary)', opacity: '0.7', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)' }}>
                Paid ({dashboardData.funnel.paid})
              </div>
              <div style={{ width: '40%', height: '3rem', backgroundColor: 'var(--primary)', opacity: '0.55', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)' }}>
                Completed ({dashboardData.funnel.completed})
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Lead Analytics Section */}
      <section className="p-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Lead Analytics
        </h2>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '1.5rem' }}>
          {/* Registration Trend Chart */}
          <div className="card p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Registration Trend (Last 30 Days)
            </h3>
            <div 
              id="registrationTrendChart" 
              style={{ 
                height: '16rem',
                position: 'relative'
              }}
            >
              {registrationTrendData ? (
                <Line data={registrationTrendData} options={trendChartOptions} />
              ) : (
                <div className="h-64 flex items-center justify-center text-sm" 
                  style={{ 
                    color: 'var(--text-secondary)', 
                    backgroundColor: 'var(--surface-light)', 
                    borderRadius: '0.5rem',
                    border: '2px dashed var(--border)'
                  }}
                >
                  <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
                  <span style={{ marginLeft: '0.5rem' }}>Loading chart...</span>
                </div>
              )}
            </div>
          </div>

          {/* Lead Sources Chart */}
          <div className="card p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Lead Sources (Top 10)
            </h3>
            <div 
              id="leadSourceChart" 
              style={{ 
                height: '16rem',
                position: 'relative'
              }}
            >
              {leadSourceData ? (
                <Bar data={leadSourceData} options={sourceChartOptions} />
              ) : (
                <div className="h-64 flex items-center justify-center text-sm" 
                  style={{ 
                    color: 'var(--text-secondary)', 
                    backgroundColor: 'var(--surface-light)', 
                    borderRadius: '0.5rem',
                    border: '2px dashed var(--border)'
                  }}
                >
                  <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
                  <span style={{ marginLeft: '0.5rem' }}>Loading chart...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lead Details Table Section */}
        <section className="card mt-6 p-4">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Lead Details
          </h3>

          {/* Header Controls - Filters + Search */}
          <div className="flex justify-between items-center mb-4" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            {/* Left: Filter dropdowns */}
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
              <select 
                className="form-select"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Sources</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source}>{formatSourceDisplay(source)}</option>
                ))}
              </select>

              <select 
                className="form-select"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  minWidth: '200px'
                }}
              >
                <option value="all">All Payment Status</option>
                <option value="success">Successful</option>
                <option value="pending">Pending</option>
                <option value="needtime">Need Time</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Right: Search box and button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  width: '16rem'
                }}
              />
              <button 
                className="btn"
                onClick={() => setSearchQuery('')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results count */}
          <div style={{ 
            marginBottom: '1rem', 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)' 
          }}>
            Showing {currentLeads.length} of {filteredLeads.length} leads
            {filteredLeads.length !== leadData.length && ` (filtered from ${leadData.length} total)`}
          </div>

          {/* Lead Details Table */}
          <div style={{ overflowX: 'auto' }}>
            <table 
              className="w-full"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'var(--surface)',
                borderRadius: '0.5rem'
              }}
            >
              <thead style={{ backgroundColor: 'var(--surface-light)' }}>
                <tr>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('Name')}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Name {sortConfig.key === 'Name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('Phone')}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Mobile {sortConfig.key === 'Phone' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('Email')}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Email {sortConfig.key === 'Email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('Role')}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Role {sortConfig.key === 'Role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('Source')}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Source {sortConfig.key === 'Source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('Registration_TS')}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Registered {sortConfig.key === 'Registration_TS' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('Payment Status')}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Payment Status {sortConfig.key === 'Payment Status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('CouponCode')}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Coupon Code {sortConfig.key === 'CouponCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('Nuturing')}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Nurturing {sortConfig.key === 'Nuturing' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer"
                    onClick={() => handleSort('Interest')}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Interest {sortConfig.key === 'Interest' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentLeads.length === 0 ? (
                  <tr>
                    <td 
                      colSpan="9" 
                      style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      No leads found
                    </td>
                  </tr>
                ) : (
                  currentLeads.map((lead, index) => (
                    <tr 
                      key={index}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-light)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                        {lead.Name || '-'}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {lead.Phone || '-'}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {lead.Email || '-'}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                        {lead.Role || '-'}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                        {formatSourceDisplay(lead.Source)}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {lead.Registration_TS ? new Date(lead.Registration_TS).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span 
                          className={`badge ${getPaymentBadgeClass(lead['Payment Status'])}`}
                          style={{
                            display: 'inline-block',
                            padding: '0.35rem 1rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            minWidth: '85px',
                            textAlign: 'center',
                            backgroundColor: getPaymentBadgeClass(lead['Payment Status']) === 'badge-success' ? 'var(--success)' :
                                           getPaymentBadgeClass(lead['Payment Status']) === 'badge-warning' ? 'var(--warning)' :
                                           getPaymentBadgeClass(lead['Payment Status']) === 'badge-error' ? 'var(--error)' : 'var(--surface-light)',
                            color: getPaymentBadgeClass(lead['Payment Status']) === 'badge-success' || 
                                   getPaymentBadgeClass(lead['Payment Status']) === 'badge-error' || 
                                   getPaymentBadgeClass(lead['Payment Status']) === 'badge-warning' ? '#ffffff' : 'var(--text-secondary)'
                          }}
                        >
                          {getPaymentStatusDisplay(lead['Payment Status'])}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {lead.CouponCode || '-'}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                        {lead.Nuturing || '-'}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {lead.Interest || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4" style={{ gap: '0.5rem' }}>
              <button 
                className="btn btn-sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: currentPage === 1 ? 'var(--surface-light)' : 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                ‹
              </button>
              
              {/* Page numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = idx + 1;
                } else if (currentPage <= 3) {
                  pageNum = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = currentPage - 2 + idx;
                }
                
                return (
                  <button 
                    key={pageNum}
                    className="btn btn-sm"
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: currentPage === pageNum ? 'var(--primary)' : 'var(--surface)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      minWidth: '2.5rem'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span style={{ color: 'var(--text-secondary)' }}>...</span>
                  <button 
                    className="btn btn-sm"
                    onClick={() => handlePageChange(totalPages)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      minWidth: '2.5rem'
                    }}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button 
                className="btn btn-sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: currentPage === totalPages ? 'var(--surface-light)' : 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                ›
              </button>
            </div>
          )}
        </section>
      </section>
    </div>
  );
};

export default AdminDashboard;