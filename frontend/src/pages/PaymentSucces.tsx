import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, Download, Share2 } from "lucide-react";

interface PaymentSuccessProps {
  orderNumber?: string;
  amount?: number;
  currency?: string;
  customerName?: string;
  items?: { name: string; quantity: number; unit_value: number }[];
}

export default function PaymentSuccessPage({ 
  orderNumber = "ORD-20251219-01", 
  amount = 1500, 
  currency = "ETB", 
  customerName = "Meklit Habtamu",
  items = [
    { name: "Parcel 1 - Book", quantity: 1, unit_value: 500 },
    { name: "Parcel 2 - Electronics", quantity: 2, unit_value: 500 },
  ]
}: PaymentSuccessProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Confetti or celebratory logic could go here
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-50" />

        <div className="w-full max-w-2xl z-10 transition-all duration-700 animate-in fade-in zoom-in-95">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-3xl shadow-2xl shadow-emerald-200 mb-6 text-white animate-soft-pulse">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payment Successful!</h1>
                <p className="text-slate-500 mt-3 font-medium text-lg">Thank you, {customerName}. Your delivery is now in motion.</p>
            </div>

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
