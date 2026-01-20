import { useState, useEffect } from "react";
import api, { PAYMENTS_API } from "../lib/axios";
import { 
  CreditCard, ShieldCheck, Mail, Phone, MapPin, 
  Package, ChevronLeft, ArrowRight, CheckCircle2 
} from "lucide-react";
import { Link } from "react-router-dom";

interface OrderItem {
  name: string;
  quantity: number;
  unit_value: number;
}

interface Parcel {
  parcelNumber: string;
  description: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  declaredValue?: number;
  category?: string;
  isFragile?: boolean;
  isPerishable?: boolean;
  requiresSignature?: boolean;
  insuranceAmount?: number;
  items: OrderItem[];
}

interface OrderDetails {
  orderId: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  amount: number;
  currency: string;
  parcels: Parcel[];
}

export default function CheckoutPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Sample data - In production this would fetch by orderId
    const sampleOrder: OrderDetails = {
      orderId: orderId || "order-123456",
      orderNumber: "ORD-20251219-01",
      customerName: "Meklit Habtamu",
      email: "mk543gg@gmail.com",
      phone: "+251953442961",
      deliveryAddress: "1234 Bole Road, Addis Ababa, Ethiopia",
      amount: 1500,
      currency: "ETB",
      parcels: [
        {
          parcelNumber: "PCL-001",
          description: "Electronics package",
          weight: 2.5,
          length: 30,
          width: 20,
          height: 10,
          declaredValue: 1200,
          category: "Electronics",
          isFragile: true,
          isPerishable: false,
          requiresSignature: true,
          insuranceAmount: 200,
          items: [
            { name: "Headphones", quantity: 1, unit_value: 500 },
            { name: "Charger", quantity: 2, unit_value: 100 },
          ],
        }
      ],
    };
    setOrder(sampleOrder);
  }, [orderId]);

  const handlePayment = async () => {
    if (!order) return;
    setPaymentLoading(true);
    setError("");
    try {
      const response = await api.post(`${PAYMENTS_API}/chapa/initiate`, {
        first_name: order.customerName.split(" ")[0],
        last_name: order.customerName.split(" ")[1] || "",
        email: order.email,
        phone_number: order.phone,
        amount: order.amount,
      });
      const { checkout_url } = response.data;
      window.location.href = checkout_url;
    } catch (err: any) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.message || "Payment initiation failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Checkout Navbar */}
      <header className="glass-header px-6 py-4 mb-8">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm">
                  <ChevronLeft size={20} /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Checkout</span>
              </div>
          </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-8">
            <section>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Checkout</h2>
                <p className="text-slate-500 text-sm font-medium">Please review your order details before payment</p>
            </section>

            {/* Customer Details Card */}
            <div className="card-premium">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Mail size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Delivery Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Customer</p>
                            <p className="font-bold text-slate-700">{order.customerName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Contact</p>
                            <p className="font-medium text-slate-600">{order.email}</p>
                            <p className="font-medium text-slate-600">{order.phone}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Address</p>
                            <div className="flex items-start gap-2 mt-1">
                                <MapPin size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                                <p className="font-medium text-slate-600 leading-relaxed">{order.deliveryAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Summary */}
            <div className="card-premium">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Package size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Order Summary</h3>
                </div>
                
                <div className="space-y-6">
                    {order.parcels.map((parcel, idx) => (
                        <div key={idx} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-black text-slate-900">{parcel.parcelNumber}</h4>
                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-tighter">{parcel.category}</p>
                                </div>
                                <span className="text-xs px-2.5 py-1 bg-white border border-slate-200 text-slate-500 rounded-lg font-bold uppercase tracking-widest">{parcel.weight} KG</span>
                            </div>
                            
                            <table className="w-full text-sm">
                                <thead className="text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <tr>
                                        <th className="pb-3 px-1">Item Description</th>
                                        <th className="pb-3 px-1 text-center">Qty</th>
                                        <th className="pb-3 px-1 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700 divide-y divide-slate-100">
                                    {parcel.items.map((item, i) => (
                                        <tr key={i} className="group">
                                            <td className="py-3 px-1 font-bold group-hover:text-indigo-600 transition-colors">{item.name}</td>
                                            <td className="py-3 px-1 text-center font-medium">{item.quantity}</td>
                                            <td className="py-3 px-1 text-right font-black">{order.currency} {item.unit_value.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Payment Column */}
        <div className="lg:col-span-4">
            <div className="card-premium sticky top-24 !p-0 overflow-hidden shadow-xl shadow-indigo-100">
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    {/* Abstract Circle */}
                    <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    
                    <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">Total Amount Due</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">{order.currency}</span>
                        <span className="text-5xl font-black tracking-tight">{order.amount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-soft-pulse">
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                        <p className="text-xs font-bold text-emerald-700 leading-tight">Your delivery is protected by our global insurance policy.</p>
                    </div>

                    <div className="space-y-4 pt-2">
                        <button 
                            onClick={handlePayment}
                            disabled={paymentLoading}
                            className="w-full btn-primary py-4 text-xl font-black shadow-indigo-200"
                        >
                            {paymentLoading ? "Processing..." : "Complete Payment"}
                            {!paymentLoading && <ArrowRight size={20} />}
                        </button>
                        
                        <div className="flex items-center justify-center gap-4 py-4 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                             <CreditCard size={24} />
                             <div className="h-6 w-px bg-slate-300" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Powered by Chapa</span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                            {error}
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck size={12} /> 256-bit encrypted transaction
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
