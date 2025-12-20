import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:3002/api';
const JWT_SECRET = 'dev_secret_key_12345';

// Generate valid UUIDs
const testUserId = uuidv4();
const testCustomerId = uuidv4();

// Generate a test token
const token = jwt.sign(
  { userId: testUserId, role: 'customer' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const headers = {
  Authorization: `Bearer ${token}`
};

async function testEndpoints() {
  try {
    console.log('--- Testing Order Service Endpoints ---');

    // 1. Create Order
    console.log('\n1. Creating Order...');
    const createOrderRes = await axios.post(`${API_URL}/orders`, {
      customer_id: testCustomerId,
      service_type: 'DOOR_TO_DOOR',
      priority: 'STANDARD',
      notes: 'Please leave at the front door'
    }, { headers });
    
    const order = createOrderRes.data;
    console.log('Order created:', order.order_id);
    const orderId = order.order_id;

    // 2. Add Address
    console.log('\n2. Adding Address...');
    const createAddressRes = await axios.post(`${API_URL}/orders/${orderId}/addresses`, {
      address_type: 'PICKUP',
      contact_name: 'John Doe',
      contact_phone: '+251911223344',
      street_address: 'Bole Road',
      subcity: 'Bole',
      kebele: '03',
      house_number: '123'
    }, { headers });
    console.log('Address added:', createAddressRes.data.address_id);

    // 3. Add Parcel
    console.log('\n3. Adding Parcel...');
    const createParcelRes = await axios.post(`${API_URL}/orders/${orderId}/parcels`, {
      description: 'Electronics',
      weight_kg: 2.5,
      is_fragile: true
    }, { headers });
    console.log('Parcel added:', createParcelRes.data.parcel_id);
    const parcelId = createParcelRes.data.parcel_id;

    // 4. Add Tracking Event
    console.log('\n4. Adding Tracking Event...');
    const createTrackingRes = await axios.post(`${API_URL}/orders/${orderId}/tracking`, {
      event_type: 'ORDER_CREATED',
      location_text: 'Addis Ababa',
      notes: 'Order initiated'
    }, { headers });
    console.log('Tracking event added:', createTrackingRes.data.event_id);

    // 5. Get Order by ID
    console.log('\n5. Getting Order by ID...');
    const getOrderRes = await axios.get(`${API_URL}/orders/${orderId}`, { headers });
    console.log('Order details fetched successfully');
    console.log('Addresses count:', getOrderRes.data.addresses.length);
    console.log('Parcels count:', getOrderRes.data.parcels.length);

    // 6. Global endpoints
    console.log('\n6. Testing Global Endpoints...');
    await axios.get(`${API_URL}/parcels/${parcelId}`, { headers });
    console.log('Parcel fetched by global ID');

    console.log('\n--- All Tests Passed Successfully ---');

  } catch (error: any) {
    console.error('\nTest failed:', error.response ? error.response.data : error.message);
  }
}

testEndpoints();
