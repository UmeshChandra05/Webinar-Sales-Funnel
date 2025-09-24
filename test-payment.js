// Simple test script to verify payment functionality
const axios = require('axios');

async function testPayment() {
  try {
    console.log('🧪 Testing payment simulation without coupon...');
    
    const paymentData = {
      email: 'test@example.com',
      status: 'success',
      transaction_id: `test_${Date.now()}`
    };
    
    console.log('Sending request:', paymentData);
    
    const response = await axios.post('http://localhost:5000/api/simulate-payment', paymentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

async function testPaymentWithCoupon() {
  try {
    console.log('\n🧪 Testing payment simulation with coupon...');
    
    const paymentData = {
      email: 'test@example.com',
      status: 'success',
      transaction_id: `test_${Date.now()}`,
      couponCode: 'TEST20',
      discount: 20
    };
    
    console.log('Sending request:', paymentData);
    
    const response = await axios.post('http://localhost:5000/api/simulate-payment', paymentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

// Run tests
testPayment().then(() => testPaymentWithCoupon());