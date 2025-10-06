// Google Sheets CSV service for real-time data fetching (No API key required!)
import { format, parseISO } from 'date-fns';

class GoogleSheetsService {
  constructor() {
    this.SHEET_ID = '1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8';
    this.GID = '0'; // Sheet tab ID (usually 0 for first sheet)
    this.cache = null;
    this.lastFetch = null;
    this.CACHE_DURATION = 30000; // 30 seconds
  }

  async fetchSheetData() {
    try {
      // Check cache first
      if (this.cache && this.lastFetch && (Date.now() - this.lastFetch < this.CACHE_DURATION)) {
        return this.cache;
      }

      // Use Google Sheets CSV export - no API key required!
      // Just requires the sheet to be publicly viewable
      const csvUrl = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=${this.GID}`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      const parsedData = this.parseCSV(csvText);
      const processedData = this.processSheetData(parsedData);
      
      // Update cache
      this.cache = processedData;
      this.lastFetch = Date.now();
      
      return processedData;
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      
      // Return cached data if available, otherwise return mock data
      if (this.cache) {
        return this.cache;
      }
      
      return this.getMockData();
    }
  }

  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length > 0) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }
    }

    return rows;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(val => val.replace(/"/g, ''));
  }

  processSheetData(rawData) {
    if (!rawData || rawData.length === 0) {
      return this.getMockData();
    }

    // Filter out empty rows and ensure we have name and email
    const processedData = rawData.filter(record => record.Name && record.Email);

    return {
      rawData: processedData,
      analytics: this.calculateAnalytics(processedData),
      lastUpdated: new Date().toISOString()
    };
  }

  calculateAnalytics(data) {
    const totalLeads = data.length;
    const successfulPayments = data.filter(record => 
      record['Payment Status'] === 'success' || record.PaymentStatus === 'success'
    ).length;
    const pendingPayments = data.filter(record => 
      record['Payment Status'] === 'need_time_to_confirm' || 
      record.PaymentStatus === 'need_time_to_confirm' ||
      record['Payment Status'] === 'pending' || 
      record.PaymentStatus === 'pending'
    ).length;
    const failedPayments = data.filter(record => 
      record['Payment Status'] === 'failed' || record.PaymentStatus === 'failed'
    ).length;
    
    const conversionRate = totalLeads > 0 ? (successfulPayments / totalLeads * 100) : 0;
    
    const totalRevenue = data
      .filter(record => 
        record['Payment Status'] === 'success' || record.PaymentStatus === 'success'
      )
      .reduce((sum, record) => {
        const amount = parseFloat(record['Paid Amount'] || record.PaidAmount || record['PayableAmount'] || record.PayableAmount || record.Cost || 0);
        return sum + amount;
      }, 0);

    const averageDealSize = successfulPayments > 0 ? totalRevenue / successfulPayments : 0;

    const pipelineValue = data
      .filter(record => 
        record['Payment Status'] === 'need_time_to_confirm' || 
        record.PaymentStatus === 'need_time_to_confirm'
      )
      .reduce((sum, record) => {
        const amount = parseFloat(record['PayableAmount'] || record.PayableAmount || record.Cost || 0);
        return sum + amount;
      }, 0);

    // Role distribution - handle different column names
    const roleDistribution = data.reduce((acc, record) => {
      const role = record.Role || record.role || 'Unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    // Payment status distribution
    const paymentStatusDistribution = {
      success: successfulPayments,
      pending: pendingPayments,
      failed: failedPayments
    };

    // Source analysis
    const sourceAnalysis = data.reduce((acc, record) => {
      const source = record.Source || record.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Coupon analysis - handle different column names
    const couponAnalysis = data.reduce((acc, record) => {
      const coupon = record.CouponCode || record.CouponCode_Given || record.couponCode || 'No Coupon';
      if (!acc[coupon]) {
        acc[coupon] = {
          usage: 0,
          totalDiscount: 0,
          revenue: 0
        };
      }
      acc[coupon].usage++;
      acc[coupon].totalDiscount += parseFloat(record.DiscountAmount || record.discountAmount || 0);
      if (record['Payment Status'] === 'success' || record.PaymentStatus === 'success') {
        acc[coupon].revenue += parseFloat(record['Paid Amount'] || record.PaidAmount || record['PayableAmount'] || record.PayableAmount || 0);
      }
      return acc;
    }, {});

    // Time-based analytics - handle different timestamp formats
    const registrationTrend = this.calculateTimeTrend(data, ['Registration_TS', 'RegistrationTS', 'registration_timestamp']);
    const paymentTrend = this.calculateTimeTrend(
      data.filter(record => record['Payment Status'] === 'success' || record.PaymentStatus === 'success'), 
      ['Transaction_TS', 'TransactionTS', 'payment_timestamp']
    );

    return {
      kpis: {
        totalLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageDealSize: Math.round(averageDealSize * 100) / 100,
        pipelineValue: Math.round(pipelineValue * 100) / 100,
        successfulPayments,
        pendingPayments,
        failedPayments
      },
      distributions: {
        role: roleDistribution,
        paymentStatus: paymentStatusDistribution,
        source: sourceAnalysis
      },
      coupons: couponAnalysis,
      trends: {
        registrations: registrationTrend,
        payments: paymentTrend
      },
      funnelData: this.calculateFunnelData(data)
    };
  }

  calculateTimeTrend(data, timestampFields) {
    const trend = data.reduce((acc, record) => {
      let timestamp = null;
      
      // Try different possible timestamp field names
      for (const field of timestampFields) {
        if (record[field]) {
          timestamp = record[field];
          break;
        }
      }

      if (timestamp) {
        try {
          const date = format(parseISO(timestamp), 'yyyy-MM-dd');
          acc[date] = (acc[date] || 0) + 1;
        } catch (error) {
          // Try alternative date parsing
          try {
            const date = format(new Date(timestamp), 'yyyy-MM-dd');
            acc[date] = (acc[date] || 0) + 1;
          } catch (e) {
            console.warn('Invalid date format:', timestamp);
          }
        }
      }
      return acc;
    }, {});

    return Object.entries(trend)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({ date, count }));
  }

  calculateFunnelData(data) {
    const totalVisitors = data.length; // Assuming each record is a visitor
    const registered = data.length;
    const paymentAttempted = data.filter(record => 
      record['Payment Status'] && record['Payment Status'] !== ''
    ).length;
    const successful = data.filter(record => 
      record['Payment Status'] === 'success'
    ).length;

    return [
      { stage: 'Visitors', count: totalVisitors, percentage: 100 },
      { stage: 'Registered', count: registered, percentage: (registered / totalVisitors * 100) },
      { stage: 'Payment Attempted', count: paymentAttempted, percentage: (paymentAttempted / totalVisitors * 100) },
      { stage: 'Converted', count: successful, percentage: (successful / totalVisitors * 100) }
    ];
  }

  getMockData() {
    // Fallback mock data based on your provided sample
    const mockRawData = [
      {
        Name: "Harshasri",
        Email: "harshaalluri23@gmail.com",
        Phone: "7732043939",
        Source: "registration_page",
        Registration_TS: "2025-09-26T11:52:14.265Z",
        "Payment Status": "success",
        "Transaction ID": "txn_1758889114973_cg049dcr8",
        Transaction_TS: "2025-09-26T12:18:39.039Z",
        Cost: "4999",
        "Paid Amount": "4999",
        Currency: "INR",
        "Client Status": "Closed",
        Role: "Entrepreneur",
        Interest: "interested",
        Reg_Count: "2",
        Nuturing: "Done"
      },
      {
        Name: "Umesh Chandra Paruchuri",
        Email: "umeshchandrapc@gmail.com",
        Phone: "6281174743",
        Source: "registration_page",
        Registration_TS: "2025-09-26T12:35:00.121Z",
        "Payment Status": "success",
        "Transaction ID": "txn_1758890991634_f53trrn5l",
        Transaction_TS: "2025-09-26T12:49:51.647Z",
        Cost: "4999",
        "Paid Amount": "3499.3",
        Currency: "INR",
        "Client Status": "Closed",
        Role: "Student",
        Interest: "interested",
        Reg_Count: "1",
        Nuturing: "Done"
      },
      {
        Name: "Umesh Chandra Paruchuri",
        Email: "paruchuriumeshchandra@gmail.com",
        Phone: "6281174743",
        Source: "registration_page",
        Registration_TS: "2025-09-26T13:33:30.059Z",
        "Payment Status": "need_time_to_confirm",
        "Transaction ID": "txn_1758893651539_6afywi2mx",
        Transaction_TS: "2025-09-26T13:34:11.860Z",
        Cost: "4999",
        CouponCode_Given: "FAC20",
        Currency: "INR",
        "Client Status": "Not Interested",
        Role: "Faculty",
        Interest: "interested",
        Reg_Count: "2",
        Nuturing: "Done"
      }
    ];

    return {
      rawData: mockRawData,
      analytics: this.calculateAnalytics(mockRawData),
      lastUpdated: new Date().toISOString()
    };
  }

  // Export functions
  exportToCSV(data) {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        `"${(row[header] || '').toString().replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pystack-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async exportToExcel(data) {
    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PyStack Analytics');
    XLSX.writeFile(workbook, `pystack-analytics-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  }

  async exportToPDF(data, analytics) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('PyStack Analytics Report', 20, 30);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 45);
    
    // Add KPIs
    doc.setFontSize(14);
    doc.text('Key Performance Indicators', 20, 65);
    doc.setFontSize(10);
    
    let yPosition = 80;
    const kpis = analytics.kpis;
    doc.text(`Total Leads: ${kpis.totalLeads}`, 20, yPosition);
    doc.text(`Conversion Rate: ${kpis.conversionRate}%`, 20, yPosition + 10);
    doc.text(`Total Revenue: ₹${kpis.totalRevenue}`, 20, yPosition + 20);
    doc.text(`Average Deal Size: ₹${kpis.averageDealSize}`, 20, yPosition + 30);
    doc.text(`Pipeline Value: ₹${kpis.pipelineValue}`, 20, yPosition + 40);
    
    // Add summary table (first few records)
    yPosition = 150;
    doc.setFontSize(14);
    doc.text('Recent Transactions', 20, yPosition);
    
    yPosition += 20;
    doc.setFontSize(8);
    data.slice(0, 10).forEach((record, index) => {
      const text = `${record.Name} - ${record.Email} - ${record['Payment Status']} - ₹${record['Paid Amount'] || record.Cost}`;
      doc.text(text, 20, yPosition + (index * 10));
    });
    
    doc.save(`pystack-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }
}

export default new GoogleSheetsService();