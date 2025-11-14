import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchContactsData } from '../services/googleSheetsService';

const QueryDetailsPage = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState({ key: 'query_timestamp', direction: 'desc' });
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    ticket_id: true,
    name: false,
    email: false,
    mobile: false,
    query: true,
    query_reply: true,
    query_category: true,
    query_status: true,
    query_resolved_by: true,
    query_timestamp: false,
    query_resolved_timestamp: false
  });

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    query_status: 'all',
    query_category: 'all',
    query_resolved_by: 'all',
    query_timestamp: 'all',
    query_resolved_timestamp: 'all'
  });

  // Search filters for text columns
  const [columnSearchFilters, setColumnSearchFilters] = useState({
    ticket_id: '',
    query: '',
    query_reply: ''
  });

  useEffect(() => {
    loadQueryData();
    
    // Auto-refresh every 30 seconds in background (without loading state)
    const refreshInterval = setInterval(() => {
      loadQueryDataInBackground();
      setRefreshCountdown(30);
    }, 30000);

    // Countdown timer every second
    const countdownInterval = setInterval(() => {
      setRefreshCountdown(prev => prev > 0 ? prev - 1 : 30);
    }, 1000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const loadQueryData = async () => {
    try {
      const result = await fetchContactsData();
      if (result.success && result.rawData) {
        setQueries(result.rawData);
      }
    } catch (error) {
      console.error('Error loading query data:', error);
    }
  };

  // Background refresh without showing loading state
  const loadQueryDataInBackground = async () => {
    try {
      const result = await fetchContactsData();
      if (result.success && result.rawData) {
        setQueries(result.rawData);
      }
    } catch (error) {
      console.error('Background refresh error:', error);
      // Silently fail - don't disrupt user experience
    }
  };

  // Get unique values for column filters
  const getUniqueValuesForColumn = (columnName) => {
    const uniqueValues = [...new Set(queries.map(q => q[columnName]).filter(Boolean))];
    return uniqueValues.sort();
  };

  // Get unique dates for timestamp columns
  const getUniqueDatesForColumn = (columnName) => {
    const uniqueDates = [...new Set(queries.map(q => {
      if (!q[columnName]) return null;
      const date = new Date(q[columnName]);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }).filter(Boolean))];
    return uniqueDates.sort((a, b) => new Date(b) - new Date(a));
  };

  // Handle column filter
  const handleColumnFilter = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1);
  };

  // Reset entire page to initial state
  const resetFilters = () => {
    // Reset search
    setSearchTerm('');
    
    // Reset to default 7-column view
    setVisibleColumns({
      ticket_id: true,
      name: false,
      email: false,
      mobile: false,
      query: true,
      query_reply: true,
      query_category: true,
      query_status: true,
      query_resolved_by: true,
      query_timestamp: false,
      query_resolved_timestamp: false
    });
    
    // Reset all dropdown filters
    setColumnFilters({
      query_status: 'all',
      query_category: 'all',
      query_resolved_by: 'all',
      query_timestamp: 'all',
      query_resolved_timestamp: 'all'
    });
    
    // Reset all search filters
    setColumnSearchFilters({
      ticket_id: '',
      query: '',
      query_reply: ''
    });
    
    // Reset sorting to default
    setSortConfig({ key: 'query_timestamp', direction: 'desc' });
    
    // Reset pagination
    setCurrentPage(1);
    setItemsPerPage(25);
    
    // Close advanced filters panel
    setShowAdvancedFilters(false);
  };

  // Toggle column visibility
  const toggleColumn = (columnName) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnName]: !prev[columnName]
    }));
  };

  // Open details modal
  const openDetailsModal = (query) => {
    setSelectedQuery(query);
    setShowDetailsModal(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedQuery(null);
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort queries
  const filteredAndSortedQueries = useMemo(() => {
    let filtered = queries.filter(query => {
      // Search filter
      const matchesSearch = 
        (query.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (query.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (query.ticket_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (query.query || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (query.mobile || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Column dropdown filters
      const matchesFilters = Object.keys(columnFilters).every(column => {
        if (columnFilters[column] === 'all') return true;
        const filterValue = columnFilters[column].toLowerCase().trim();
        
        // Handle timestamp columns differently - compare dates
        if (column === 'query_timestamp' || column === 'query_resolved_timestamp') {
          if (!query[column]) return false;
          const queryDate = new Date(query[column]).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          return queryDate.toLowerCase() === filterValue;
        }
        
        const cellValue = (query[column] || '').toString().toLowerCase().trim();
        return cellValue === filterValue;
      });
      
      // Column search filters (for ticket_id, query, query_reply)
      const matchesSearchFilters = Object.keys(columnSearchFilters).every(column => {
        if (!columnSearchFilters[column]) return true;
        const searchValue = columnSearchFilters[column].toLowerCase().trim();
        const cellValue = (query[column] || '').toString().toLowerCase().trim();
        return cellValue.includes(searchValue);
      });
      
      return matchesSearch && matchesFilters && matchesSearchFilters;
    });

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';
        
        // Handle timestamps
        if (sortConfig.key.includes('timestamp')) {
          aVal = new Date(aVal).getTime() || 0;
          bVal = new Date(bVal).getTime() || 0;
        } else {
          aVal = aVal.toString().toLowerCase();
          bVal = bVal.toString().toLowerCase();
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [queries, searchTerm, columnFilters, columnSearchFilters, sortConfig]);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQueries = filteredAndSortedQueries.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredAndSortedQueries.length / itemsPerPage);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Ticket ID', 'Name', 'Email', 'Mobile', 'Query', 'Category', 'Status', 'Resolved By', 'Reply', 'Query Timestamp', 'Resolved Timestamp'];
    const csvData = filteredAndSortedQueries.map(q => [
      q.ticket_id || '',
      q.name || '',
      q.email || '',
      q.mobile || '',
      (q.query || '').replace(/,/g, ';').replace(/\n/g, ' '),
      q.query_category || '',
      q.query_status || '',
      q.query_resolved_by || '',
      (q.query_reply || '').replace(/,/g, ';').replace(/\n/g, ' '),
      q.query_timestamp || '',
      q.query_resolved_timestamp || ''
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `queries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Left: Back Button */}
          <div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(139, 92, 246, 0.3)';
              }}
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* Right: Page Title and Subtitle */}
          <div style={{ textAlign: 'right', flex: '1 1 auto' }}>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)', 
              marginBottom: '0.25rem',
              background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Query Management
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.9rem',
              fontWeight: '400'
            }}>
              View and manage all customer queries • Refreshes in {refreshCountdown}s
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 300px', maxWidth: '500px' }}>
              <input
                type="text"
                placeholder="Search by name, email, ticket ID, mobile, or query..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem',
                  paddingLeft: '2.5rem',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '2px solid rgb(139, 92, 246)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxShadow: searchTerm ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2)';
                  e.target.style.borderColor = 'rgb(139, 92, 246)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = searchTerm ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none';
                }}
              />
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
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Advanced Filters Toggle */}
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
                <div
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  style={{
                    position: 'relative',
                    width: '48px',
                    height: '24px',
                    backgroundColor: showAdvancedFilters ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: showAdvancedFilters ? '24px' : '2px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.3s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="Reset all filters"
              >
                Reset Filters
              </button>

              {/* Download CSV */}
              <button
                onClick={exportToCSV}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(34, 197, 94, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                Download CSV
              </button>

              {/* Manual Refresh */}
              <button
                onClick={() => {
                  loadQueryDataInBackground();
                  setRefreshCountdown(30);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="Refresh data"
              >
                <svg 
                  style={{ 
                    width: '1rem', 
                    height: '1rem'
                  }} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Add CSS animation for spin */}
          <style>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>

          {/* Advanced Filters Panel - Category and Status Filters */}
          {showAdvancedFilters && (
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              marginTop: '1rem'
            }}>
              {/* Column Visibility Section */}
              <div>
                <h4 style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  Visible Columns
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                  gap: '0.75rem' 
                }}>
                  {[
                    { key: 'ticket_id', label: 'Ticket ID' },
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'mobile', label: 'Mobile' },
                    { key: 'query', label: 'Query' },
                    { key: 'query_reply', label: 'Query Reply' },
                    { key: 'query_category', label: 'Category' },
                    { key: 'query_status', label: 'Status' },
                    { key: 'query_resolved_by', label: 'Resolved By' },
                    { key: 'query_timestamp', label: 'Query Timestamp' },
                    { key: 'query_resolved_timestamp', label: 'Resolved Timestamp' }
                  ].map(col => (
                    <label key={col.key} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)'
                    }}>
                      <input
                        type="checkbox"
                        checked={visibleColumns[col.key]}
                        onChange={() => toggleColumn(col.key)}
                        style={{ 
                          cursor: 'pointer',
                          width: '1rem',
                          height: '1rem'
                        }}
                      />
                      {col.label}
                    </label>
                  ))}
                  {/* Select All Button as last item */}
                  <button
                    onClick={() => {
                      const allSelected = Object.values(visibleColumns).every(val => val);
                      const newState = {};
                      Object.keys(visibleColumns).forEach(key => {
                        newState[key] = !allSelected;
                      });
                      setVisibleColumns(newState);
                    }}
                    style={{ 
                      backgroundColor: Object.values(visibleColumns).every(val => val)
                        ? '#0d6efd'
                        : '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {Object.values(visibleColumns).every(val => val) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results count and items per page */}
          <div style={{ 
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedQueries.length)} of {filteredAndSortedQueries.length} queries
              {filteredAndSortedQueries.length !== queries.length && ` (filtered from ${queries.length} total)`}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Show:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
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
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--surface)', tableLayout: 'fixed', minWidth: '1300px' }}>
              <thead style={{ backgroundColor: 'var(--surface-light)' }}>
                  {/* Header Row - Column Names with Sort */}
                  <tr>
                    {/* Ticket ID */}
                    {visibleColumns.ticket_id && (
                      <th 
                        onClick={() => handleSort('ticket_id')}
                        style={{
                          width: '150px',
                          padding: '1rem 0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          borderBottom: '2px solid var(--border)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backgroundColor: 'var(--card-header)'
                        }}
                      >
                        Ticket ID {sortConfig.key === 'ticket_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    )}

                    {/* Name */}
                    {visibleColumns.name && (
                      <th 
                        onClick={() => handleSort('name')}
                        style={{
                          width: '150px',
                          padding: '1rem 0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          borderBottom: '2px solid var(--border)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backgroundColor: 'var(--card-header)'
                        }}
                      >
                        Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    )}

                    {/* Email */}
                    {visibleColumns.email && (
                      <th 
                        onClick={() => handleSort('email')}
                        style={{
                          width: '180px',
                          padding: '1rem 0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          borderBottom: '2px solid var(--border)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backgroundColor: 'var(--card-header)'
                        }}
                      >
                        Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    )}

                    {/* Mobile */}
                    {visibleColumns.mobile && (
                      <th 
                        onClick={() => handleSort('mobile')}
                        style={{
                          width: '130px',
                          padding: '1rem 0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          borderBottom: '2px solid var(--border)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backgroundColor: 'var(--card-header)'
                        }}
                      >
                        Mobile {sortConfig.key === 'mobile' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    )}
                    
                    {/* Query */}
                    {visibleColumns.query && (
                      <th 
                        style={{
                          width: '250px',
                          padding: '1rem 0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          borderBottom: '2px solid var(--border)',
                          backgroundColor: 'var(--card-header)'
                        }}
                      >
                        Query
                      </th>
                    )}

                    {/* Query Reply */}
                    {visibleColumns.query_reply && (
                      <th 
                        style={{
                          width: '250px',
                          padding: '1rem 0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          borderBottom: '2px solid var(--border)',
                          backgroundColor: 'var(--card-header)'
                        }}
                      >
                        Query Reply
                      </th>
                    )}

                    {/* Category */}
                    {visibleColumns.query_category && (
                      <th 
                        onClick={() => handleSort('query_category')}
                      style={{
                        width: '140px',
                        padding: '1rem 0.75rem',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)',
                        borderBottom: '2px solid var(--border)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        backgroundColor: 'var(--card-header)'
                      }}
                    >
                      Category {sortConfig.key === 'query_category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    )}

                    {/* Status */}
                    {visibleColumns.query_status && (
                      <th 
                        onClick={() => handleSort('query_status')}
                        style={{
                          width: '130px',
                          padding: '1rem 0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          borderBottom: '2px solid var(--border)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backgroundColor: 'var(--card-header)'
                        }}
                      >
                        Status {sortConfig.key === 'query_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    )}

                    {/* Resolved By */}
                    {visibleColumns.query_resolved_by && (
                      <th 
                        onClick={() => handleSort('query_resolved_by')}
                        style={{
                          width: '130px',
                          padding: '1rem 0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          borderBottom: '2px solid var(--border)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backgroundColor: 'var(--card-header)'
                        }}
                      >
                        Resolved By {sortConfig.key === 'query_resolved_by' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    )}

                    {/* Query Timestamp */}
                    {visibleColumns.query_timestamp && (
                      <th 
                        onClick={() => handleSort('query_timestamp')}
                        style={{
                          width: '160px',
                          padding: '1rem 0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          borderBottom: '2px solid var(--border)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backgroundColor: 'var(--card-header)'
                        }}
                      >
                        Query Timestamp {sortConfig.key === 'query_timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    )}

                    {/* Resolved Timestamp */}
                    {visibleColumns.query_resolved_timestamp && (
                      <th 
                        onClick={() => handleSort('query_resolved_timestamp')}
                        style={{
                          width: '160px',
                          padding: '1rem 0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          borderBottom: '2px solid var(--border)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backgroundColor: 'var(--card-header)'
                        }}
                      >
                        Resolved Timestamp {sortConfig.key === 'query_resolved_timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    )}

                    {/* View Details */}
                    <th 
                      style={{
                        width: '140px',
                        padding: '1rem 0.75rem',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)',
                        borderBottom: '2px solid var(--border)',
                        backgroundColor: 'var(--card-header)'
                      }}
                    >
                      Actions
                    </th>
                  </tr>

                  {/* Filter Row - Only shown when Advanced Filters is active */}
                  {showAdvancedFilters && (
                    <tr>
                      {visibleColumns.ticket_id && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <input
                            type="text"
                            placeholder="Search Ticket ID..."
                            value={columnSearchFilters.ticket_id}
                            onChange={(e) => {
                              setColumnSearchFilters(prev => ({...prev, ticket_id: e.target.value}));
                              setCurrentPage(1);
                            }}
                            style={{
                              width: '100%',
                              padding: '0.375rem 0.5rem',
                              backgroundColor: 'var(--surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              outline: 'none'
                            }}
                          />
                        </th>
                      )}
                      {visibleColumns.name && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Use search
                          </div>
                        </th>
                      )}
                      {visibleColumns.email && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Use search
                          </div>
                        </th>
                      )}
                      {visibleColumns.mobile && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Use search
                          </div>
                        </th>
                      )}
                      {visibleColumns.query && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <input
                            type="text"
                            placeholder="Search Query..."
                            value={columnSearchFilters.query}
                            onChange={(e) => {
                              setColumnSearchFilters(prev => ({...prev, query: e.target.value}));
                              setCurrentPage(1);
                            }}
                            style={{
                              width: '100%',
                              padding: '0.375rem 0.5rem',
                              backgroundColor: 'var(--surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              outline: 'none'
                            }}
                          />
                        </th>
                      )}
                      {visibleColumns.query_reply && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <input
                            type="text"
                            placeholder="Search Reply..."
                            value={columnSearchFilters.query_reply}
                            onChange={(e) => {
                              setColumnSearchFilters(prev => ({...prev, query_reply: e.target.value}));
                              setCurrentPage(1);
                            }}
                            style={{
                              width: '100%',
                              padding: '0.375rem 0.5rem',
                              backgroundColor: 'var(--surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              outline: 'none'
                            }}
                          />
                        </th>
                      )}
                      {visibleColumns.query_category && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <select
                            value={columnFilters.query_category || 'all'}
                            onChange={(e) => handleColumnFilter('query_category', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.375rem 0.5rem',
                              backgroundColor: 'var(--surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="all">All</option>
                            {getUniqueValuesForColumn('query_category').map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </th>
                      )}
                      {visibleColumns.query_status && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <select
                            value={columnFilters.query_status || 'all'}
                            onChange={(e) => handleColumnFilter('query_status', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.375rem 0.5rem',
                              backgroundColor: 'var(--surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="all">All</option>
                            {getUniqueValuesForColumn('query_status').map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </th>
                      )}
                      {visibleColumns.query_resolved_by && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <select
                            value={columnFilters.query_resolved_by || 'all'}
                            onChange={(e) => handleColumnFilter('query_resolved_by', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.375rem 0.5rem',
                              backgroundColor: 'var(--surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="all">All</option>
                            {getUniqueValuesForColumn('query_resolved_by').map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </th>
                      )}
                      {visibleColumns.query_timestamp && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <select
                            value={columnFilters.query_timestamp || 'all'}
                            onChange={(e) => handleColumnFilter('query_timestamp', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.375rem 0.5rem',
                              backgroundColor: 'var(--surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="all">All Dates</option>
                            {getUniqueDatesForColumn('query_timestamp').map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </th>
                      )}
                      {visibleColumns.query_resolved_timestamp && (
                        <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}>
                          <select
                            value={columnFilters.query_resolved_timestamp || 'all'}
                            onChange={(e) => handleColumnFilter('query_resolved_timestamp', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.375rem 0.5rem',
                              backgroundColor: 'var(--surface)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border)',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="all">All Dates</option>
                            {getUniqueDatesForColumn('query_resolved_timestamp').map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                        </th>
                      )}
                      <th style={{ padding: '0.5rem', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--card-header)' }}></th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {paginatedQueries.map((query, index) => (
                    <tr 
                      key={query.ticket_id || index}
                      style={{ 
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--card-header-subtle)',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'var(--card-header-subtle)';
                      }}
                    >
                      {/* Ticket ID */}
                      {visibleColumns.ticket_id && (
                        <td style={{ 
                          padding: '0.875rem 0.75rem', 
                          fontSize: '0.8rem', 
                          fontWeight: '600', 
                          color: 'var(--primary)',
                          textAlign: 'center'
                        }}>
                          {query.ticket_id}
                        </td>
                      )}

                      {/* Name */}
                      {visibleColumns.name && (
                        <td style={{ 
                          padding: '0.875rem 0.75rem', 
                          fontSize: '0.8rem', 
                          color: 'var(--text-primary)',
                          textAlign: 'center'
                        }}>
                          {query.name || '-'}
                        </td>
                      )}

                      {/* Email */}
                      {visibleColumns.email && (
                        <td style={{ 
                          padding: '0.875rem 0.75rem', 
                          fontSize: '0.8rem', 
                          color: 'var(--text-primary)'
                        }}>
                          {query.email || '-'}
                        </td>
                      )}

                      {/* Mobile */}
                      {visibleColumns.mobile && (
                        <td style={{ 
                          padding: '0.875rem 0.75rem', 
                          fontSize: '0.8rem', 
                          color: 'var(--text-primary)',
                          textAlign: 'center'
                        }}>
                          {query.mobile || '-'}
                        </td>
                      )}

                      {/* Query */}
                      {visibleColumns.query && (
                        <td style={{ 
                          padding: '0.875rem 0.75rem', 
                          fontSize: '0.8rem', 
                          color: 'var(--text-primary)',
                          lineHeight: '1.5'
                        }}>
                          <div style={{ 
                            maxHeight: '60px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            wordBreak: 'break-word'
                          }} title={query.query}>
                            {query.query}
                          </div>
                        </td>
                      )}

                      {/* Query Reply */}
                      {visibleColumns.query_reply && (
                        <td style={{ 
                          padding: '0.875rem 0.75rem', 
                          fontSize: '0.8rem', 
                          color: 'var(--text-primary)',
                          lineHeight: '1.5'
                        }}>
                          <div style={{ 
                            maxHeight: '60px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            wordBreak: 'break-word'
                          }} title={query.query_reply}>
                            {query.query_reply || '-'}
                          </div>
                        </td>
                      )}

                      {/* Category */}
                      {visibleColumns.query_category && (
                        <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.8rem' }}>
                          {query.query_category ? (
                            <span style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.7rem',
                              fontWeight: '500',
                              backgroundColor: 'var(--info-bg)',
                              color: 'var(--info)',
                              whiteSpace: 'nowrap',
                              display: 'inline-block'
                            }}>
                              {query.query_category}
                            </span>
                          ) : '-'}
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.query_status && (
                        <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.8rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                            backgroundColor: 
                              query.query_status?.toLowerCase() === 'closed' ? 'var(--success-bg)' :
                              query.query_status?.toLowerCase() === 'open' ? 'var(--warning-bg)' :
                              query.query_status?.toLowerCase() === 'answered' ? '#e0f2fe' :
                              query.query_status?.toLowerCase() === 'ai processed' ? 'var(--info-bg)' :
                              'var(--border)',
                            color: 
                              query.query_status?.toLowerCase() === 'closed' ? 'var(--success)' :
                              query.query_status?.toLowerCase() === 'open' ? 'var(--warning)' :
                              query.query_status?.toLowerCase() === 'answered' ? '#0284c7' :
                              query.query_status?.toLowerCase() === 'ai processed' ? 'var(--info)' :
                              'var(--text-secondary)'
                          }}>
                            {query.query_status || 'N/A'}
                          </span>
                        </td>
                      )}

                      {/* Resolved By */}
                      {visibleColumns.query_resolved_by && (
                        <td style={{ padding: '0.875rem 0.75rem', fontSize: '0.8rem', textAlign: 'center' }}>
                          {query.query_resolved_by ? (
                            <span style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.7rem',
                              fontWeight: '500',
                              whiteSpace: 'nowrap',
                              display: 'inline-block',
                              backgroundColor: query.query_resolved_by?.toLowerCase() === 'ai' ? '#ede9fe' : '#f0fdf4',
                              color: query.query_resolved_by?.toLowerCase() === 'ai' ? '#7c3aed' : '#16a34a'
                            }}>
                              {query.query_resolved_by}
                            </span>
                          ) : '-'}
                        </td>
                      )}

                      {/* Query Timestamp */}
                      {visibleColumns.query_timestamp && (
                        <td style={{ 
                          padding: '0.875rem 0.75rem', 
                          fontSize: '0.75rem', 
                          color: 'var(--text-secondary)',
                          textAlign: 'center'
                        }}>
                          {query.query_timestamp ? new Date(query.query_timestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </td>
                      )}

                      {/* Resolved Timestamp */}
                      {visibleColumns.query_resolved_timestamp && (
                        <td style={{ 
                          padding: '0.875rem 0.75rem', 
                          fontSize: '0.75rem', 
                          color: 'var(--text-secondary)',
                          textAlign: 'center'
                        }}>
                          {query.query_resolved_timestamp ? new Date(query.query_resolved_timestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </td>
                      )}

                      {/* View Details Button */}
                      <td style={{ padding: '0.875rem 0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => openDetailsModal(query)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* No Results Message */}
            {filteredAndSortedQueries.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
                {queries.length === 0 ? 'No queries available' : 'No queries match your filters'}
              </div>
            )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedQuery && (
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
            onClick={closeDetailsModal}
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
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Gradient */}
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
                    📋 Query Details
                  </h2>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500'
                  }}>
                    Ticket ID: {selectedQuery.ticket_id}
                  </p>
                </div>
                <button
                  onClick={closeDetailsModal}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: '300',
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                  title="Close"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.25rem' }}>
                {/* Customer Information - Compact */}
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
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.8rem' }}>{selectedQuery.name || '-'}</div>
                    </div>
                    <div style={{ 
                      padding: '0.5rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--border)'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.7rem', display: 'block', marginBottom: '0.125rem' }}>Email</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.8rem', wordBreak: 'break-all' }}>{selectedQuery.email || '-'}</div>
                    </div>
                    <div style={{ 
                      padding: '0.5rem',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--border)'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.7rem', display: 'block', marginBottom: '0.125rem' }}>Mobile</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.8rem' }}>{selectedQuery.mobile || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Status, Category, Resolved By - Compact Badges */}
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
                    {selectedQuery.query_category ? (
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: 'var(--info-bg)',
                        color: 'var(--info)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}>
                        {selectedQuery.query_category}
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
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      backgroundColor: 
                        selectedQuery.query_status?.toLowerCase() === 'closed' ? '#d1fae5' :
                        selectedQuery.query_status?.toLowerCase() === 'open' ? '#fee2e2' :
                        selectedQuery.query_status?.toLowerCase() === 'pending approval' ? '#fed7aa' :
                        selectedQuery.query_status?.toLowerCase() === 'answered' ? '#e0f2fe' :
                        selectedQuery.query_status?.toLowerCase() === 'ai processed' ? 'var(--info-bg)' :
                        'var(--border)',
                      color: 
                        selectedQuery.query_status?.toLowerCase() === 'closed' ? '#059669' :
                        selectedQuery.query_status?.toLowerCase() === 'open' ? '#dc2626' :
                        selectedQuery.query_status?.toLowerCase() === 'pending approval' ? '#ea580c' :
                        selectedQuery.query_status?.toLowerCase() === 'answered' ? '#0284c7' :
                        selectedQuery.query_status?.toLowerCase() === 'ai processed' ? 'var(--info)' :
                        'var(--text-secondary)'
                    }}>
                      {selectedQuery.query_status || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flex: '1', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>✓ Resolved By:</span>
                    {selectedQuery.query_resolved_by ? (
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        backgroundColor: selectedQuery.query_resolved_by?.toLowerCase() === 'ai' ? '#ede9fe' : '#f0fdf4',
                        color: selectedQuery.query_resolved_by?.toLowerCase() === 'ai' ? '#7c3aed' : '#16a34a'
                      }}>
                        {selectedQuery.query_resolved_by}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>-</span>
                    )}
                  </div>
                </div>

                {/* Query Section - Compact */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💬 Query</span>
                    {selectedQuery.query_timestamp && (
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '600',
                        padding: '0.125rem 0.5rem',
                        backgroundColor: 'var(--card-header-subtle)',
                        borderRadius: '0.25rem'
                      }}>
                        📅 {new Date(selectedQuery.query_timestamp).toLocaleString('en-US', {
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
                    {selectedQuery.query || '-'}
                  </div>
                </div>

                {/* Query Reply Section - Compact */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💬 Reply</span>
                    {selectedQuery.query_resolved_timestamp && (
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--success)',
                        fontWeight: '600',
                        padding: '0.125rem 0.5rem',
                        backgroundColor: 'var(--success-bg)',
                        borderRadius: '0.25rem'
                      }}>
                        ✓ {new Date(selectedQuery.query_resolved_timestamp).toLocaleString('en-US', {
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
                    {selectedQuery.query_reply || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredAndSortedQueries.length > 0 && (
          <div style={{ 
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: currentPage === 1 ? 'var(--border)' : 'var(--primary)',
                color: currentPage === 1 ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              First
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: currentPage === 1 ? 'var(--border)' : 'var(--primary)',
                color: currentPage === 1 ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Previous
            </button>
            
            <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: currentPage === totalPages ? 'var(--border)' : 'var(--primary)',
                color: currentPage === totalPages ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Next
            </button>
            
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: currentPage === totalPages ? 'var(--border)' : 'var(--primary)',
                color: currentPage === totalPages ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Last
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryDetailsPage;
