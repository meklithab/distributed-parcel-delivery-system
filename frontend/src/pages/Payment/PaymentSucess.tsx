import { useEffect, useState } from "react"; 
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { ORDERS_API } from "../../lib/axios";
import { CheckCircle2, Package, ArrowRight, Download, Share2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const pollOrderUntilConfirmed = async () => {
      const maxAttempts = 12;
      const intervalMs = 5000;

      for (let attempt = 0; attempt < maxAttempts && !cancelled; attempt++) {
        try {
          const res = await api.get(`${ORDERS_API}/${orderId}`);
          const latest = res.data;
          setOrder(latest);

          if (latest?.status === 'CONFIRMED') {
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Polling fetch failed:', err);
        }

        await new Promise((r) => setTimeout(r, intervalMs));
      }

      try {
        const res = await api.get(`${ORDERS_API}/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Final fetch failed:', err);
        setError('Could not load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      (async () => {
        await pollOrderUntilConfirmed();
      })();
    } else {
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Prepare order data
  const orderNumber = order?.orderNumber || "Unknown";
  const amount = Number(order?.price ?? order?.amount ?? 0);
  const currency = "ETB";
  const addresses = order?.addresses || [];
  const deliveryAddress = addresses.find((a: any) => a.addressType === 'DELIVERY');
  const customerName = deliveryAddress ? deliveryAddress.contactName : "Customer";

  const items = order?.parcels?.flatMap((p: any) =>
    p.items?.map((i: any) => ({
      name: i.name,
      quantity: i.quantity,
      unit_value: Number(i.unitValue)
    })) || [{ name: p.description, quantity: 1, unit_value: 0 }]
  ) || [];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[100px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-50" />

      <div className="w-full max-w-2xl z-10 transition-all duration-700 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-3xl shadow-2xl shadow-emerald-200 mb-6 text-white animate-soft-pulse">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payment Successful!</h1>
          <p className="text-slate-500 mt-3 font-medium text-lg">Thank you, {customerName}. Your delivery is now in motion.</p>
        </div>

        {/* Order Card */}
        <div className="card-premium !p-0 overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Receipt Number</p>
              <h2 className="text-xl font-bold">{orderNumber}</h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Amount Paid</p>
              <h2 className="text-2xl font-black text-emerald-400">{currency} {amount.toFixed(2)}</h2>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Order Summary</h3>
            <div className="space-y-4 mb-10">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs font-medium text-slate-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">{currency} {(item.quantity * item.unit_value).toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-slate-400">{currency} {item.unit_value.toFixed(2)} unit</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate("/dashboard")}
                className="flex-1 btn-primary py-4 text-lg font-bold"
              >
                Track Order <ArrowRight size={20} />
              </button>
              <div className="flex gap-4">
                <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-95" title="Download Receipt">
                  <Download size={24} />
                </button>
                <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-95" title="Share Status">
                  <Share2 size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-emerald-50 text-center border-t border-emerald-100/50">
            <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> Estimated delivery in 24-48 hours.
            </p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-10 font-bold uppercase tracking-widest">
          RapidParcel Secure Transaction Engine
        </p>
      </div>
    </div>
  );
}
