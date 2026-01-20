
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ORDERS_API, PAYMENTS_API } from '../lib/axios';
import { Package, Truck, LogOut, Map as MapIcon } from 'lucide-react';
import TrackingMap from '../components/TrackingMap';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [newOrder, setNewOrder] = useState({
    pickup_address: '', dropoff_address: '', receiver_name: '', price: 100
  });
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [trackingLocations, setTrackingLocations] = useState<Record<string, {lat: number, lng: number}>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    const u = JSON.parse(userStr);
    setUser(u);
    // Removed direct fetchOrders() call here to avoid race condition with state update
  }, []);

  const fetchOrders = async () => {
    try {
      if (user?.role === 'COURIER') {
          const assignedRes = await api.get(`${ORDERS_API}/orders/my-orders`);
          setOrders(assignedRes.data);
          const availableRes = await api.get(`${ORDERS_API}/orders/available`);
          setAvailableOrders(availableRes.data);
      } else {
          const res = await api.get(`${ORDERS_API}/orders/my-orders`);
          const ordersWithPayment = await Promise.all(res.data.map(async (o: any) => {
             // Fetch latest courier location for tracking if picked up
             if (o.status === 'PICKED_UP' && o.id) {
                 try {
                     const orderRes = await api.get(`${ORDERS_API}/orders/${o.id}`);
                     if (orderRes.data.courier_lat) {
                         setTrackingLocations(prev => ({
                             ...prev,
                             [o.id]: { lat: orderRes.data.courier_lat, lng: orderRes.data.courier_lng }
                         }));
                     }
                 } catch(e) {}
             }
             try {
                 const p = await api.get(`${PAYMENTS_API}/payments/${o.id}`);
                 return { ...o, paymentStatus: p.data.status, paymentId: p.data.id, amount: p.data.amount };
             } catch(e) { return { ...o, paymentStatus: 'UNINITIATED' }; }
          }));
          setOrders(ordersWithPayment);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (user) {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);

        // Share location if courier has active pickups
        let watchId: number;
        if (user.role === 'COURIER') {
            watchId = window.navigator.geolocation.watchPosition(async (pos) => {
                const activeOrder = orders.find(o => o.status === 'PICKED_UP');
                if (activeOrder) {
                    try {
                        await api.patch(`${ORDERS_API}/orders/${activeOrder.id}/location`, {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        });
                    } catch(e) {}
                }
            });
        }

        return () => {
            clearInterval(interval);
            if (watchId) window.navigator.geolocation.clearWatch(watchId);
        };
    }
  }, [user, orders.length]); // Re-run if orders list changes to find active pickup

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Randomize coordinates slightly for demo to show price variation
      const plat = 9.0 + (Math.random() * 0.1);
      const plng = 38.0 + (Math.random() * 0.1);
      const dlat = 9.0 + (Math.random() * 0.1);
      const dlng = 38.0 + (Math.random() * 0.1);

      await api.post(`${ORDERS_API}/orders`, {
          ...newOrder,
          pickup_lat: plat, pickup_lng: plng, 
          dropoff_lat: dlat, dropoff_lng: dlng,
          receiver_phone: '09' + Math.floor(Math.random() * 100000000)
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

  const acceptOrder = async (orderId: string) => {
      try {
          await api.patch(`${ORDERS_API}/orders/${orderId}/assign`, { courier_id: user.id });
          fetchOrders();
      } catch (e) { alert('Failed to accept order'); }
  }

  const updateStatus = async (orderId: string, status: string) => {
      try {
          await api.patch(`${ORDERS_API}/orders/${orderId}/status`, { status });
          fetchOrders();
      } catch (e) { alert('Failed to update status'); }
  }

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
            <span className="text-gray-600 font-medium">Welcome, {user?.first_name} ({user?.role})</span>
            <button onClick={logout} className="text-red-500 hover:text-red-700 transition-colors">
                <LogOut size={20}/>
            </button>
        </div>
      </nav>

      <main className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Actions/Available Jobs */}
        <div className="space-y-6">
            {user?.role === 'CUSTOMER' && (
                <div className="bg-white p-6 rounded-lg shadow h-fit">
                    <h2 className="text-lg font-bold mb-4 flex gap-2 items-center"><Package size={20}/> New Request</h2>
                    <form onSubmit={createOrder} className="space-y-3">
                        <input placeholder="Pickup Address" className="w-full border p-2 rounded" 
                            value={newOrder.pickup_address} onChange={e=>setNewOrder({...newOrder, pickup_address: e.target.value})} required />
                        <input placeholder="Dropoff Address" className="w-full border p-2 rounded" 
                            value={newOrder.dropoff_address} onChange={e=>setNewOrder({...newOrder, dropoff_address: e.target.value})} required />
                        <input placeholder="Receiver Name" className="w-full border p-2 rounded" 
                            value={newOrder.receiver_name} onChange={e=>setNewOrder({...newOrder, receiver_name: e.target.value})} required />
                        <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
                             Price is calculated based on distance (50 ETB + 15 ETB/KM)
                        </div>
                        <button className="w-full bg-primary text-white p-2 rounded hover:bg-blue-700 transition-colors">
                            Create Order
                        </button>
                    </form>
                </div>
            )}

            {user?.role === 'COURIER' && (
                 <div className="bg-white p-6 rounded-lg shadow h-fit">
                    <h2 className="text-lg font-bold mb-4 flex gap-2 items-center text-primary"><Truck size={20}/> Available Jobs</h2>
                    {availableOrders.length === 0 && <p className="text-gray-500 text-sm">No jobs available right now.</p>}
                    <div className="space-y-3">
                        {availableOrders.map(order => (
                            <div key={order.id} className="border p-3 rounded bg-gray-50 hover:border-primary transition-colors">
                                <p className="font-semibold text-sm">Order #{order.id.slice(0,8)}</p>
                                <div className="text-xs text-gray-600 mt-2">
                                    <p><span className="font-medium">From:</span> {order.pickup_address}</p>
                                    <p><span className="font-medium">To:</span> {order.dropoff_address}</p>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="font-bold text-sm text-green-700">{order.price} ETB</span>
                                    <button onClick={() => acceptOrder(order.id)} 
                                        className="bg-primary text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                                        Accept Job
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
        </div>

        {/* Right Column: Order List */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">
                {user?.role === 'COURIER' ? 'My Assigned Deliveries' : 'My Orders'}
            </h2>
            <div className="space-y-4">
                {orders.length === 0 && <p className="text-gray-500 italic">No orders to display.</p>}
                {orders.map((order) => (
                    <div key={order.id} className="border p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-lg text-gray-800">#{order.id.slice(0,8)}</p>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">{order.pickup_address} ➝ <span className="font-medium">{order.dropoff_address}</span></p>
                            <p className="text-sm font-medium mt-1">Fee: {order.price} ETB</p>
                            
                            {user?.role === 'CUSTOMER' && order.status === 'PICKED_UP' && trackingLocations[order.id] && (
                                <div className="mt-2 bg-green-50 p-2 rounded text-[11px] text-green-700 flex items-center gap-2">
                                    <Truck size={12}/> Live Location: 
                                    {trackingLocations[order.id].lat.toFixed(4)}, {trackingLocations[order.id].lng.toFixed(4)}
                                </div>
                            )}

                            {order.status === 'PICKED_UP' && (
                                <div className="mt-3">
                                    <TrackingMap 
                                        pickup={{ lat: order.pickup_lat, lng: order.pickup_lng }}
                                        dropoff={{ lat: order.dropoff_lat, lng: order.dropoff_lng }}
                                        courier={trackingLocations[order.id] || (order.courier_lat ? { lat: order.courier_lat, lng: order.courier_lng } : undefined)}
                                    />
                                </div>
                            )}

                            {user?.role === 'COURIER' && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <p className="text-[11px] text-gray-500">CLIENT INFO</p>
                                    <p className="text-xs font-semibold">{order.receiver_name}</p>
                                    <p className="text-xs">{order.receiver_phone}</p>
                                </div>
                            )}
                        </div>

                        <div className="text-right flex flex-col items-end gap-3 w-full sm:w-auto">
                            {/* CUSTOMER ACTIONS */}
                            {user?.role === 'CUSTOMER' && (
                                <div className="flex flex-col items-end gap-2">
                                    {order.paymentStatus === 'PENDING' && (
                                        <button onClick={() => payOrder(order.id, order.price)} 
                                            className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-green-700 shadow-sm transition-all">
                                            Pay Now
                                        </button>
                                    )}
                                    {order.paymentStatus === 'COMPLETED' && (
                                        <span className="flex items-center gap-1 text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">
                                            Paid
                                        </span>
                                    )}
                                    {order.paymentStatus === 'UNINITIATED' && (
                                        <span className="text-gray-400 text-xs italic">Awaiting Payment Setup...</span>
                                    )}
                                </div>
                            )}

                            {/* COURIER ACTIONS */}
                            {user?.role === 'COURIER' && order.status !== 'DELIVERED' && (
                                <div className="flex gap-2">
                                    {order.status === 'ASSIGNED' && (
                                        <button onClick={() => updateStatus(order.id, 'PICKED_UP')}
                                            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700 shadow-sm transition-all focus:ring-2 focus:ring-blue-300">
                                            Mark Picked Up
                                        </button>
                                    )}
                                    {order.status === 'PICKED_UP' && (
                                        <button onClick={() => updateStatus(order.id, 'DELIVERED')}
                                            className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-green-700 shadow-sm transition-all focus:ring-2 focus:ring-green-300">
                                            Confirm Delivery
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
