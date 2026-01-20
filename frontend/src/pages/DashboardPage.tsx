
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ORDERS_API, PAYMENTS_API } from '../lib/axios';
import { 
    Package, Truck, LogOut, Map as MapIcon, 
    CreditCard, Clock, CheckCircle, TrendingUp, 
    AtSign, Phone, MapPin, User, ChevronRight,
    Search, Filter, Plus
} from 'lucide-react';
import TrackingMap from '../components/TrackingMap';
import OrderTimeline from '../components/OrderTimeline';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [newOrder, setNewOrder] = useState({
    pickup_address: '', dropoff_address: '', receiver_name: '', price: 0
  });
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [trackingLocations, setTrackingLocations] = useState<Record<string, {lat: number, lng: number}>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    const u = JSON.parse(userStr);
    setUser(u);
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
    } catch (e) { 
        console.error(e); 
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);

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
  }, [user, orders.length]);

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
      setNewOrder({ pickup_address: '', dropoff_address: '', receiver_name: '', price: 0 });
      setTimeout(fetchOrders, 1000);
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

  // Derived stats
  const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      assigned: orders.filter(o => o.status === 'ASSIGNED' || o.status === 'PICKED_UP').length,
      earnings: orders.filter(o => o.status === 'DELIVERED').reduce((acc, o) => acc + (o.price || 0), 0)
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Premium Glass Header */}
      <header className="glass-header px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Truck className="text-white" size={24} />
                  </div>
                  <div>
                      <h1 className="text-xl font-bold text-slate-900 tracking-tight">RapidParcel</h1>
                      <p className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold">Distributed Logistics</p>
                  </div>
              </div>

              <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-900">{user?.first_name} {user?.last_name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded leading-none">{user?.role}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <button onClick={logout} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all hover:rotate-12">
                      <LogOut size={20}/>
                  </button>
              </div>
          </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
          {/* Stats Bar */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-premium flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <Package size={24} />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Total Orders</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  </div>
              </div>
              <div className="card-premium flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center">
                      <Clock size={24} />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Waitlist</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                  </div>
              </div>
              <div className="card-premium flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <CheckCircle size={24} />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Active</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.assigned}</p>
                  </div>
              </div>
              <div className="card-premium flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <TrendingUp size={24} />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{user?.role === 'COURIER' ? 'Earnings' : 'Spent'}</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.earnings} ETB</p>
                  </div>
              </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sidebar: New Requests / Available Jobs */}
              <aside className="lg:col-span-4 space-y-8">
                  {user?.role === 'CUSTOMER' && (
                    <div className="card-premium !bg-indigo-600 !text-white !border-none shadow-xl shadow-indigo-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex gap-2 items-center"><Plus size={24}/> New Delivery</h2>
                        </div>
                        <form onSubmit={createOrder} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-indigo-200 ml-1">Pickup Information</label>
                                <input placeholder="Full Pickup Address" className="w-full bg-white/10 border border-white/20 p-3 rounded-xl placeholder:text-indigo-200 outline-none focus:bg-white/20 transition-all" 
                                    value={newOrder.pickup_address} onChange={e=>setNewOrder({...newOrder, pickup_address: e.target.value})} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-indigo-200 ml-1">Dropoff Information</label>
                                <input placeholder="Complete Destination" className="w-full bg-white/10 border border-white/20 p-3 rounded-xl placeholder:text-indigo-200 outline-none focus:bg-white/20 transition-all" 
                                    value={newOrder.dropoff_address} onChange={e=>setNewOrder({...newOrder, dropoff_address: e.target.value})} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-indigo-200 ml-1">Recipient Name</label>
                                <input placeholder="Package Receiver" className="w-full bg-white/10 border border-white/20 p-3 rounded-xl placeholder:text-indigo-200 outline-none focus:bg-white/20 transition-all" 
                                    value={newOrder.receiver_name} onChange={e=>setNewOrder({...newOrder, receiver_name: e.target.value})} required />
                            </div>
                            
                            <div className="pt-2">
                                <button className="w-full bg-white text-indigo-600 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                    Launch Order <ChevronRight size={18} />
                                </button>
                                <p className="text-[10px] text-center mt-3 text-indigo-200 font-medium italic">
                                    Base: 50 ETB + Dist: 15 ETB/KM
                                </p>
                            </div>
                        </form>
                    </div>
                  )}

                  {user?.role === 'COURIER' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Search size={20} className="text-indigo-500" /> Open Marketplace
                            </h2>
                            <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Live</span>
                        </div>
                        
                        {availableOrders.length === 0 && (
                            <div className="card-premium flex flex-col items-center justify-center text-center p-12 bg-white/50 border-dashed">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                    <Clock size={32} />
                                </div>
                                <p className="text-slate-400 font-medium text-sm">Scanning for new delivery requests...</p>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            {availableOrders.map(order => (
                                <div key={order.id} className="card-premium group hover:border-indigo-500 active:scale-[0.98]">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="font-bold text-slate-900">#ORD-{order.id.slice(0,6).toUpperCase()}</p>
                                        <span className="text-emerald-600 font-black text-lg">{order.price} ETB</span>
                                    </div>
                                    <div className="space-y-3 relative before:absolute before:left-[7px] before:top-[7px] before:bottom-[7px] before:w-0.5 before:bg-slate-100 mb-6">
                                        <div className="flex items-start gap-4 text-xs">
                                            <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50 mt-1 z-10" />
                                            <div>
                                                <p className="font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Pickup</p>
                                                <p className="font-medium text-slate-700">{order.pickup_address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 text-xs">
                                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 mt-1 z-10" />
                                            <div>
                                                <p className="font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Dropoff</p>
                                                <p className="font-medium text-slate-700">{order.dropoff_address}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => acceptOrder(order.id)} 
                                        className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600">
                                        Claim Job
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}
              </aside>

              {/* Main Content: Order Flow */}
              <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          {user?.role === 'COURIER' ? 'My Assignments' : 'Active Timeline'}
                      </h2>
                      <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all">
                              <Filter size={20} />
                          </button>
                      </div>
                  </div>

                  {orders.length === 0 && !loading && (
                      <div className="card-premium flex flex-col items-center justify-center p-20 border-dashed text-center">
                          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200 mb-6">
                              <Package size={48} />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">No activity yet</h3>
                          <p className="text-slate-500 max-w-xs mb-8">
                              {user?.role === 'CUSTOMER' 
                                ? "Ready to ship something? Start by creating your first delivery request."
                                : "No active deliveries. Check the marketplace to find open jobs nearby."}
                          </p>
                          {user?.role === 'COURIER' && (
                              <button className="flex items-center gap-2 text-indigo-600 font-bold">
                                  Go to Marketplace <ChevronRight size={18} />
                              </button>
                          )}
                      </div>
                  )}

                  <div className="grid grid-cols-1 gap-6">
                      {orders.map((order) => (
                          <div key={order.id} className="card-premium !p-0 overflow-hidden flex flex-col md:flex-row border-slate-200/50 hover:border-indigo-200 shadow-xl shadow-slate-200/20 group">
                              {/* Left Map/Visual indicator for status */}
                              <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 overflow-hidden relative min-h-[160px]">
                                  {order.status === 'PICKED_UP' ? (
                                      <div className="h-full scale-105 group-hover:scale-100 transition-transform duration-700">
                                          <TrackingMap 
                                            pickup={{ lat: order.pickup_lat, lng: order.pickup_lng }}
                                            dropoff={{ lat: order.dropoff_lat, lng: order.dropoff_lng }}
                                            courier={trackingLocations[order.id] || (order.courier_lat ? { lat: order.courier_lat, lng: order.courier_lng } : undefined)}
                                          />
                                      </div>
                                  ) : (
                                      <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
                                          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-3 shadow-lg ${
                                              order.status === 'DELIVERED' ? 'bg-emerald-500 text-white ring-8 ring-emerald-50' :
                                              order.status === 'PENDING' ? 'bg-yellow-400 text-white ring-8 ring-yellow-50' :
                                              'bg-blue-500 text-white ring-8 ring-blue-50'
                                          }`}>
                                              {order.status === 'DELIVERED' ? <CheckCircle size={32}/> : <Package size={32}/>}
                                          </div>
                                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Status</span>
                                          <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{order.status}</span>
                                      </div>
                                  )}
                              </div>

                              {/* Right Content */}
                              <div className="flex-1 p-6 sm:p-8 flex flex-col">
                                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className="text-2xl font-black text-slate-900">#ORD-{order.id.slice(0,8).toUpperCase()}</span>
                                          </div>
                                          <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                              <Clock size={12} /> Ordered {new Date(order.created_at).toLocaleDateString()}
                                          </p>
                                      </div>
                                      <div className="flex flex-col items-end">
                                          <span className="text-2xl font-black text-indigo-600 leading-none">{order.price} ETB</span>
                                          <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest mt-1">Delivery Fee</span>
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                                      <div className="flex items-start gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                              <MapPin size={20} />
                                          </div>
                                          <div>
                                              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-0.5">Origin</p>
                                              <p className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{order.pickup_address}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-start gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                              <MapPin size={20} />
                                          </div>
                                          <div>
                                              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-0.5">Destination</p>
                                              <p className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{order.dropoff_address}</p>
                                          </div>
                                      </div>
                                  </div>

                                  <OrderTimeline status={order.status} />

                                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                                      <div className="flex items-center gap-6">
                                          <div className="flex flex-col">
                                              <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Recipient</span>
                                              <span className="font-bold text-slate-800 flex items-center gap-1.5"><User size={14} className="text-slate-400" /> {order.receiver_name}</span>
                                          </div>
                                          <div className="flex flex-col">
                                              <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Contact</span>
                                              <span className="font-bold text-slate-800 flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {order.receiver_phone}</span>
                                          </div>
                                      </div>

                                      <div className="flex gap-3 ml-auto">
                                          {/* CUSTOMER PAY BUTTON */}
                                          {user?.role === 'CUSTOMER' && order.paymentStatus === 'PENDING' && (
                                              <button onClick={() => payOrder(order.id, order.price)} 
                                                  className="bg-emerald-600 text-white font-black px-6 py-2.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95">
                                                  <CreditCard size={18}/> Pay Now
                                              </button>
                                          )}
                                          
                                          {/* COURIER ACTIONS */}
                                          {user?.role === 'COURIER' && order.status === 'ASSIGNED' && (
                                              <button onClick={() => updateStatus(order.id, 'PICKED_UP')}
                                                  className="btn-primary">
                                                  Start Pickup <Truck size={18} />
                                              </button>
                                          )}
                                          {user?.role === 'COURIER' && order.status === 'PICKED_UP' && (
                                              <button onClick={() => updateStatus(order.id, 'DELIVERED')}
                                                  className="bg-emerald-600 text-white font-black px-6 py-2.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95">
                                                  Mark Delivered <CheckCircle size={18} />
                                              </button>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </main>

      <footer className="p-8 text-center border-t border-slate-200 mt-20">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Powered by RapidParcel Distributed Engine</p>
      </footer>
    </div>
  );
}
