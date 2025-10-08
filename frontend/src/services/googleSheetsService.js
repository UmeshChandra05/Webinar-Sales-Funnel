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
  
  // Check if any rows have date fields
  const dateFields = ['Registration_TS', 'timestamp', 'Timestamp', 'date', 'Date', 'createdAt', 'created_at', 'created', 'Created'];
  let hasDateColumn = false;
  let dateFieldUsed = null;
  
  // Check first row to see which date field exists
  if (data.length > 0) {
    for (const field of dateFields) {
      if (data[0].hasOwnProperty(field) && data[0][field]) {
        hasDateColumn = true;
        dateFieldUsed = field;
        console.log(`Found date column: "${field}" with value:`, data[0][field]);
        break;
      }
    }
  }
  
  if (!hasDateColumn) {
    console.warn('⚠️ WARNING: No date column found in Google Sheet!');
    console.warn('Add a column named "timestamp", "date", or "createdAt" for time filtering to work.');
    console.warn('Available columns:', Object.keys(data[0] || {}));
    console.warn('Currently showing ALL data regardless of time period selected.');
    return data; // Return all data if no date column exists
  }
  
  const filtered = data.filter(row => {
    let rowDate = null;
    
    // Try to find a valid date in the row
    for (const field of dateFields) {
      if (row[field]) {
        rowDate = new Date(row[field]);
        if (!isNaN(rowDate.getTime())) {
          break;
        }
      }
    }
    
    if (!rowDate || isNaN(rowDate.getTime())) {
      // If this specific row has no valid date, exclude it from filtered results
      console.log('Row without valid date excluded:', row);
      return false;
    }
    
    return rowDate >= cutoffDate;
  });
  
  console.log(`✅ Filtered ${data.length} rows down to ${filtered.length} rows using "${dateFieldUsed}" column`);
  return filtered;
};

const processSheetData = (data, dateRange = 'all') => {
  if (!data || data.length === 0) {
    return getEmptyMetrics();
  }
  
  // Debug: Show available columns
  if (data.length > 0) {
    console.log('📋 Available columns in sheet:', Object.keys(data[0]));
    console.log('📄 Sample row data:', data[0]);
  }
  
  const filteredData = filterDataByDateRange(data, dateRange);
  const totalLeads = filteredData.length;
  
  const roleDistribution = {};
  filteredData.forEach(row => {
    const role = row.Role || row.role || 'Unknown';
    roleDistribution[role] = (roleDistribution[role] || 0) + 1;
  });
  
  const paymentStats = {
    successful: 0,
    pending: 0,
    failed: 0
  };
  
  filteredData.forEach(row => {
    const status = (row['Payment Status'] || row.paymentStatus || '').toLowerCase().trim();
    if (status === 'success' || status === 'successful' || status === 'completed' || status === 'paid') {
      paymentStats.successful++;
    } else if (status === 'pending' || status === 'processing') {
      paymentStats.pending++;
    } else if (status === 'failed' || status === 'failure' || status === 'declined') {
      paymentStats.failed++;
    }
  });
  
  const totalRevenue = filteredData.reduce((sum, row) => {
    // Use actual column names from your sheet
    const paidAmountValue = row['Paid Amount'] || row['PaidAmount'] || '0';
    const paidAmount = parseFloat(paidAmountValue);
    
    // Debug: Log if price parsing fails
    if (isNaN(paidAmount) && paidAmountValue !== '0' && paidAmountValue !== '') {
      console.log('Invalid Paid Amount value:', paidAmountValue, 'in row:', row.Name);
    }
    
    const status = (row['Payment Status'] || '').toLowerCase().trim();
    
    if (status === 'success' || status === 'successful' || status === 'completed' || status === 'paid') {
      const validAmount = isNaN(paidAmount) ? 0 : paidAmount;
      if (validAmount > 0) {
        console.log(`Adding ₹${validAmount} from ${row.Name || 'Unknown'} with status: ${status}`);
      }
      return sum + validAmount;
    }
    return sum;
  }, 0);
  
  console.log(`💰 Total Revenue calculated: ₹${totalRevenue}`);
  
  // Registered: All leads are considered registered (they filled the form)
  const registered = filteredData.length;
  
  // Paid: Count of successful payments
  const paid = paymentStats.successful;
  
  // Completed: Check Client Status or Type for completion
  const completed = filteredData.filter(row => {
    const clientStatus = (row['Client Status'] || '').toLowerCase().trim();
    const type = (row.Type || '').toLowerCase().trim();
    return clientStatus === 'completed' || clientStatus === 'enrolled' || 
           type === 'completed' || type === 'enrolled';
  }).length;
  
  const conversionRate = totalLeads > 0 ? ((paid / totalLeads) * 100).toFixed(2) : 0;
  
  // Engagement Score Calculation - Strict criteria
  // Only count users who took action BEYOND just registering
  // Exclude users who unsubscribed
  const engagedUsers = filteredData.filter(row => {
    const paymentStatus = (row['Payment Status'] || '').toLowerCase().trim();
    const clientStatus = (row['Client Status'] || '').toLowerCase().trim();
    const nurturing = (row.Nuturing || '').toLowerCase().trim();
    const unsubscribed = (row.Unsubscribed || '').toLowerCase().trim();
    
    // EXCLUDE: If user unsubscribed (yes/true values)
    if (unsubscribed === 'yes' || unsubscribed === 'true' || 
        unsubscribed === 'y' || unsubscribed === '1') {
      return false;
    }
    
    // HIGH ENGAGEMENT: Paid users (strongest signal)
    if (paymentStatus === 'success' || paymentStatus === 'successful' || 
        paymentStatus === 'completed' || paymentStatus === 'paid') {
      return true;
    }
    
    // MEDIUM ENGAGEMENT: Active client status (positive response)
    if (clientStatus === 'active' || clientStatus === 'engaged' || 
        clientStatus === 'interested' || clientStatus === 'hot' || 
        clientStatus === 'warm' || clientStatus === 'responding' ||
        clientStatus === 'contacted' || clientStatus === 'following up') {
      return true;
    }
    
    // BASIC ENGAGEMENT: Being actively nurtured (positive action from our side)
    // Only if nurturing has meaningful value, not just "no" or empty
    if (nurturing !== '' && nurturing !== 'no' && nurturing !== 'none' && 
        nurturing !== 'not started' && nurturing !== 'pending') {
      return true;
    }
    
    // NOT ENGAGED: Just registered, no further action
    return false;
  }).length;
  
  const engagement = totalLeads > 0 ? ((engagedUsers / totalLeads) * 100).toFixed(2) : 0;
  
  console.log(`📊 Engagement: ${engagedUsers} engaged out of ${totalLeads} total leads (${engagement}%)`);
  console.log(`📉 Non-engaged (just registered): ${totalLeads - engagedUsers}`);
  
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
