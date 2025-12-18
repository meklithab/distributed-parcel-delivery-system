
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ORDERS_API, PAYMENTS_API } from '../lib/axios';
import { Package, Truck, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [newOrder, setNewOrder] = useState({
    pickup_address: '', dropoff_address: '', receiver_name: '', price: 100
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    const u = JSON.parse(userStr);
    setUser(u);
    if(u.role === 'CUSTOMER') fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`${ORDERS_API}/orders/my-orders`);
      // Attach payment status
      const ordersWithPayment = await Promise.all(res.data.map(async (o: any) => {
         try {
             const p = await api.get(`${PAYMENTS_API}/payments/${o.id}`);
             return { ...o, paymentStatus: p.data.status, paymentId: p.data.id, amount: p.data.amount };
         } catch(e) { return { ...o, paymentStatus: 'UNINITIATED' }; }
      }));
      setOrders(ordersWithPayment);
    } catch (e) { console.error(e); }
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`${ORDERS_API}/orders`, {
          ...newOrder,
          pickup_lat: 9.0, pickup_lng: 38.0, 
          dropoff_lat: 9.1, dropoff_lng: 38.1,
          receiver_phone: '0911000000'
      });
      setNewOrder({ pickup_address: '', dropoff_address: '', receiver_name: '', price: 100 });
      setTimeout(fetchOrders, 1000); // Wait for rabbitmq
    } catch (e) { alert('Failed to create order'); }
  };

  const payOrder = async (orderId: string, amount: number) => {
    try {
       await api.post(`${PAYMENTS_API}/payments/pay`, { orderId, amount });
       fetchOrders();
    } catch (e) { alert('Payment failed'); }
  };

  const logout = () => {
      localStorage.clear();
      navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2 text-primary">
            <Truck /> Delivery App
        </h1>
        <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.first_name}</span>
            <button onClick={logout} className="text-red-500 hover:text-red-700"><LogOut size={20}/></button>
        </div>
      </nav>

      <main className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Order Panel */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
            <h2 className="text-lg font-bold mb-4 flex gap-2 items-center"><Package size={20}/> New Request</h2>
            <form onSubmit={createOrder} className="space-y-3">
                <input placeholder="Pickup Address" className="w-full border p-2 rounded" 
                    value={newOrder.pickup_address} onChange={e=>setNewOrder({...newOrder, pickup_address: e.target.value})} required />
                <input placeholder="Dropoff Address" className="w-full border p-2 rounded" 
                    value={newOrder.dropoff_address} onChange={e=>setNewOrder({...newOrder, dropoff_address: e.target.value})} required />
                <input placeholder="Receiver Name" className="w-full border p-2 rounded" 
                    value={newOrder.receiver_name} onChange={e=>setNewOrder({...newOrder, receiver_name: e.target.value})} required />
                <input type="number" placeholder="Price (ETB)" className="w-full border p-2 rounded" 
                    value={newOrder.price} onChange={e=>setNewOrder({...newOrder, price: Number(e.target.value)})} required />
                <button className="w-full bg-primary text-white p-2 rounded hover:bg-blue-700">Create Order</button>
            </form>
        </div>

        {/* Order List Panel */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">My Orders</h2>
            <div className="space-y-4">
                {orders.length === 0 && <p className="text-gray-500">No orders found.</p>}
                {orders.map((order) => (
                    <div key={order.id} className="border p-4 rounded flex justify-between items-center bg-gray-50">
                        <div>
                            <p className="font-semibold text-lg">#{order.id.slice(0,8)}</p>
                            <p className="text-sm text-gray-600">{order.pickup_address} ➝ {order.dropoff_address}</p>
                            <p className="text-sm">Price: {order.price} ETB</p>
                        </div>
                        <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {order.status}
                            </span>
                            <div className="mt-2">
                                {order.paymentStatus === 'PENDING' && (
                                    <button onClick={() => payOrder(order.id, order.price)} 
                                        className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700">
                                        Pay Now
                                    </button>
                                )}
                                {order.paymentStatus === 'COMPLETED' && (
                                    <span className="text-green-600 text-sm font-semibold">Paid ✅</span>
                                )}
                                {order.paymentStatus === 'UNINITIATED' && (
                                    <span className="text-gray-400 text-sm italic">Processing...</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
