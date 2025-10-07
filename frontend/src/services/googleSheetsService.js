// Google Sheets CSV export service
const SHEET_ID = '1UinuM281y4r8gxCrCr2dvF_-7CBC2l_FVSomj0Ia-c8';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export const fetchSheetData = async (dateRange = 'all') => {
  try {
    console.log('Fetching data with date range:', dateRange);
    const response = await fetch(CSV_URL);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Google Sheets data');
    }
    
    const csvText = await response.text();
    const parsedData = parseCSV(csvText);
    console.log('Parsed data count:', parsedData.length);
    const processedData = processSheetData(parsedData, dateRange);
    console.log('Processed data - Total leads:', processedData.totalLeads);
    
    return {
      success: true,
      data: processedData,
      rawData: parsedData
    };
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(header => header.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      data.push(row);
    }
  }
  
  return data;
};

const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '\"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
};

const filterDataByDateRange = (data, dateRange) => {
  if (!dateRange || dateRange === 'all') {
    console.log('No filtering - showing all data');
    return data;
  }
  
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
      return data;
  }
  
  console.log(`Filtering data for ${dateRange}, cutoff date:`, cutoffDate);
  
  const filtered = data.filter(row => {
    const dateFields = ['timestamp', 'Timestamp', 'date', 'Date', 'createdAt', 'created_at'];
    let rowDate = null;
    
    for (const field of dateFields) {
      if (row[field]) {
        rowDate = new Date(row[field]);
        if (!isNaN(rowDate.getTime())) {
          break;
        }
      }
    }
    
    if (!rowDate || isNaN(rowDate.getTime())) {
      // If no valid date found, include the row
      return true;
    }
    
    return rowDate >= cutoffDate;
  });
  
  console.log(`Filtered ${data.length} rows down to ${filtered.length} rows`);
  return filtered;
};

const processSheetData = (data, dateRange = 'all') => {
  if (!data || data.length === 0) {
    return getEmptyMetrics();
  }
  
  const filteredData = filterDataByDateRange(data, dateRange);
  const totalLeads = filteredData.length;
  
  const roleDistribution = {};
  filteredData.forEach(row => {
    const role = row.role || row.Role || 'Unknown';
    roleDistribution[role] = (roleDistribution[role] || 0) + 1;
  });
  
  const paymentStats = {
    successful: 0,
    pending: 0,
    failed: 0
  };
  
  filteredData.forEach(row => {
    const status = (row.paymentStatus || row['Payment Status'] || '').toLowerCase();
    if (status === 'success' || status === 'successful' || status === 'completed') {
      paymentStats.successful++;
    } else if (status === 'pending') {
      paymentStats.pending++;
    } else if (status === 'failed' || status === 'failure') {
      paymentStats.failed++;
    }
  });
  
  const totalRevenue = filteredData.reduce((sum, row) => {
    const price = parseFloat(row.price || row.Price || 0);
    const status = (row.paymentStatus || row['Payment Status'] || '').toLowerCase();
    if (status === 'success' || status === 'successful' || status === 'completed') {
      return sum + price;
    }
    return sum;
  }, 0);
  
  const registered = filteredData.filter(row => {
    const registered = row.registered || row.Registered || '';
    return registered.toLowerCase() === 'yes' || registered === '1' || registered === 'true';
  }).length;
  
  const paid = paymentStats.successful;
  
  const completed = filteredData.filter(row => {
    const completed = row.completed || row.Completed || row.webinarCompleted || '';
    return completed.toLowerCase() === 'yes' || completed === '1' || completed === 'true';
  }).length;
  
  const conversionRate = totalLeads > 0 ? ((paid / totalLeads) * 100).toFixed(2) : 0;
  
  const engagement = registered > 0 ? ((completed / registered) * 100).toFixed(2) : 0;
  
  return {
    totalRevenue,
    totalLeads,
    conversionRate: parseFloat(conversionRate),
    engagement: parseFloat(engagement),
    roleDistribution,
    paymentStats,
    funnel: {
      leads: totalLeads,
      registered,
      paid,
      completed
    },
    lastUpdated: new Date().toLocaleString()
  };
};

const getEmptyMetrics = () => ({
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
  lastUpdated: new Date().toLocaleString()
});

export default {
  fetchSheetData
};
