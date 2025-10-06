import React, { useState, useEffect } from 'react';
import googleSheetsService from '../services/googleSheetsService';
import KPICard from '../components/KPICard';
import AnalyticsConfig from '../components/AnalyticsConfig';
import { 
  RoleDistributionChart, 
  PaymentStatusChart, 
  RegistrationTrendChart, 
  RevenueChart,
  SourceAnalysisChart 
} from '../components/Charts';
import SalesFunnel from '../components/SalesFunnel';
import DataTable from '../components/DataTable';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Check if admin is authenticated using localStorage (separate from user auth)
  const isAdmin = () => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (!adminToken || !adminUser || !loginTime) {
      return false;
    }

    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - parseInt(loginTime);
    const sessionLimit = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge > sessionLimit) {
      // Clear expired session
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminLoginTime');
      return false;
    }

    return true;
  };

  const fetchData = async () => {
    try {
      setError(null);
      const data = await googleSheetsService.fetchSheetData();
      setDashboardData(data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Using fallback data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh
    const interval = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleExportCSV = () => {
    if (dashboardData?.rawData) {
      googleSheetsService.exportToCSV(dashboardData.rawData);
    }
  };

  const handleExportExcel = () => {
    if (dashboardData?.rawData) {
      googleSheetsService.exportToExcel(dashboardData.rawData);
    }
  };

  const handleExportPDF = () => {
    if (dashboardData?.rawData && dashboardData?.analytics) {
      googleSheetsService.exportToPDF(dashboardData.rawData, dashboardData.analytics);
    }
  };

  const handleUpdateSheetId = (newSheetId) => {
    googleSheetsService.SHEET_ID = newSheetId;
    // Clear cache to force refresh with new sheet
    googleSheetsService.cache = null;
    googleSheetsService.lastFetch = null;
    fetchData();
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin authentication required.</p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { analytics, rawData } = dashboardData || {};
  const { kpis, distributions, trends, funnelData, coupons } = analytics || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Professional Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center py-5">
            
            {/* Left - Logo and Title (Better Font Sizes) */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">WS</span>
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">Webinar Sales Funnel</h1>
                <p className="text-sm text-gray-500 mt-0.5">Admin Analytics Dashboard</p>
              </div>
            </div>
            
            {/* Right - Controls (Evenly Spaced with Better Styling) */}
            <div className="flex items-center gap-5">
              {/* Date Range Picker - Styled */}
              <div className="relative min-w-[180px]">
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none w-full bg-gradient-to-b from-white to-gray-50 border-2 border-gray-300 hover:border-teal-400 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-800 font-semibold cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm hover:shadow"
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                  </svg>
                </div>
              </div>
              
              {/* Action Buttons - Better Colors and Spacing */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="btn btn-secondary px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md active:scale-95"
                >
                  Export
                </button>
                <button
                  onClick={fetchData}
                  className="btn btn-primary px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-6">
        {/* Sidekicks-Style Main Section with Mint Background */}
        <section className="bg-gradient-to-br from-teal-50 via-emerald-50 to-green-100 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Metrics & Table */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Overall Site Performance</h2>
              
              {/* KPI Grid */}
              <div className="grid grid-cols-2 gap-3">
                <KPICard
                  title="Total Leads"
                  value={kpis?.totalLeads || 0}
                  trend={12.2}
                  compact
                />
                <KPICard
                  title="Conversion Rate"
                  value={`${kpis?.conversionRate || 0}%`}
                  trend={-0.5}
                  compact
                />
                <KPICard
                  title="Total Revenue"
                  value={`₹${Math.floor((kpis?.totalRevenue || 0) / 1000)}K`}
                  trend={1.0}
                  compact
                />
                <KPICard
                  title="Engagement"
                  value={`${kpis?.engagementRate || 62.5}%`}
                  trend={4.2}
                  compact
                />
              </div>

              {/* Funnel Steps Table */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-2">
                  {funnelData?.slice(0, 4).map((stage, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium w-4">{index + 1}.</span>
                        <span className="text-xs text-gray-900">{stage.stage}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">
                        {stage.count?.toLocaleString() || 0}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <span className="text-gray-400 text-xs">‹</span>
                  </button>
                  <span className="text-xs text-gray-500">1 - 4 / {funnelData?.length || 4}</span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <span className="text-gray-400 text-xs">›</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Funnel Visualization */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Webinar Sales Funnel</h2>
              <div className="bg-transparent">
                {funnelData && <SalesFunnel data={funnelData} />}
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Charts - Compact */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Role Distribution</h3>
              <div className="h-48">
                {distributions?.role && <RoleDistributionChart data={distributions.role} />}
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Status</h3>
              <div className="h-48">
                {distributions?.paymentStatus && <PaymentStatusChart data={distributions.paymentStatus} />}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Registration Trend</h3>
              <div className="h-48">
                {trends?.registrations && <RegistrationTrendChart data={trends.registrations} />}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Lead Sources</h3>
              <div className="h-48">
                {distributions?.source && <SourceAnalysisChart data={distributions.source} />}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Metrics - Compact */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Avg Deal Size</p>
              <p className="text-2xl font-bold text-gray-900">₹{(kpis?.averageDealSize || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Successful Payments</p>
              <p className="text-2xl font-bold text-emerald-600">{kpis?.successfulPayments || 0}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-600">{kpis?.pendingPayments || 0}</p>
            </div>
          </div>
        </section>

        {/* Data Table */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <DataTable 
              data={rawData || []} 
              title="All Leads & Transactions"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;