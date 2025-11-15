import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('alltime');
  const [dateRangeLabel, setDateRangeLabel] = useState('Select Date Range');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
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
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Advanced analytics state
  const [showAdvancedSelection, setShowAdvancedSelection] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    mobile: true,
    email: true,
    role: true,
    client_status: true,
    nurturing: true,
    payment_status: false,
    source: false,
    reg_timestamp: false,
    payable_amt: false,
    paid_amt: false,
    discount_percentage: false,
    discount_amt: false,
    couponcode_given: false,
    couponcode_applied: false,
    txn_id: false,
    txn_timestamp: false,
    currency: false
  });
  
  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    name: 'all',
    mobile: 'all',
    email: 'all',
    role: 'all',
    client_status: 'all',
    nurturing: 'all',
    payment_status: 'all',
    source: 'all',
    reg_timestamp: 'all',
    payable_amt: 'all',
    paid_amt: 'all',
    discount_percentage: 'all',
    discount_amt: 'all',
    couponcode_given: 'all',
    couponcode_applied: 'all',
    txn_id: 'all',
    txn_timestamp: 'all',
    currency: 'all'
  });
  
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

  // Pending approval modal state
  const [showPendingApprovalModal, setShowPendingApprovalModal] = useState(false);
  const [pendingQueries, setPendingQueries] = useState([]);
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [editableReply, setEditableReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isReplyEdited, setIsReplyEdited] = useState(false);
  const [originalReply, setOriginalReply] = useState('');
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);
  
  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'lastmonth', label: 'Last Month' },
    { value: 'alltime', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' }
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

  // Function to load pending approval queries
  const loadPendingQueries = async () => {
    setIsLoadingQueries(true);
    try {
      const result = await fetchContactsData();
      if (result.success && result.rawData) {
        const pending = result.rawData.filter(
          query => query.query_status?.toLowerCase() === 'pending approval'
        );
        setPendingQueries(pending);
        if (pending.length > 0) {
          setCurrentQueryIndex(0);
          // Remove "AI Recommendation: ", "AI Recomendation: ", or "AI Response: " prefix from reply
          const cleanedReply = (pending[0].query_reply || '').replace(/^AI\s+(Reco(m{1,2})endation|Response):\s*/i, '');
          setEditableReply(cleanedReply);
          setOriginalReply(cleanedReply);
          setIsReplyEdited(false);
        }
      }
    } catch (err) {
      console.error('Error loading pending queries:', err);
    } finally {
      setIsLoadingQueries(false);
    }
  };

  // Open pending approval modal
  const openPendingApprovalModal = () => {
    loadPendingQueries();
    setShowPendingApprovalModal(true);
  };

  // Close pending approval modal
  const closePendingApprovalModal = () => {
    setShowPendingApprovalModal(false);
    setCurrentQueryIndex(0);
    setEditableReply('');
    setIsSending(false);
    setIsReplyEdited(false);
    setOriginalReply('');
  };

  // Navigate to previous query
  const goToPreviousQuery = () => {
    if (currentQueryIndex > 0) {
      const newIndex = currentQueryIndex - 1;
      setCurrentQueryIndex(newIndex);
      // Remove "AI Recommendation: ", "AI Recomendation: ", or "AI Response: " prefix from reply
      const cleanedReply = (pendingQueries[newIndex].query_reply || '').replace(/^AI\s+(Reco(m{1,2})endation|Response):\s*/i, '');
      setEditableReply(cleanedReply);
      setOriginalReply(cleanedReply);
      setIsReplyEdited(false);
    }
  };

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const dismissToast = () => {
    setToastMessage(null);
  };

  // Navigate to next query
  const goToNextQuery = () => {
    if (currentQueryIndex < pendingQueries.length - 1) {
      const newIndex = currentQueryIndex + 1;
      setCurrentQueryIndex(newIndex);
      // Remove "AI Recommendation: ", "AI Recomendation: ", or "AI Response: " prefix from reply
      const cleanedReply = (pendingQueries[newIndex].query_reply || '').replace(/^AI\s+(Reco(m{1,2})endation|Response):\s*/i, '');
      setEditableReply(cleanedReply);
      setOriginalReply(cleanedReply);
      setIsReplyEdited(false);
    }
  };

  // Send response to webhook
  const sendResponse = async () => {
    if (!editableReply.trim()) {
      showToast('Please enter a reply before sending.', 'warning');
      return;
    }

    setIsSending(true);
    try {
      const currentQuery = pendingQueries[currentQueryIndex];
      const payload = {
        ticket_id: currentQuery.ticket_id,
        name: currentQuery.name,
        email: currentQuery.email,
        mobile: currentQuery.mobile,
        query: currentQuery.query,
        query_reply: editableReply,
        query_category: currentQuery.query_category,
        query_status: 'Admin Processed',
        query_resolved_by: currentQuery.query_resolved_by,
        query_timestamp: currentQuery.query_timestamp,
        query_resolved_timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/send-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Remove current query from pending list
        const updatedPendingQueries = pendingQueries.filter((_, index) => index !== currentQueryIndex);
        setPendingQueries(updatedPendingQueries);

        // Move to next query or close modal if no more queries
        if (updatedPendingQueries.length > 0) {
          const nextIndex = currentQueryIndex >= updatedPendingQueries.length ? 0 : currentQueryIndex;
          setCurrentQueryIndex(nextIndex);
          // Remove "AI Recommendation: ", "AI Recomendation: ", or "AI Response: " prefix from reply
          const cleanedReply = (updatedPendingQueries[nextIndex].query_reply || '').replace(/^AI\s+(Reco(m{1,2})endation|Response):\s*/i, '');
          setEditableReply(cleanedReply);
          setOriginalReply(cleanedReply);
          setIsReplyEdited(false);
        } else {
          showToast('All pending queries have been processed!', 'success');
          closePendingApprovalModal();
        }
      } else {
        showToast('Failed to send response. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      showToast('Error sending response. Please try again.', 'error');
    } finally {
      setIsSending(false);
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
      // Fetch Google Sheets config from backend
      const configResponse = await fetch('/api/config/google-sheets');
      const configResult = await configResponse.json();
      
      if (!configResult.success || !configResult.config) {
        throw new Error('Failed to fetch Google Sheets configuration');
      }
      
      const CSV_URL = configResult.config.csvUrls.USER_DATA;
      
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
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      // Parse dates properly to avoid timezone issues
      const [startYear, startMonth, startDay] = customStartDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = customEndDate.split('-').map(Number);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // If same date, show only once
      if (customStartDate === customEndDate) {
        return `${startDay} ${monthNames[startMonth - 1]} ${startYear.toString().slice(-2)}`;
      }
      
      return `${startDay} ${monthNames[startMonth - 1]} ${startYear.toString().slice(-2)} - ${endDay} ${monthNames[endMonth - 1]} ${endYear.toString().slice(-2)}`;
    }
    return dateRangeLabel;
  };

  // Helper function to convert Date to local YYYY-MM-DD string (no timezone conversion)
  const dateToLocalString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handleQuickSelect = (type) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let start, end, range, label;
    
    switch(type) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        range = 'today';
        label = 'Today';
        break;
      case 'yesterday':
        start = new Date(today);
        start.setDate(start.getDate() - 1);
        end = new Date(today);
        end.setDate(end.getDate() - 1);
        range = 'yesterday';
        label = 'Yesterday';
        break;
      case 'last7days':
        start = new Date(today);
        start.setDate(start.getDate() - 6); // Including today = 7 days
        end = new Date(today);
        range = 'last7days';
        label = 'Last 7 Days';
        break;
      case 'last30days':
        start = new Date(today);
        start.setDate(start.getDate() - 29); // Including today = 30 days
        end = new Date(today);
        range = 'last30days';
        label = 'Last 30 Days';
        break;
      case 'last90days':
        start = new Date(today);
        start.setDate(start.getDate() - 89); // Including today = 90 days
        end = new Date(today);
        range = 'last90days';
        label = 'Last 90 Days';
        break;
      case 'lastmonth':
        // Literal last month (e.g., if October, then September 1-30)
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
        range = 'lastmonth';
        label = 'Last Month';
        break;
      case 'alltime':
        // For all time, don't set dates - will show all data
        setDateRange('alltime');
        setDateRangeLabel('All Time');
        setCustomStartDate('');
        setCustomEndDate('');
        setTempStartDate(null);
        setTempEndDate(null);
        setShowDropdown(false);
        return;
      default:
        return;
    }
    
    setDateRange(range);
    setDateRangeLabel(label);
    setCustomStartDate(dateToLocalString(start));
    setCustomEndDate(dateToLocalString(end));
    setTempStartDate(start);
    setTempEndDate(end);
    setShowDropdown(false);
  };

  const handleCalendarDateClick = (date) => {
    // Normalize date to midnight
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(normalizedDate);
      setTempEndDate(null);
    } else {
      // Complete selection - ensure start is before end
      let finalStart = tempStartDate;
      let finalEnd = normalizedDate;
      
      if (normalizedDate < tempStartDate) {
        finalStart = normalizedDate;
        finalEnd = tempStartDate;
      }
      
      setTempStartDate(finalStart);
      setTempEndDate(finalEnd);
      
      // Apply the selection (both dates are inclusive)
      setCustomStartDate(dateToLocalString(finalStart));
      setCustomEndDate(dateToLocalString(finalEnd));
      setDateRange('custom');
      setDateRangeLabel('Custom Range');
      setShowDropdown(false);
    }
  };

  const handleResetCalendar = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setCustomStartDate('');
    setCustomEndDate('');
    setDateRange('alltime');
    setDateRangeLabel('Select Date Range');
    setShowDropdown(false);
  };

  const isDateInRange = (date) => {
    if (!tempStartDate) return false;
    if (!tempEndDate) return date.toDateString() === tempStartDate.toDateString();
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isDateRangeStart = (date) => {
    return tempStartDate && date.toDateString() === tempStartDate.toDateString();
  };

  const isDateRangeEnd = (date) => {
    return tempEndDate && date.toDateString() === tempEndDate.toDateString();
  };

  // Filter and search leads
  useEffect(() => {
    let filtered = [...leadData];

    // Apply date range filter first
    if (dateRange !== 'alltime' && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0); // Start of day
      
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // End of day (inclusive)
      
      filtered = filtered.filter(lead => {
        if (!lead.reg_timestamp) return false;
        const regDate = new Date(lead.reg_timestamp);
        return !isNaN(regDate.getTime()) && regDate >= startDate && regDate <= endDate;
      });
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => 
        (lead.source || '').toLowerCase() === sourceFilter.toLowerCase()
      );
    }

    // Apply payment status filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(lead => {
        const status = (lead.payment_status || '').toLowerCase().trim();
        
        // Map filter values to actual CSV values (support both old and new formats)
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

    // Apply column-specific filters
    Object.keys(columnFilters).forEach(column => {
      if (columnFilters[column] !== 'all') {
        filtered = filtered.filter(lead => {
          // Handle Mobile column
          if (column === 'Mobile') {
            const mobileValue = (lead.mobile || '').toString().toLowerCase().trim();
            const filterValue = columnFilters[column].toLowerCase().trim();
            return mobileValue === filterValue;
          }
          
          // Handle Registration_TS with date comparison
          if (column === 'Registration_TS') {
            if (!lead.reg_timestamp) return false;
            const leadDate = new Date(lead.reg_timestamp).toISOString().split('T')[0];
            return leadDate === columnFilters[column];
          }
          
          // Handle Nurture Level
          if (column === 'Nurture Level') {
            const value = (lead.nurturing || '').toString().toLowerCase().trim();
            const filterValue = columnFilters[column].toLowerCase().trim();
            return value === filterValue;
          }
          
          // Handle Coupon Code (G) - Given
          if (column === 'Coupon Code (G)') {
            const value = (lead.couponcode_given || '').toString().toLowerCase().trim();
            const filterValue = columnFilters[column].toLowerCase().trim();
            return value === filterValue;
          }
          
          // Handle Coupon Code (A) - Applied
          if (column === 'Coupon Code (A)') {
            const value = (lead.couponcode_applied || '').toString().toLowerCase().trim();
            const filterValue = columnFilters[column].toLowerCase().trim();
            return value === filterValue;
          }
          
          // Handle Unsubscribed
          if (column === 'Unsubscribed') {
            const leadVal = lead.Unsubscribed;
            let normalizedLeadVal = '';
            if (leadVal === true || leadVal === 'true' || leadVal === 'Yes') normalizedLeadVal = 'yes';
            else if (leadVal === false || leadVal === 'false' || leadVal === 'No') normalizedLeadVal = 'no';
            else normalizedLeadVal = (leadVal || '').toString().toLowerCase().trim();
            
            const filterValue = columnFilters[column].toLowerCase().trim();
            return normalizedLeadVal === filterValue;
          }
          
          // Handle Status column - filter by payment status
          if (column === 'Status') {
            const paymentStatus = (lead.payment_status || '').toLowerCase().trim();
            const filterValue = columnFilters[column].toLowerCase().trim();
            
            // Map payment statuses to filter values
            if (filterValue === 'success') {
              return paymentStatus === 'success' || paymentStatus === 'successful' || 
                     paymentStatus === 'paid' || paymentStatus === 'completed';
            } else if (filterValue === 'failed') {
              return paymentStatus === 'failed' || paymentStatus === 'failure' || 
                     paymentStatus === 'declined';
            } else if (filterValue === 'need time to confirm') {
              return paymentStatus.includes('need time') || paymentStatus === 'need time to confirm';
            } else if (filterValue === 'not attempted') {
              return !paymentStatus || paymentStatus === '' || paymentStatus === 'pending' || 
                     paymentStatus === 'not attempted';
            }
            return false;
          }
          
          const value = (lead[column] || '').toString().toLowerCase().trim();
          const filterValue = columnFilters[column].toLowerCase().trim();
          return value === filterValue;
        });
      }
    });

    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead => 
        (lead.name || '').toLowerCase().includes(query) ||
        (lead.email || '').toLowerCase().includes(query) ||
        (lead.mobile || '').toLowerCase().includes(query)
      );
    }

    setFilteredLeads(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [leadData, dateRange, customStartDate, customEndDate, sourceFilter, paymentFilter, searchQuery, columnFilters]);

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredLeads].sort((a, b) => {
      // Handle Mobile column
      let aVal, bVal;
      if (key === 'Mobile') {
        aVal = a.mobile || '';
        bVal = b.mobile || '';
      } else if (key === 'Nurture Level') {
        // Handle Nurture Level
        aVal = a.nurturing || '';
        bVal = b.nurturing || '';
      } else if (key === 'Coupon Code (G)') {
        // Handle Coupon Code (G) - Given
        aVal = a.couponcode_given || '';
        bVal = b.couponcode_given || '';
      } else if (key === 'Coupon Code (A)') {
        // Handle Coupon Code (A) - Applied
        aVal = a.couponcode_applied || '';
        bVal = b.couponcode_applied || '';
      } else if (key === 'Payable') {
        // Handle Payable - numeric sorting
        const aPayable = a.payable_amt || '0';
        const bPayable = b.payable_amt || '0';
        aVal = typeof aPayable === 'string' ? parseFloat(aPayable.replace(/[₹,]/g, '').trim()) || 0 : parseFloat(aPayable) || 0;
        bVal = typeof bPayable === 'string' ? parseFloat(bPayable.replace(/[₹,]/g, '').trim()) || 0 : parseFloat(bPayable) || 0;
      } else if (key === 'Paid Amount') {
        // Handle Paid Amount - numeric sorting
        const aPaid = a.paid_amt || '0';
        const bPaid = b.paid_amt || '0';
        aVal = typeof aPaid === 'string' ? parseFloat(aPaid.replace(/[₹,]/g, '').trim()) || 0 : parseFloat(aPaid) || 0;
        bVal = typeof bPaid === 'string' ? parseFloat(bPaid.replace(/[₹,]/g, '').trim()) || 0 : parseFloat(bPaid) || 0;
      } else if (key === 'Discount %') {
        // Handle Discount % - numeric sorting
        const aDiscount = a.discount_percentage || '0';
        const bDiscount = b.discount_percentage || '0';
        aVal = typeof aDiscount === 'string' ? parseFloat(aDiscount.replace(/%/g, '').trim()) || 0 : parseFloat(aDiscount) || 0;
        bVal = typeof bDiscount === 'string' ? parseFloat(bDiscount.replace(/%/g, '').trim()) || 0 : parseFloat(bDiscount) || 0;
      } else if (key === 'Discount Amount') {
        // Handle Discount Amount - numeric sorting
        const aDiscountAmt = a.discount_amt || '0';
        const bDiscountAmt = b.discount_amt || '0';
        aVal = typeof aDiscountAmt === 'string' ? parseFloat(aDiscountAmt.replace(/[₹,]/g, '').trim()) || 0 : parseFloat(aDiscountAmt) || 0;
        bVal = typeof bDiscountAmt === 'string' ? parseFloat(bDiscountAmt.replace(/[₹,]/g, '').trim()) || 0 : parseFloat(bDiscountAmt) || 0;
      } else {
        aVal = a[key] || '';
        bVal = b[key] || '';
      }

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
  const uniqueSources = [...new Set(leadData.map(lead => lead.source).filter(Boolean))];

  // Get unique values for a column
  const getUniqueValuesForColumn = (columnName) => {
    if (columnName === 'Mobile') {
      // Handle Mobile
      return [...new Set(leadData.map(lead => lead.mobile).filter(Boolean))].sort();
    }
    // For Registration_TS, extract unique dates (not timestamps)
    if (columnName === 'Registration_TS') {
      const dates = leadData
        .map(lead => lead.reg_timestamp)
        .filter(Boolean)
        .map(timestamp => {
          const date = new Date(timestamp);
          return date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        });
      return [...new Set(dates)].sort().reverse(); // Most recent first
    }
    // Handle Nurture Level
    if (columnName === 'Nurture Level') {
      return [...new Set(leadData.map(lead => lead.nurturing).filter(Boolean))].sort();
    }
    // Handle Coupon Code (G) - Given
    if (columnName === 'Coupon Code (G)') {
      return [...new Set(leadData.map(lead => lead.couponcode_given).filter(Boolean))].sort();
    }
    // Handle Coupon Code (A) - Applied
    if (columnName === 'Coupon Code (A)') {
      return [...new Set(leadData.map(lead => lead.couponcode_applied).filter(Boolean))].sort();
    }
    // Handle Unsubscribed
    if (columnName === 'Unsubscribed') {
      return [...new Set(leadData.map(lead => {
        const val = lead.Unsubscribed;
        if (val === true || val === 'true' || val === 'Yes') return 'Yes';
        if (val === false || val === 'false' || val === 'No') return 'No';
        return val;
      }).filter(Boolean))].sort();
    }
    return [...new Set(leadData.map(lead => lead[columnName]).filter(Boolean))].sort();
  };

  // Toggle column visibility
  const toggleColumn = (columnName) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnName]: !prev[columnName]
    }));
  };

  // Update column filter
  const handleColumnFilter = (columnName, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  // Reset all column filters and restore default view
  const resetColumnFilters = () => {
    // Reset all column filters to 'all'
    const resetFilters = {};
    Object.keys(columnFilters).forEach(col => {
      resetFilters[col] = 'all';
    });
    setColumnFilters(resetFilters);
    
    // Reset to default visible columns (first-time view)
    setVisibleColumns({
      name: true,
      mobile: true,
      email: true,
      role: true,
      client_status: true,
      nurturing: true,
      payment_status: false,
      source: false,
      reg_timestamp: false,
      payable_amt: false,
      paid_amt: false,
      discount_percentage: false,
      discount_amt: false,
      couponcode_given: false,
      couponcode_applied: false,
      txn_id: false,
      txn_timestamp: false,
      currency: false
    });
    
    // Reset search and filters
    setSearchQuery('');
    setSourceFilter('all');
    setPaymentFilter('all');
    
    // Reset sorting
    setSortConfig({ key: null, direction: 'asc' });
    
    // Reset pagination
    setCurrentPage(1);
    setItemsPerPage(25);
    
    // Close advanced filters panel
    setShowAdvancedSelection(false);
  };

  // Download CSV function
  const downloadCSV = () => {
    if (filteredLeads.length === 0) {
      showToast('No data to download', 'warning');
      return;
    }

    // Get all possible column names from the data
    const allColumns = Object.keys(filteredLeads[0] || {});
    
    // Filter to only visible columns
    const columnsToExport = allColumns.filter(col => visibleColumns[col] !== false);
    
    // Create CSV header
    const headers = columnsToExport.join(',');
    
    // Create CSV rows
    const rows = filteredLeads.map(lead => {
      return columnsToExport.map(col => {
        let value = lead[col] || '';
        // Escape quotes and wrap in quotes if contains comma or newline
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      }).join(',');
    }).join('\n');
    
    // Combine header and rows
    const csv = headers + '\n' + rows;
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `leads_export_${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  // Get Status display with color-coded amount
  const getStatusDisplay = (lead) => {
    const paymentStatus = (lead.payment_status || '').toLowerCase().trim();
    
    // Get the payable amount
    let amountValue = lead.payable_amt || '0';
    
    // Clean amount string
    const amountStr = String(amountValue).replace(/[₹$,\s]/g, '');
    const amount = parseFloat(amountStr) || 0;
    const formattedAmount = `₹${amount.toFixed(2)}`;
    
    // Determine color based on payment status
    let color, statusText;
    
    if (paymentStatus === 'success' || paymentStatus === 'successful' || 
        paymentStatus === 'paid' || paymentStatus === 'completed') {
      // Green for successfully paid
      color = '#10b981'; // green
      statusText = 'Paid';
    } else if (paymentStatus.includes('need time') || paymentStatus === 'need time to confirm' || 
               paymentStatus === 'failed' || paymentStatus === 'failure' || paymentStatus === 'declined') {
      // Orange for need time or payment failed
      color = '#f59e0b'; // orange
      statusText = paymentStatus.includes('need time') ? 'Need Time' : 'Failed';
    } else {
      // Red for not paid or not even tried
      color = '#ef4444'; // red
      statusText = 'Pending';
    }
    
    return { amount: formattedAmount, color, statusText };
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
    if (dateRange === 'alltime') return leadData;
    
    // For all ranges including custom, use customStartDate and customEndDate
    if (!customStartDate || !customEndDate) return leadData;
    
    const startDate = new Date(customStartDate);
    startDate.setHours(0, 0, 0, 0); // Start of day
    
    const endDate = new Date(customEndDate);
    endDate.setHours(23, 59, 59, 999); // End of day (inclusive)
    
    return leadData.filter(lead => {
      if (!lead.reg_timestamp) return false;
      const regDate = new Date(lead.reg_timestamp);
      return !isNaN(regDate.getTime()) && regDate >= startDate && regDate <= endDate;
    });
  };

  // Calculate dashboard metrics from date-filtered leads
  const dateFilteredMetrics = useMemo(() => {
    const dateFilteredLeads = getFilteredLeadData();
    
    // Calculate total leads
    const totalLeads = dateFilteredLeads.length;
    
    // Calculate total revenue from successful payments
    const totalRevenue = dateFilteredLeads.reduce((sum, lead) => {
      const status = (lead.payment_status || '').toLowerCase().trim();
      const isSuccess = status === 'success' || status === 'successful' || status === 'paid' || status === 'completed';
      if (isSuccess) {
        // Get paid amount
        let amountValue = lead.paid_amt || '0';
        
        // Clean amount string - remove currency symbols, commas, and whitespace
        const amountStr = String(amountValue).replace(/[₹$,\s]/g, '');
        const amount = parseFloat(amountStr) || 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }
      return sum;
    }, 0);
    
    // Calculate conversion rate (successful payments / total leads * 100)
    const successfulPayments = dateFilteredLeads.filter(lead => {
      const status = (lead.payment_status || '').toLowerCase().trim();
      return status === 'success' || status === 'successful' || status === 'paid' || status === 'completed';
    }).length;
    const conversionRate = totalLeads > 0 ? ((successfulPayments / totalLeads) * 100).toFixed(1) : 0;
    
    // Calculate engagement - percentage of engaged leads
    // (leads whose Client Status is NOT "Unsubscribed" are considered engaged)
    const engagedLeads = dateFilteredLeads.filter(lead => {
      const clientStatus = (lead.client_status || '').toLowerCase().trim();
      // Check if client status is unsubscribed
      if (clientStatus === 'unsubscribed' || clientStatus === 'un-subscribed' || 
          clientStatus === 'unsubscribe' || clientStatus === 'inactive') {
        return false; // This lead is unsubscribed, not engaged
      }
      return true; // All other leads are considered engaged
    }).length;
    const engagement = totalLeads > 0 ? ((engagedLeads / totalLeads) * 100).toFixed(1) : 0;
    
    // Calculate payment stats
    const paymentStats = {
      successful: dateFilteredLeads.filter(lead => {
        const status = (lead.payment_status || '').toLowerCase().trim();
        return status === 'success' || status === 'successful' || status === 'paid' || status === 'completed';
      }).length,
      pending: dateFilteredLeads.filter(lead => {
        const status = (lead.payment_status || '').toLowerCase().trim();
        return status === '' || status === 'pending' || status === 'processing';
      }).length,
      failed: dateFilteredLeads.filter(lead => {
        const status = (lead.payment_status || '').toLowerCase().trim();
        return status === 'failed' || status === 'failure' || status === 'declined';
      }).length
    };
    
    // Calculate funnel stats
    const funnel = {
      leads: totalLeads,
      registered: totalLeads, // All leads are registered
      paid: successfulPayments,
      completed: successfulPayments // Same as paid for now
    };
    
    // Calculate average revenue per successful payment
    const avgRevenue = successfulPayments > 0 ? (totalRevenue / successfulPayments) : 0;
    
    return {
      totalLeads,
      totalRevenue: totalRevenue.toFixed(2),
      avgRevenue: avgRevenue.toFixed(2),
      conversionRate,
      engagement,
      paymentStats,
      funnel
    };
  }, [leadData, dateRange, customStartDate, customEndDate]);

  // Process chart data when filtered data changes
  useEffect(() => {
    if (leadData.length === 0) return;

    // Get date-filtered data for charts
    const dateFilteredLeads = getFilteredLeadData();
    
    // Process Registration Trend Data (based on selected time period)
    let trendData;
    
    // Check if we should use hourly breakdown (single day = 24 hours)
    let useHourlyBreakdown = false;
    
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      // Use hourly breakdown for single day selections
      if (daysDiff === 0) {
        useHourlyBreakdown = true;
      }
    }
    
    if (useHourlyBreakdown) {
      // For single day, show all 24 hours (12 AM to 12 AM next day)
      const hourlyData = [];
      const registrationCounts = {};
      
      let startTime;
      // Start from customStartDate at midnight
      startTime = new Date(customStartDate);
      startTime.setHours(0, 0, 0, 0);
      
      // Initialize all 24 hours (0-23)
      for (let hour = 0; hour < 24; hour++) {
        const hourDate = new Date(startTime);
        hourDate.setHours(hour, 0, 0, 0);
        const hourKey = hourDate.toISOString().slice(0, 13); // YYYY-MM-DDTHH
        hourlyData.push({ hour, hourKey, hourDate });
        registrationCounts[hourKey] = 0;
      }
      
      // Count registrations per hour from date-filtered data
      dateFilteredLeads.forEach(lead => {
        if (lead.reg_timestamp) {
          const regDate = new Date(lead.reg_timestamp);
          const hourKey = regDate.toISOString().slice(0, 13); // YYYY-MM-DDTHH
          if (registrationCounts.hasOwnProperty(hourKey)) {
            registrationCounts[hourKey]++;
          }
        }
      });
      
      trendData = {
        labels: hourlyData.map((item) => {
          const hours = item.hour;
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          
          // Show all hours for single day view
          return `${displayHours}${ampm}`;
        }),
        datasets: [
          {
            label: 'Registrations',
            data: hourlyData.map(item => registrationCounts[item.hourKey]),
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
    } else {
      // For other time periods, show daily or monthly breakdown
      const dateLabels = [];
      const registrationCounts = {};
      
      if (!customStartDate || !customEndDate) {
        // No date range selected (All Time), show all 12 months
        const currentYear = new Date().getFullYear();
        const monthlyData = {};
        
        // Initialize all 12 months with 0
        for (let month = 1; month <= 12; month++) {
          const monthKey = `${currentYear}-${String(month).padStart(2, '0')}`;
          monthlyData[monthKey] = 0;
        }
        
        // Group all leads by month (only current year)
        dateFilteredLeads.forEach(lead => {
          if (lead.reg_timestamp) {
            const regDate = new Date(lead.reg_timestamp);
            if (regDate.getFullYear() === currentYear) {
              const monthKey = `${regDate.getFullYear()}-${String(regDate.getMonth() + 1).padStart(2, '0')}`;
              if (monthlyData[monthKey] !== undefined) {
                monthlyData[monthKey]++;
              }
            }
          }
        });
        
        // Get all months in order (Jan to Dec)
        const allMonths = Object.keys(monthlyData).sort();
        
        trendData = {
          labels: allMonths.map(monthKey => {
            const [year, month] = monthKey.split('-');
            const date = new Date(year, parseInt(month) - 1, 1);
            return date.toLocaleString('default', { month: 'short' });
          }),
          datasets: [{
            label: 'Registrations',
            data: allMonths.map(monthKey => monthlyData[monthKey]),
            borderColor: 'rgba(139, 92, 246, 1)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgba(139, 92, 246, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }]
        };
      } else {
        // Use customStartDate and customEndDate for all ranges
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        const daysToShow = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        // Initialize date range from start to end (inclusive)
        for (let i = 0; i < daysToShow; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          dateLabels.push(dateStr);
          registrationCounts[dateStr] = 0;
        }
        
        // Count registrations per day from date-filtered data
        dateFilteredLeads.forEach(lead => {
          if (lead.reg_timestamp) {
            const regDate = new Date(lead.reg_timestamp);
            const dateStr = regDate.toISOString().split('T')[0];
            if (registrationCounts.hasOwnProperty(dateStr)) {
              registrationCounts[dateStr]++;
            }
          }
        });

        trendData = {
          labels: dateLabels.map(date => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }),
          datasets: [
            {
              label: 'Registrations',
              data: dateLabels.map(date => registrationCounts[date]),
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
      }
    }

    setRegistrationTrendData(trendData);

    // Process Lead Sources Data from date-filtered data
    const sourceCounts = {};
    dateFilteredLeads.forEach(lead => {
      const source = lead.source || 'Unknown';
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

    // Process Role Distribution Data (Donut Chart) from date-filtered data
    // Always include these 4 primary roles even if count is 0
    const primaryRoles = ['Entrepreneur', 'Student', 'Faculty', 'Industry Professional'];
    const roleCounts = {};
    
    // Initialize primary roles with 0
    primaryRoles.forEach(role => {
      roleCounts[role] = 0;
    });
    
    let totalCount = 0;
    
    dateFilteredLeads.forEach(lead => {
      const role = lead.role || 'Unknown';
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
        'Faculty': { bg: 'rgba(72, 207, 173, 0.9)', border: 'rgba(72, 207, 173, 1)' }, // Vibrant Teal
        'Industry Professional': { bg: 'rgba(142, 124, 255, 0.9)', border: 'rgba(142, 124, 255, 1)' }, // Vibrant Purple
        'Freelancer': { bg: 'rgba(129, 236, 236, 0.9)', border: 'rgba(129, 236, 236, 1)' }, // Vibrant Turquoise
        'Entrepreneur': { bg: 'rgba(255, 159, 67, 0.9)', border: 'rgba(255, 159, 67, 1)' }, // Vibrant Orange
        'Other': { bg: 'rgba(255, 121, 198, 0.9)', border: 'rgba(255, 121, 198, 1)' } // Vibrant Magenta Pink
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
  }, [leadData, dateRange, customStartDate, customEndDate, sourceFilter, paymentFilter, searchQuery, columnFilters]);

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
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out',
            minWidth: '300px',
            maxWidth: '400px',
            overflow: 'hidden'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            gap: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: toastMessage.type === 'success' ? '#10b981' : toastMessage.type === 'error' ? '#ef4444' : toastMessage.type === 'warning' ? '#f59e0b' : '#3b82f6',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {toastMessage.type === 'success' ? '✓' : toastMessage.type === 'error' ? '✕' : toastMessage.type === 'warning' ? '⚠' : 'ℹ'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#1f2937',
                fontSize: '14px',
                fontWeight: '500',
                lineHeight: '1.4'
              }}>
                {toastMessage.message}
              </div>
            </div>
            <button
              onClick={dismissToast}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#9ca3af',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              ×
            </button>
          </div>
          <div style={{
            height: '4px',
            backgroundColor: toastMessage.type === 'success' ? '#10b981' : toastMessage.type === 'error' ? '#ef4444' : toastMessage.type === 'warning' ? '#f59e0b' : '#3b82f6',
            animation: 'shrink 4s linear'
          }}></div>
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
          {/* Settings Button */}
          <button 
            onClick={() => navigate('/admin/settings')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7c3aed';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#8b5cf6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>
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
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                zIndex: 1000,
                display: 'flex',
                minWidth: '600px'
              }}>
                {/* Left side - Quick select options */}
                <div style={{
                  borderRight: '1px solid var(--border)',
                  padding: '1rem',
                  minWidth: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => handleQuickSelect('today')}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.375rem',
                      fontSize: '0.95rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleQuickSelect('yesterday')}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.375rem',
                      fontSize: '0.95rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Yesterday
                  </button>
                  <button
                    onClick={() => handleQuickSelect('lastmonth')}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.375rem',
                      fontSize: '0.95rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Last month
                  </button>
                  <button
                    onClick={() => handleQuickSelect('last7days')}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.375rem',
                      fontSize: '0.95rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Last 7 days
                  </button>
                  <button
                    onClick={() => handleQuickSelect('last30days')}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.375rem',
                      fontSize: '0.95rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Last 30 days
                  </button>
                  <button
                    onClick={() => handleQuickSelect('last90days')}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.375rem',
                      fontSize: '0.95rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Last 90 days
                  </button>
                  <button
                    onClick={() => handleQuickSelect('alltime')}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.375rem',
                      fontSize: '0.95rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    All time
                  </button>
                  <button
                    onClick={handleResetCalendar}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      color: 'rgb(59, 130, 246)',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '0.375rem',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      marginTop: 'auto',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Reset
                  </button>
                </div>

                {/* Right side - Calendar */}
                <div style={{ padding: '1rem', flex: 1 }}>
                  {/* Calendar Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)'
                    }}>
                      {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          const newMonth = new Date(calendarMonth);
                          newMonth.setMonth(newMonth.getMonth() - 1);
                          setCalendarMonth(newMonth);
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '1.25rem',
                          lineHeight: '1'
                        }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => {
                          const newMonth = new Date(calendarMonth);
                          newMonth.setMonth(newMonth.getMonth() + 1);
                          setCalendarMonth(newMonth);
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '1.25rem',
                          lineHeight: '1'
                        }}
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  {/* Weekday Headers */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.25rem',
                    marginBottom: '0.5rem'
                  }}>
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                      <div key={day} style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: 'var(--text-secondary)',
                        padding: '0.5rem 0'
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.25rem'
                  }}>
                    {(() => {
                      const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(calendarMonth);
                      const days = [];
                      const today = new Date();
                      
                      // Adjust for Monday start (0 = Monday, 6 = Sunday)
                      const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
                      
                      // Empty cells for days before month starts
                      for (let i = 0; i < adjustedStart; i++) {
                        days.push(<div key={`empty-${i}`} style={{ padding: '0.5rem' }}></div>);
                      }
                      
                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day);
                        const isToday = date.toDateString() === today.toDateString();
                        const inRange = isDateInRange(date);
                        const isStart = isDateRangeStart(date);
                        const isEnd = isDateRangeEnd(date);
                        const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        
                        days.push(
                          <button
                            key={day}
                            onClick={() => handleCalendarDateClick(date)}
                            style={{
                              padding: '0.5rem',
                              textAlign: 'center',
                              backgroundColor: (isStart || isEnd) ? 'rgb(59, 130, 246)' : 
                                              inRange ? 'rgba(59, 130, 246, 0.2)' :
                                              'transparent',
                              color: (isStart || isEnd) ? 'white' : 
                                     isPast ? 'var(--text-secondary)' : 'var(--text-primary)',
                              border: isToday && !isStart && !isEnd ? '2px solid rgb(59, 130, 246)' : 'none',
                              borderRadius: '50%',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: (isStart || isEnd) ? '600' : isToday ? '500' : '400',
                              transition: 'all 0.2s',
                              width: '36px',
                              height: '36px'
                            }}
                            onMouseEnter={(e) => {
                              if (!isStart && !isEnd && !inRange) {
                                e.currentTarget.style.backgroundColor = 'var(--surface-light)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isStart && !isEnd && !inRange) {
                                e.currentTarget.style.backgroundColor = (isStart || isEnd) ? 'rgb(59, 130, 246)' : 
                                                                        inRange ? 'rgba(59, 130, 246, 0.2)' : 'transparent';
                              }
                            }}
                          >
                            {day}
                          </button>
                        );
                      }
                      
                      return days;
                    })()}
                  </div>
                  
                  {/* Date Selection Display */}
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: '1.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>From</span>
                      <span style={{ marginLeft: '0.5rem', marginRight: '0.25rem' }}>|</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                        {tempStartDate ? tempStartDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : '___'}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>To</span>
                      <span style={{ marginLeft: '0.5rem', marginRight: '0.25rem' }}>|</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                        {tempEndDate ? tempEndDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : '___'}
                      </span>
                    </div>
                  </div>
                </div>
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
                      'Faculty': 'rgba(72, 207, 173, 1)',
                      'Industry Professional': 'rgba(142, 124, 255, 1)',
                      'Freelancer': 'rgba(129, 236, 236, 1)',
                      'Entrepreneur': 'rgba(255, 159, 67, 1)',
                      'Other': 'rgba(255, 121, 198, 1)'
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
              {(() => {
                const successful = dateFilteredMetrics.paymentStats.successful;
                const pending = dateFilteredMetrics.paymentStats.pending;
                const failed = dateFilteredMetrics.paymentStats.failed;
                const total = successful + pending + failed;
                
                // Calculate dynamic percentages with minimum 5% for each category
                const minPercent = 5;
                let successPercent, pendingPercent, failedPercent;
                
                if (total === 0) {
                  // All empty - equal distribution
                  successPercent = 33.33;
                  pendingPercent = 33.33;
                  failedPercent = 33.34;
                } else {
                  // Count how many categories have data
                  const hasSuccessful = successful > 0;
                  const hasPending = pending > 0;
                  const hasFailed = failed > 0;
                  const activeCategories = [hasSuccessful, hasPending, hasFailed].filter(Boolean).length;
                  
                  if (activeCategories === 0) {
                    // No data - equal distribution
                    successPercent = 33.33;
                    pendingPercent = 33.33;
                    failedPercent = 33.34;
                  } else if (activeCategories === 1) {
                    // Only one category has data - give it 90%, others 5% each
                    successPercent = hasSuccessful ? 90 : 5;
                    pendingPercent = hasPending ? 90 : 5;
                    failedPercent = hasFailed ? 90 : 5;
                  } else if (activeCategories === 2) {
                    // Two categories have data - split 95% between them, other gets 5%
                    const availablePercent = 95;
                    const category1Ratio = hasSuccessful ? successful : (hasPending ? pending : 0);
                    const category2Ratio = hasFailed ? failed : pending;
                    const totalRatio = category1Ratio + category2Ratio;
                    
                    if (hasSuccessful && hasPending) {
                      successPercent = (successful / totalRatio) * availablePercent;
                      pendingPercent = (pending / totalRatio) * availablePercent;
                      failedPercent = 5;
                    } else if (hasSuccessful && hasFailed) {
                      successPercent = (successful / totalRatio) * availablePercent;
                      failedPercent = (failed / totalRatio) * availablePercent;
                      pendingPercent = 5;
                    } else {
                      // pending and failed
                      pendingPercent = (pending / totalRatio) * availablePercent;
                      failedPercent = (failed / totalRatio) * availablePercent;
                      successPercent = 5;
                    }
                  } else {
                    // All three categories have data - distribute proportionally with min 5% each
                    const rawSuccessPercent = (successful / total) * 100;
                    const rawPendingPercent = (pending / total) * 100;
                    const rawFailedPercent = (failed / total) * 100;
                    
                    // Check if any category is below minimum
                    const needsAdjustment = rawSuccessPercent < minPercent || rawPendingPercent < minPercent || rawFailedPercent < minPercent;
                    
                    if (needsAdjustment) {
                      // Calculate available percentage after reserving minimums
                      const reservedPercent = 
                        (rawSuccessPercent < minPercent ? minPercent : 0) +
                        (rawPendingPercent < minPercent ? minPercent : 0) +
                        (rawFailedPercent < minPercent ? minPercent : 0);
                      
                      const availablePercent = 100 - reservedPercent;
                      
                      // Distribute available percentage proportionally among categories above minimum
                      const totalAboveMin = 
                        (rawSuccessPercent >= minPercent ? successful : 0) +
                        (rawPendingPercent >= minPercent ? pending : 0) +
                        (rawFailedPercent >= minPercent ? failed : 0);
                      
                      successPercent = rawSuccessPercent < minPercent ? minPercent : (successful / totalAboveMin) * availablePercent;
                      pendingPercent = rawPendingPercent < minPercent ? minPercent : (pending / totalAboveMin) * availablePercent;
                      failedPercent = rawFailedPercent < minPercent ? minPercent : (failed / totalAboveMin) * availablePercent;
                    } else {
                      successPercent = rawSuccessPercent;
                      pendingPercent = rawPendingPercent;
                      failedPercent = rawFailedPercent;
                    }
                  }
                }
                
                return (
                  <>
                    <span 
                      style={{ 
                        width: `${successPercent}%`, 
                        backgroundColor: 'var(--success)',
                        transition: 'width 0.3s ease'
                      }}
                      title={`Successful: ${successPercent.toFixed(1)}%`}
                    ></span>
                    <span 
                      style={{ 
                        width: `${pendingPercent}%`, 
                        backgroundColor: 'var(--warning)',
                        transition: 'width 0.3s ease'
                      }}
                      title={`Pending: ${pendingPercent.toFixed(1)}%`}
                    ></span>
                    <span 
                      style={{ 
                        width: `${failedPercent}%`, 
                        backgroundColor: 'var(--error)',
                        transition: 'width 0.3s ease'
                      }}
                      title={`Failed: ${failedPercent.toFixed(1)}%`}
                    ></span>
                  </>
                );
              })()}
            </div>
            <div className="flex justify-between" style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              <span>✓ Successful: {dateFilteredMetrics.paymentStats.successful}</span>
              <span>⏳ Pending: {dateFilteredMetrics.paymentStats.pending}</span>
              <span>✗ Failed: {dateFilteredMetrics.paymentStats.failed}</span>
            </div>
          </section>

          {/* Query Analytics Panel */}
          <section className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0' }}>
                Query Analytics
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate('/admin/query-details')}
                  title="Query Details"
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M3 9H21M3 15H21M9 9L9 20M15 9L15 20M6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.0799 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.07989 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                  </svg>
                </button>
                <button
                  onClick={() => {
                    openPendingApprovalModal();
                  }}
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
                  ⏳ Pending Approval
                </button>
              </div>
            </div>
            
            {/* Ticket Statistics */}
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <div style={{ flex: '1', textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--warning)', marginBottom: '0.25rem' }}>
                  {ticketData.open}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Open</p>
              </div>
              <div style={{ width: '1px', height: '3rem', backgroundColor: 'var(--border)' }}></div>
              <div style={{ flex: '1', textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.25rem' }}>
                  {ticketData.aiProcessed}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Processed</p>
              </div>
              <div style={{ width: '1px', height: '3rem', backgroundColor: 'var(--border)' }}></div>
              <div style={{ flex: '1', textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)', marginBottom: '0.25rem' }}>
                  {ticketData.closed}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Closed</p>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div style={{ marginTop: '1rem' }}>
              <div className="flex" style={{ height: '2rem', borderRadius: '0.5rem', overflow: 'hidden' }}>
                {(() => {
                  const open = ticketData.open;
                  const closed = ticketData.closed;
                  const total = ticketData.total;
                  
                  // Calculate dynamic percentages with minimum 5% for each category
                  const minPercent = 5;
                  let openPercent, closedPercent;
                  
                  if (total === 0) {
                    // No tickets - equal distribution
                    openPercent = 50;
                    closedPercent = 50;
                  } else if (open === 0 && closed === 0) {
                    // Edge case: no tickets but total exists
                    openPercent = 50;
                    closedPercent = 50;
                  } else if (open === 0) {
                    // Only closed tickets
                    openPercent = 5;
                    closedPercent = 95;
                  } else if (closed === 0) {
                    // Only open tickets
                    openPercent = 95;
                    closedPercent = 5;
                  } else {
                    // Both have tickets - distribute proportionally with min 5% each
                    const rawOpenPercent = (open / total) * 100;
                    const rawClosedPercent = (closed / total) * 100;
                    
                    if (rawOpenPercent < minPercent) {
                      openPercent = minPercent;
                      closedPercent = 100 - minPercent;
                    } else if (rawClosedPercent < minPercent) {
                      closedPercent = minPercent;
                      openPercent = 100 - minPercent;
                    } else {
                      openPercent = rawOpenPercent;
                      closedPercent = rawClosedPercent;
                    }
                  }
                  
                  return (
                    <>
                      <div 
                        style={{ 
                          width: `${openPercent}%`,
                          backgroundColor: 'var(--warning)',
                          transition: 'width 0.3s ease'
                        }}
                        title={`Open: ${openPercent.toFixed(1)}%`}
                      ></div>
                      <div 
                        style={{ 
                          width: `${closedPercent}%`,
                          backgroundColor: 'var(--success)',
                          transition: 'width 0.3s ease'
                        }}
                        title={`Resolved: ${closedPercent.toFixed(1)}%`}
                      ></div>
                    </>
                  );
                })()}
              </div>
              <div className="flex justify-between" style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>
                  ⚠️ Open: {ticketData.open} ({ticketData.total > 0 ? ((ticketData.open / ticketData.total) * 100).toFixed(1) : 0}%)
                </span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  Total Tickets: {ticketData.total}
                </span>
                <span>
                  ✓ Resolved: {ticketData.closed} ({ticketData.total > 0 ? ((ticketData.closed / ticketData.total) * 100).toFixed(1) : 0}%)
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
                  ₹{dateFilteredMetrics.totalRevenue}
                </p>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '0.5rem' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Average Revenue</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0' }}>
                  ₹{dateFilteredMetrics.avgRevenue}
                </p>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '0.5rem' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Conversion Rate</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0' }}>
                  {dateFilteredMetrics.conversionRate}%
                </p>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--surface-light)', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '0.5rem' }}>
                <h3 style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Engagement</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0' }}>
                  {dateFilteredMetrics.engagement}%
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
                Leads ({dateFilteredMetrics.funnel.leads})
              </div>
              <div style={{ width: '70%', height: '3rem', backgroundColor: 'var(--primary)', opacity: '0.85', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)' }}>
                Registered ({dateFilteredMetrics.funnel.registered})
              </div>
              <div style={{ width: '55%', height: '3rem', backgroundColor: 'var(--primary)', opacity: '0.7', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)' }}>
                Paid ({dateFilteredMetrics.funnel.paid})
              </div>
              <div style={{ width: '40%', height: '3rem', backgroundColor: 'var(--primary)', opacity: '0.55', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: '600', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)' }}>
                Completed ({dateFilteredMetrics.funnel.completed})
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
              Registration Trend ({getDateRangeLabel()})
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
      </section>

        {/* Lead Details Table Section */}
        <section className="card mt-6 p-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Lead Details
            </h3>
            
            {/* Right side actions - Search, Filters, Reset, Download */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search leads by name, email, or mobile..."
                  className="form-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '0.625rem 1rem',
                    paddingLeft: '2.5rem',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    border: '2px solid rgb(139, 92, 246)',
                    borderRadius: '0.5rem',
                    width: '20rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxShadow: searchQuery ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2)';
                    e.target.style.borderColor = 'rgb(139, 92, 246)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = searchQuery ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none';
                  }}
                />
                {/* Search Icon */}
                <svg
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    width: '1rem',
                    height: '1rem',
                    color: 'rgb(139, 92, 246)',
                    pointerEvents: 'none'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {/* Clear button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: 'rgb(139, 92, 246)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Clear search"
                  >
                    <svg
                      style={{ width: '1rem', height: '1rem' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Advanced Filters Toggle Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'rgb(139, 92, 246)',
                border: '1px solid rgb(139, 92, 246)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'white',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)'
              }}>
                <span>Advanced Filters</span>
                
                {/* Toggle Switch */}
                <div
                  onClick={() => setShowAdvancedSelection(!showAdvancedSelection)}
                  style={{
                    position: 'relative',
                    width: '48px',
                    height: '24px',
                    backgroundColor: showAdvancedSelection ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: showAdvancedSelection ? '24px' : '2px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.3s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </div>
              </div>
              
              {/* Reset Filters Button */}
              <button
                onClick={resetColumnFilters}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--warning)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                title="Reset all filters"
              >
                Reset Filters
              </button>
              
              {/* Download CSV Button */}
              <button
                onClick={downloadCSV}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                title="Download filtered data as CSV"
              >
                Download CSV
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedSelection && (
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{ 
                fontSize: '0.95rem', 
                fontWeight: '600', 
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                Column Selection
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '0.75rem' 
              }}>
                {Object.keys(visibleColumns).map(column => {
                  return (
                    <div 
                      key={column}
                      style={{ 
                        padding: '0.5rem 0.75rem',
                        backgroundColor: visibleColumns[column] ? 'rgba(59, 130, 246, 0.08)' : 'var(--surface-light)',
                        borderRadius: '0.375rem',
                        border: visibleColumns[column] ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid var(--border)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={visibleColumns[column]}
                          onChange={() => toggleColumn(column)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ 
                          fontSize: '0.875rem', 
                          color: 'var(--text-primary)',
                          fontWeight: '500'
                        }}>
                          {column}
                        </span>
                      </label>
                    </div>
                  );
                })}
                
                {/* Show All Columns Button - Last item in grid */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '0.5rem 0.75rem'
                }}>
                  <button
                    onClick={() => {
                      const allVisible = {};
                      Object.keys(visibleColumns).forEach(col => allVisible[col] = true);
                      setVisibleColumns(allVisible);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'rgb(139, 92, 246)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      width: '100%',
                      transition: 'all 0.2s'
                    }}
                  >
                    Show All Columns
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results count and items per page selector */}
          <div style={{ 
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} leads
              {filteredLeads.length !== leadData.length && ` (filtered from ${leadData.length} total)`}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Show:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
              </select>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                per page
              </span>
            </div>
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
                {/* Header Row - Column Names with Sort */}
                <tr>
                  {visibleColumns.name && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
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
                      Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.mobile && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('mobile')}
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
                      Mobile {sortConfig.key === 'mobile' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.email && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('email')}
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
                      Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.role && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('role')}
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
                      Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.client_status && (
                    <th 
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        borderBottom: '1px solid var(--border)'
                      }}
                    >
                      Status
                    </th>
                  )}
                  {visibleColumns.nurturing && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('nurturing')}
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
                      Nurture Level {sortConfig.key === 'nurturing' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.payment_status && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('payment_status')}
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
                      Payment Status {sortConfig.key === 'payment_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.source && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('source')}
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
                      Source {sortConfig.key === 'source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.reg_timestamp && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('reg_timestamp')}
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
                      Registered {sortConfig.key === 'reg_timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.payable_amt && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('payable_amt')}
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
                      Payable {sortConfig.key === 'payable_amt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.paid_amt && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('paid_amt')}
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
                      Paid Amount {sortConfig.key === 'paid_amt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.discount_percentage && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('discount_percentage')}
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
                      Discount % {sortConfig.key === 'discount_percentage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.discount_amt && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('discount_amt')}
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
                      Discount Amount {sortConfig.key === 'discount_amt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.couponcode_given && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('couponcode_given')}
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
                      Coupon (Given) {sortConfig.key === 'couponcode_given' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.couponcode_applied && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('couponcode_applied')}
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
                      Coupon (Applied) {sortConfig.key === 'couponcode_applied' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.txn_id && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('txn_id')}
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
                      Transaction ID {sortConfig.key === 'txn_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.txn_timestamp && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('txn_timestamp')}
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
                      Payment Date {sortConfig.key === 'txn_timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.currency && (
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('currency')}
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
                      Currency {sortConfig.key === 'currency' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                </tr>
                
                {/* Filter Row - Dropdowns for each column (Only shown when Advanced Filters is active) */}
                {showAdvancedSelection && (
                  <tr>
                    {visibleColumns.name && (
                      <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                        {/* No filter for Name - use search instead */}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          Use search
                        </div>
                      </th>
                    )}
                    {visibleColumns.mobile && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      {/* No filter for Mobile - use search instead */}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Use search
                      </div>
                    </th>
                  )}
                  {visibleColumns.email && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      {/* No filter for Email - use search instead */}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Use search
                      </div>
                    </th>
                  )}
                  {visibleColumns.role && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <select
                        value={columnFilters.role || 'all'}
                        onChange={(e) => handleColumnFilter('role', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All</option>
                        {getUniqueValuesForColumn('role').map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </th>
                  )}
                  {visibleColumns.client_status && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <select
                        value={columnFilters.client_status || 'all'}
                        onChange={(e) => handleColumnFilter('client_status', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="need time to confirm">Need Time to Confirm</option>
                        <option value="not attempted">Not Attempted</option>
                      </select>
                    </th>
                  )}
                  {visibleColumns.nurturing && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <select
                        value={columnFilters.nurturing || 'all'}
                        onChange={(e) => handleColumnFilter('nurturing', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All</option>
                        {getUniqueValuesForColumn('nurturing').map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </th>
                  )}
                  {visibleColumns.payment_status && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <select
                        value={columnFilters.payment_status || 'all'}
                        onChange={(e) => handleColumnFilter('payment_status', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All</option>
                        {getUniqueValuesForColumn('payment_status').map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </th>
                  )}
                  {visibleColumns.source && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <select
                        value={columnFilters.source || 'all'}
                        onChange={(e) => handleColumnFilter('source', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All</option>
                        {getUniqueValuesForColumn('source').map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </th>
                  )}
                  {visibleColumns.reg_timestamp && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <select
                        value={columnFilters.reg_timestamp || 'all'}
                        onChange={(e) => handleColumnFilter('reg_timestamp', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All Dates</option>
                        {getUniqueValuesForColumn('reg_timestamp').map(value => {
                          const displayDate = new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                          return (
                            <option key={value} value={value}>{displayDate}</option>
                          );
                        })}
                      </select>
                    </th>
                  )}
                  {visibleColumns.payable_amt && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Use search
                      </div>
                    </th>
                  )}
                  {visibleColumns.paid_amt && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Use search
                      </div>
                    </th>
                  )}
                  {visibleColumns.discount_percentage && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Use search
                      </div>
                    </th>
                  )}
                  {visibleColumns.discount_amt && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Use search
                      </div>
                    </th>
                  )}
                  {visibleColumns.couponcode_given && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <select
                        value={columnFilters.couponcode_given || 'all'}
                        onChange={(e) => handleColumnFilter('couponcode_given', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All</option>
                        {getUniqueValuesForColumn('couponcode_given').map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </th>
                  )}
                  {visibleColumns.couponcode_applied && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <select
                        value={columnFilters.couponcode_applied || 'all'}
                        onChange={(e) => handleColumnFilter('couponcode_applied', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All</option>
                        {getUniqueValuesForColumn('couponcode_applied').map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </th>
                  )}
                  {visibleColumns.txn_id && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Use search
                      </div>
                    </th>
                  )}
                  {visibleColumns.txn_timestamp && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Use search
                      </div>
                    </th>
                  )}
                  {visibleColumns.currency && (
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      <select
                        value={columnFilters.currency || 'all'}
                        onChange={(e) => handleColumnFilter('currency', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="all">All</option>
                        {getUniqueValuesForColumn('currency').map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </th>
                  )}
                  </tr>
                )}
              </thead>

              <tbody>
                {currentLeads.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={Object.values(visibleColumns).filter(Boolean).length} 
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
                      {visibleColumns.name && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                          {lead.name || '-'}
                        </td>
                      )}
                      {visibleColumns.mobile && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {lead.mobile || '-'}
                        </td>
                      )}
                      {visibleColumns.email && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {lead.email || '-'}
                        </td>
                      )}
                      {visibleColumns.role && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                          {lead.role || '-'}
                        </td>
                      )}
                      {visibleColumns.client_status && (
                        <td style={{ padding: '0.75rem' }}>
                          {(() => {
                            const status = getStatusDisplay(lead);
                            return (
                              <span 
                                style={{
                                  display: 'inline-block',
                                  padding: '0.35rem 1rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  minWidth: '85px',
                                  textAlign: 'center',
                                  backgroundColor: status.color,
                                  color: '#ffffff'
                                }}
                              >
                                {status.amount}
                              </span>
                            );
                          })()}
                        </td>
                      )}
                      {visibleColumns.nurturing && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                          {lead.nurturing || '-'}
                        </td>
                      )}
                      {visibleColumns.payment_status && (
                        <td style={{ padding: '0.75rem' }}>
                          <span 
                            className={`badge ${getPaymentBadgeClass(lead.payment_status)}`}
                            style={{
                              display: 'inline-block',
                              padding: '0.35rem 1rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              minWidth: '85px',
                              textAlign: 'center',
                              backgroundColor: getPaymentBadgeClass(lead.payment_status) === 'badge-success' ? 'var(--success)' :
                                             getPaymentBadgeClass(lead.payment_status) === 'badge-warning' ? 'var(--warning)' :
                                             getPaymentBadgeClass(lead.payment_status) === 'badge-error' ? 'var(--error)' : 'var(--surface-light)',
                              color: getPaymentBadgeClass(lead.payment_status) === 'badge-success' || 
                                     getPaymentBadgeClass(lead.payment_status) === 'badge-error' || 
                                     getPaymentBadgeClass(lead.payment_status) === 'badge-warning' ? '#ffffff' : 'var(--text-secondary)'
                            }}
                          >
                            {getPaymentStatusDisplay(lead.payment_status)}
                          </span>
                        </td>
                      )}
                      {visibleColumns.source && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>
                          {formatSourceDisplay(lead.source)}
                        </td>
                      )}
                      {visibleColumns.reg_timestamp && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {lead.reg_timestamp ? new Date(lead.reg_timestamp).toLocaleDateString() : '-'}
                        </td>
                      )}
                      {visibleColumns.payable_amt && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {(() => {
                            const payable = lead.payable_amt;
                            if (!payable) return '-';
                            const amount = typeof payable === 'string' ? payable.replace(/[₹,]/g, '').trim() : payable;
                            return amount ? `₹${parseFloat(amount).toLocaleString('en-IN')}` : '-';
                          })()}
                        </td>
                      )}
                      {visibleColumns.paid_amt && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {(() => {
                            const paid = lead.paid_amt;
                            if (!paid) return '-';
                            const amount = typeof paid === 'string' ? paid.replace(/[₹,]/g, '').trim() : paid;
                            return amount ? `₹${parseFloat(amount).toLocaleString('en-IN')}` : '-';
                          })()}
                        </td>
                      )}
                      {visibleColumns.discount_percentage && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {(() => {
                            const discount = lead.discount_percentage;
                            if (!discount) return '-';
                            const percent = typeof discount === 'string' ? discount.replace(/%/g, '').trim() : discount;
                            return percent ? `${percent}%` : '-';
                          })()}
                        </td>
                      )}
                      {visibleColumns.discount_amt && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {(() => {
                            const discountAmt = lead.discount_amt;
                            if (!discountAmt) return '-';
                            const amount = typeof discountAmt === 'string' ? discountAmt.replace(/[₹,]/g, '').trim() : discountAmt;
                            return amount ? `₹${parseFloat(amount).toLocaleString('en-IN')}` : '-';
                          })()}
                        </td>
                      )}
                      {visibleColumns.couponcode_given && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {lead.couponcode_given || '-'}
                        </td>
                      )}
                      {visibleColumns.couponcode_applied && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {lead.couponcode_applied || '-'}
                        </td>
                      )}
                      {visibleColumns.txn_id && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {lead.txn_id || '-'}
                        </td>
                      )}
                      {visibleColumns.txn_timestamp && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {lead.txn_timestamp ? new Date(lead.txn_timestamp).toLocaleDateString() : '-'}
                        </td>
                      )}
                      {visibleColumns.currency && (
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {lead.currency || '-'}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '1.5rem',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {/* Page info */}
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </div>
              
              {/* Page navigation */}
              <div className="flex justify-center items-center gap-2" style={{ gap: '0.5rem' }}>
                {/* First page button */}
                <button 
                  className="btn btn-sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: currentPage === 1 ? 'var(--surface-light)' : 'var(--surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    fontSize: '0.75rem'
                  }}
                  title="First page"
                >
                  ««
                </button>
                
                {/* Previous page button */}
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
                  title="Previous page"
                >
                  ‹
                </button>
                
                {/* Page number buttons */}
                {(() => {
                  const pageButtons = [];
                  const maxButtons = 7; // Show max 7 page buttons
                  
                  if (totalPages <= maxButtons) {
                    // Show all pages if total is small
                    for (let i = 1; i <= totalPages; i++) {
                      pageButtons.push(
                        <button 
                          key={i}
                          className="btn btn-sm"
                          onClick={() => handlePageChange(i)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            backgroundColor: currentPage === i ? 'var(--primary)' : 'var(--surface)',
                            color: currentPage === i ? '#ffffff' : 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            minWidth: '2.5rem',
                            fontWeight: currentPage === i ? '600' : '400'
                          }}
                        >
                          {i}
                        </button>
                      );
                    }
                  } else {
                    // Smart pagination for large page counts
                    const showFirst = currentPage <= 4;
                    const showLast = currentPage >= totalPages - 3;
                    const showMiddle = !showFirst && !showLast;
                    
                    if (showFirst) {
                      // Show first 5 pages
                      for (let i = 1; i <= 5; i++) {
                        pageButtons.push(
                          <button 
                            key={i}
                            className="btn btn-sm"
                            onClick={() => handlePageChange(i)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: currentPage === i ? 'var(--primary)' : 'var(--surface)',
                              color: currentPage === i ? '#ffffff' : 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              minWidth: '2.5rem',
                              fontWeight: currentPage === i ? '600' : '400'
                            }}
                          >
                            {i}
                          </button>
                        );
                      }
                      pageButtons.push(<span key="dots1" style={{ color: 'var(--text-secondary)' }}>...</span>);
                      pageButtons.push(
                        <button 
                          key={totalPages}
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
                      );
                    } else if (showLast) {
                      // Show last 5 pages
                      pageButtons.push(
                        <button 
                          key={1}
                          className="btn btn-sm"
                          onClick={() => handlePageChange(1)}
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
                          1
                        </button>
                      );
                      pageButtons.push(<span key="dots1" style={{ color: 'var(--text-secondary)' }}>...</span>);
                      for (let i = totalPages - 4; i <= totalPages; i++) {
                        pageButtons.push(
                          <button 
                            key={i}
                            className="btn btn-sm"
                            onClick={() => handlePageChange(i)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: currentPage === i ? 'var(--primary)' : 'var(--surface)',
                              color: currentPage === i ? '#ffffff' : 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              minWidth: '2.5rem',
                              fontWeight: currentPage === i ? '600' : '400'
                            }}
                          >
                            {i}
                          </button>
                        );
                      }
                    } else {
                      // Show middle pages (current - 2 to current + 2)
                      pageButtons.push(
                        <button 
                          key={1}
                          className="btn btn-sm"
                          onClick={() => handlePageChange(1)}
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
                          1
                        </button>
                      );
                      pageButtons.push(<span key="dots1" style={{ color: 'var(--text-secondary)' }}>...</span>);
                      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                        pageButtons.push(
                          <button 
                            key={i}
                            className="btn btn-sm"
                            onClick={() => handlePageChange(i)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: currentPage === i ? 'var(--primary)' : 'var(--surface)',
                              color: currentPage === i ? '#ffffff' : 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              minWidth: '2.5rem',
                              fontWeight: currentPage === i ? '600' : '400'
                            }}
                          >
                            {i}
                          </button>
                        );
                      }
                      pageButtons.push(<span key="dots2" style={{ color: 'var(--text-secondary)' }}>...</span>);
                      pageButtons.push(
                        <button 
                          key={totalPages}
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
                      );
                    }
                  }
                  
                  return pageButtons;
                })()}
                
                {/* Next page button */}
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
                  title="Next page"
                >
                  ›
                </button>
                
                {/* Last page button */}
                <button 
                  className="btn btn-sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: currentPage === totalPages ? 'var(--surface-light)' : 'var(--surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    fontSize: '0.75rem'
                  }}
                  title="Last page"
                >
                  »»
                </button>
              </div>
              
              {/* Quick jump to page */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Go to:
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  placeholder={currentPage}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        handlePageChange(page);
                        e.target.value = '';
                      }
                    }
                  }}
                  style={{
                    width: '4rem',
                    padding: '0.375rem 0.5rem',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Pending Approval Modal - Loading State */}
        {showPendingApprovalModal && isLoadingQueries && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
            onClick={closePendingApprovalModal}
          >
            <div 
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '1rem',
                padding: '3rem',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid rgba(139, 92, 246, 0.3)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
                animation: 'spin 1s linear infinite'
              }}></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Loading Queries...
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Please wait while we fetch pending approval queries.
              </p>
            </div>
          </div>
        )}

        {/* Pending Approval Modal - With Queries */}
        {showPendingApprovalModal && !isLoadingQueries && pendingQueries.length > 0 && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '2rem 1rem',
              backdropFilter: 'blur(4px)',
              overflowY: 'auto'
            }}
            onClick={closePendingApprovalModal}
          >
            <div 
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '1rem',
                maxWidth: '900px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 3px var(--primary)',
                border: '3px solid var(--primary)',
                marginBottom: '2rem',
                overflow: 'hidden',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Arrows */}
              {pendingQueries.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousQuery}
                    disabled={currentQueryIndex === 0}
                    style={{
                      position: 'fixed',
                      left: 'calc(50% - 530px)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: '50%',
                      backgroundColor: currentQueryIndex === 0 ? '#94a3b8' : 'var(--primary)',
                      color: 'white',
                      border: '3px solid white',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      cursor: currentQueryIndex === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                      opacity: currentQueryIndex === 0 ? 0.5 : 1,
                      zIndex: 1001
                    }}
                    onMouseEnter={(e) => {
                      if (currentQueryIndex > 0) {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.4)';
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={goToNextQuery}
                    disabled={currentQueryIndex === pendingQueries.length - 1}
                    style={{
                      position: 'fixed',
                      right: 'calc(50% - 530px)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: '50%',
                      backgroundColor: currentQueryIndex === pendingQueries.length - 1 ? '#94a3b8' : 'var(--primary)',
                      color: 'white',
                      border: '3px solid white',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      cursor: currentQueryIndex === pendingQueries.length - 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                      opacity: currentQueryIndex === pendingQueries.length - 1 ? 0.5 : 1,
                      zIndex: 1001
                    }}
                    onMouseEnter={(e) => {
                      if (currentQueryIndex < pendingQueries.length - 1) {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.4)';
                    }}
                  >
                    ›
                  </button>
                </>
              )}

              {/* Modal Header */}
              <div style={{
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.125rem',
                    letterSpacing: '-0.025em'
                  }}>
                    ⏳ Pending Approval - Query {currentQueryIndex + 1} of {pendingQueries.length}
                  </h2>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500'
                  }}>
                    Ticket ID: {pendingQueries[currentQueryIndex].ticket_id}
                  </p>
                </div>
                <button
                  onClick={closePendingApprovalModal}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.25rem' }}>
                {/* Customer Information */}
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)'
                }}>
                  <h3 style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    marginBottom: '0.625rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    👤 Customer Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem', fontSize: '0.8rem' }}>
                    <div style={{ 
                      padding: '0.5rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--border)'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.7rem', display: 'block', marginBottom: '0.125rem' }}>Name</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.8rem' }}>{pendingQueries[currentQueryIndex].name || '-'}</div>
                    </div>
                    <div style={{ 
                      padding: '0.5rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--border)'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.7rem', display: 'block', marginBottom: '0.125rem' }}>Email</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.8rem', wordBreak: 'break-all' }}>{pendingQueries[currentQueryIndex].email || '-'}</div>
                    </div>
                    <div style={{ 
                      padding: '0.5rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--border)'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.7rem', display: 'block', marginBottom: '0.125rem' }}>Mobile</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.8rem' }}>{pendingQueries[currentQueryIndex].mobile || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Status, Category, Resolved By */}
                <div style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: 'var(--card-header-subtle)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flex: '1' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>📁 Category:</span>
                    {pendingQueries[currentQueryIndex].query_category ? (
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: 'var(--info-bg)',
                        color: 'var(--info)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}>
                        {pendingQueries[currentQueryIndex].query_category}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>-</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flex: '1', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>🔔 Status:</span>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: '#fed7aa',
                      color: '#ea580c',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}>
                      Pending Approval
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flex: '1', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>✓ Resolved By:</span>
                    {pendingQueries[currentQueryIndex].query_resolved_by ? (
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        backgroundColor: pendingQueries[currentQueryIndex].query_resolved_by?.toLowerCase() === 'ai' ? '#ede9fe' : '#f0fdf4',
                        color: pendingQueries[currentQueryIndex].query_resolved_by?.toLowerCase() === 'ai' ? '#7c3aed' : '#16a34a'
                      }}>
                        {pendingQueries[currentQueryIndex].query_resolved_by}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>-</span>
                    )}
                  </div>
                </div>

                {/* Query Section */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💬 Query</span>
                    {pendingQueries[currentQueryIndex].query_timestamp && (
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '600',
                        padding: '0.125rem 0.5rem',
                        backgroundColor: 'var(--card-header-subtle)',
                        borderRadius: '0.25rem'
                      }}>
                        📅 {new Date(pendingQueries[currentQueryIndex].query_timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--surface)',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {pendingQueries[currentQueryIndex].query || '-'}
                  </div>
                </div>

                {/* Editable Query Reply Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✏️ Edit Reply</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {pendingQueries[currentQueryIndex].query_reply?.match(/^AI\s+(Reco(m{1,2})endation|Response):/i) && (
                        <>
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#b45309',
                            fontWeight: '600',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#fef3c7',
                            borderRadius: '0.25rem',
                            border: '1px solid #f59e0b',
                            whiteSpace: 'nowrap'
                          }}>
                            ⚠️ AI Response - Customer Unsatisfied
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            color: isReplyEdited ? '#059669' : '#dc2626',
                            fontWeight: '600',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: isReplyEdited ? '#d1fae5' : '#fee2e2',
                            borderRadius: '0.25rem',
                            border: `1px solid ${isReplyEdited ? '#10b981' : '#ef4444'}`,
                            whiteSpace: 'nowrap'
                          }}>
                            {isReplyEdited ? '✓ Edited' : '⚠ Must Edit'}
                          </span>
                        </>
                      )}
                      {!pendingQueries[currentQueryIndex].query_reply?.match(/^AI\s+(Reco(m{1,2})endation|Response):/i) && isReplyEdited && (
                        <span style={{
                          fontSize: '0.7rem',
                          color: '#059669',
                          fontWeight: '600',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#d1fae5',
                          borderRadius: '0.25rem',
                          border: '1px solid #10b981',
                          whiteSpace: 'nowrap'
                        }}>
                          ✓ Edited
                        </span>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={editableReply}
                    onChange={(e) => {
                      setEditableReply(e.target.value);
                      setIsReplyEdited(e.target.value !== originalReply);
                    }}
                    placeholder="Enter your reply here..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '0.75rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '0.5rem',
                      border: '2px solid #ea580c',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      lineHeight: '1.5',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer with Send Button */}
              <div style={{
                padding: '0.875rem 1.25rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: 'var(--card-header)',
                gap: '0.75rem'
              }}>
                <button
                  onClick={closePendingApprovalModal}
                  style={{
                    padding: '0.5rem 1.5rem',
                    backgroundColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--text-secondary)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={sendResponse}
                  disabled={isSending || !editableReply.trim() || (pendingQueries[currentQueryIndex].query_reply?.match(/^AI\s+(Reco(m{1,2})endation|Response):/i) && !isReplyEdited)}
                  style={{
                    padding: '0.5rem 2rem',
                    backgroundColor: (isSending || !editableReply.trim() || (pendingQueries[currentQueryIndex].query_reply?.match(/^AI\s+(Reco(m{1,2})endation|Response):/i) && !isReplyEdited)) ? 'var(--border)' : '#ea580c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: (isSending || !editableReply.trim() || (pendingQueries[currentQueryIndex].query_reply?.match(/^AI\s+(Reco(m{1,2})endation|Response):/i) && !isReplyEdited)) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: (isSending || !editableReply.trim() || (pendingQueries[currentQueryIndex].query_reply?.match(/^AI\s+(Reco(m{1,2})endation|Response):/i) && !isReplyEdited)) ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isSending && editableReply.trim() && !(pendingQueries[currentQueryIndex].query_reply?.match(/^AI\s+(Reco(m{1,2})endation|Response):/i) && !isReplyEdited)) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {isSending ? (
                    <>
                      <span style={{ 
                        width: '1rem', 
                        height: '1rem', 
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }}></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg style={{ width: '1rem', height: '1rem', transform: 'rotate(90deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Response
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Modal Empty State */}
        {showPendingApprovalModal && !isLoadingQueries && pendingQueries.length === 0 && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
            onClick={closePendingApprovalModal}
          >
            <div 
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                All Caught Up!
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                There are no pending approval queries at this time.
              </p>
              <button
                onClick={closePendingApprovalModal}
                style={{
                  padding: '0.5rem 2rem',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* CSS Animations */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes shrink {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
    </div>
  );
};

export default AdminDashboard;