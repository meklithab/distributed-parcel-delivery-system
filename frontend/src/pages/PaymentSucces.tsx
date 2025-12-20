import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    // Could fetch confirmation from backend here if needed
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-12 p-8 bg-green-50 rounded shadow-lg">
      <h2 className="text-4xl font-bold text-green-800 mb-6 text-center">Payment Successful!</h2>
      <p className="text-xl text-green-700 mb-6 text-center">Thank you, {customerName}, for your payment.</p>

      <div className="bg-green-100 p-6 rounded mb-6">
        <p className="text-lg mb-2"><strong>Order Number:</strong> {orderNumber}</p>
        <p className="text-lg mb-2"><strong>Amount Paid:</strong> {currency} {amount.toFixed(2)}</p>
      </div>

      <section className="mb-6">
        <h3 className="text-2xl font-semibold text-green-700 mb-4">Order Summary</h3>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between p-3 bg-white rounded shadow-sm">
              <div className="font-medium">{item.name}</div>
              <div>Qty: {item.quantity}</div>
              <div>{currency} {item.unit_value.toFixed(2)}</div>
              <div className="font-semibold">{currency} {(item.quantity * item.unit_value).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right text-xl font-bold text-green-800">
          Total: {currency} {amount.toFixed(2)}
        </div>
      </section>

      <p className="text-green-700 mb-6 text-center">Your order is now being processed and will be delivered soon.</p>

      <div className="text-center">
        <button
          onClick={() => navigate("/")}
          className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 text-lg font-semibold"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
