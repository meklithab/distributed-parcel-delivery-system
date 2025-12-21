import { useState, useEffect } from "react";
import api, { PAYMENTS_API } from "../lib/axios";

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
    // Sample data
    const sampleOrder: OrderDetails = {
      orderId: "order-123456",
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
        },
        {
          parcelNumber: "PCL-002",
          description: "Books package",
          weight: 1.2,
          length: 25,
          width: 15,
          height: 8,
          declaredValue: 300,
          category: "Books",
          isFragile: false,
          isPerishable: false,
          requiresSignature: false,
          insuranceAmount: 0,
          items: [{ name: "Novel Book", quantity: 3, unit_value: 100 }],
        },
      ],
    };
    setOrder(sampleOrder);
  }, []);

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
      setError(err.response?.data?.message || "Server error. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!order) return <p className="text-center mt-20">Loading order...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-12 p-8 bg-green-50 rounded shadow-lg">
      <h2 className="text-4xl font-bold text-green-800 mb-8">Checkout</h2>

      {/* Customer Info */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-green-700 mb-4">Customer Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>Name:</strong> {order.customerName}</p>
          <p><strong>Email:</strong> {order.email}</p>
          <p><strong>Phone:</strong> {order.phone}</p>
          <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
          <p><strong>Order Number:</strong> {order.orderNumber}</p>
        </div>
      </section>

      {/* Parcels & Items */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-green-700 mb-4">Parcels & Items</h3>
        {order.parcels.map((parcel, idx) => (
          <div key={idx} className="mb-6 p-6 border rounded bg-green-100 shadow-sm">
            <h4 className="text-xl font-semibold mb-2">{parcel.parcelNumber} - {parcel.category}</h4>
            <p className="mb-2">{parcel.description}</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <p><strong>Weight:</strong> {parcel.weight} kg</p>
              <p><strong>Dimensions:</strong> {parcel.length} x {parcel.width} x {parcel.height} cm</p>
              <p><strong>Declared Value:</strong> {order.currency} {parcel.declaredValue}</p>
              <p><strong>Insurance:</strong> {order.currency} {parcel.insuranceAmount}</p>
              <p><strong>Fragile:</strong> {parcel.isFragile ? "Yes" : "No"}</p>
              <p><strong>Perishable:</strong> {parcel.isPerishable ? "Yes" : "No"}</p>
              <p><strong>Signature Required:</strong> {parcel.requiresSignature ? "Yes" : "No"}</p>
            </div>

            <table className="w-full text-left border border-green-200">
              <thead className="bg-green-200">
                <tr>
                  <th className="p-2 border">Item</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Unit Price</th>
                  <th className="p-2 border">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {parcel.items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.quantity}</td>
                    <td className="p-2 border">{order.currency} {item.unit_value.toFixed(2)}</td>
                    <td className="p-2 border">{order.currency} {(item.quantity * item.unit_value).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      {/* Total & Payment */}
      <section>
        <div className="text-right mb-4 text-2xl font-bold text-green-800">
          Total: {order.currency} {order.amount.toFixed(2)}
        </div>
        <button
          onClick={handlePayment}
          disabled={paymentLoading}
          className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 w-full text-lg font-semibold"
        >
          {paymentLoading ? "Redirecting to Payment..." : `Pay ${order.currency} ${order.amount.toFixed(2)}`}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </section>
    </div>
  );
}
