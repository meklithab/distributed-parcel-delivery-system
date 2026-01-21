import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { ORDERS_API, PAYMENTS_API } from '../lib/axios';
import { Package, MapPin, Calendar, CreditCard, Truck, ArrowLeft, DollarSign, XCircle } from 'lucide-react';

export default function OrderDetailsPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
        fetchPaymentDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const res = await api.get(`${ORDERS_API}/${orderId}`);
            setOrder(res.data);
            setLoading(false);
        } catch (e: any) {
            console.error('Failed to fetch order:', e);
            setError('Failed to load order details');
            setLoading(false);
        }
    };

    const fetchPaymentDetails = async () => {
        try {
            const res = await api.get(`${PAYMENTS_API}/order/${orderId}`);
            setPayment(res.data);
        } catch (e: any) {
            console.log('No payment found for this order yet');
        }
    };

    const handlePayNow = () => {
        const targetId = order?.orderId || orderId;
        console.log('Pay Now clicked for order:', targetId);
        if (targetId) {
            // Use react-router navigate to go to the checkout route
            navigate(`/checkout/${targetId}`);
        } else {
            console.error('Cannot navigate: Order ID is missing');
        }
    };

    const handleCancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }

        setCancelling(true);
        try {
            await api.patch(`${ORDERS_API}/${orderId}/cancel`);
            await fetchOrderDetails();
            await fetchPaymentDetails();
            alert('Order cancelled successfully!');
        } catch (e: any) {
            console.error('Failed to cancel order:', e);
            alert('Failed to cancel order: ' + (e.response?.data?.message || e.message));
        } finally {
            setCancelling(false);
        }
    };

    // Check if order can be cancelled
    const canCancelOrder = (): boolean => {
        if (!order) return false;
        // Order can only be cancelled if:
        // 1. Status is PENDING (not yet confirmed/paid)
        // 2. No courier is assigned
        // 3. Payment is not completed
        const paymentCompleted = payment && (payment.status === 'CAPTURED' || payment.status === 'SETTLED');
        return order.status === 'PENDING' && !order.courierId && !paymentCompleted;
    };

    // Check if Pay Now button should be shown
    const shouldShowPayNow = (): boolean => {
        if (!order) return false;
        // Only show Pay Now if:
        // 1. Order status is PENDING
        // 2. Payment is not completed (CAPTURED or SETTLED)
        const paymentCompleted = payment && (payment.status === 'CAPTURED' || payment.status === 'SETTLED');
        return order.status === 'PENDING' && !paymentCompleted;
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'PENDING': 'bg-gray-100 text-gray-700 border-gray-300',
            'CONFIRMED': 'bg-blue-100 text-blue-700 border-blue-300',
            'ASSIGNED_TO_COURIER': 'bg-purple-100 text-purple-700 border-purple-300',
            'PICKED_UP': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'IN_TRANSIT': 'bg-orange-100 text-orange-700 border-orange-300',
            'OUT_FOR_DELIVERY': 'bg-indigo-100 text-indigo-700 border-indigo-300',
            'DELIVERED': 'bg-green-100 text-green-700 border-green-300',
            'FAILED': 'bg-red-100 text-red-700 border-red-300',
            'CANCELLED': 'bg-gray-100 text-gray-700 border-gray-300',
            'RETURNED': 'bg-pink-100 text-pink-700 border-pink-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const getPaymentStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'PENDING': 'bg-yellow-100 text-yellow-700',
            'PROCESSING': 'bg-blue-100 text-blue-700',
            'CAPTURED': 'bg-green-100 text-green-700',
            'SETTLED': 'bg-green-100 text-green-700',
            'FAILED': 'bg-red-100 text-red-700',
            'CANCELLED': 'bg-gray-100 text-gray-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error || 'Order not found'}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const pickupAddr = order.addresses?.find((a: any) => a.addressType === 'PICKUP');
    const deliveryAddr = order.addresses?.find((a: any) => a.addressType === 'DELIVERY');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white shadow px-6 py-4">
                <div className="container mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">Order Details</h1>
                </div>
            </nav>

            <main className="container mx-auto p-6 max-w-5xl">
                {/* Order Header */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Order #{order.orderNumber}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Created: {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {/* Price Display - Always show if available */}
                    {order.price !== undefined && order.price !== null && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
                            <div className="flex items-center gap-2">
                                <DollarSign size={24} className="text-green-600" />
                                <div>
                                    <p className="text-sm text-green-600 font-semibold">Order Price</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        ETB {parseFloat(order.price).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Status */}
                    {payment && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <CreditCard size={20} className="text-gray-600" />
                                    <span className="font-semibold">Payment Status:</span>
                                    <span className={`px-3 py-1 rounded text-sm font-bold ${getPaymentStatusColor(payment.status)}`}>
                                        {payment.status}
                                    </span>
                                </div>
                                {payment.amount && (
                                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                        <DollarSign size={20} />
                                        {payment.currency_code} {parseFloat(payment.amount).toFixed(2)}
                                    </div>
                                )}
                            </div>
                            {(payment.status === 'CAPTURED' || payment.status === 'SETTLED') && (
                                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                    ✓ Payment completed successfully
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-3 flex-wrap">
                        {/* Pay Now Button - Only show if payment not completed */}
                        {shouldShowPayNow() && (
                            <button
                                onClick={handlePayNow}
                                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
                            >
                                <CreditCard size={20} />
                                Pay Now
                            </button>
                        )}

                        {/* Cancel Order Button - Only show if cancellable */}
                        {canCancelOrder() && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2 disabled:bg-gray-400"
                            >
                                <XCircle size={20} />
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}
                    </div>

                    {/* Cancelled Order Notice */}
                    {order.status === 'CANCELLED' && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 font-semibold flex items-center gap-2">
                                <XCircle size={20} />
                                This order has been cancelled
                            </p>
                        </div>
                    )}
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Pickup Address */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600">
                            <MapPin size={20} />
                            Pickup Address
                        </h3>
                        {pickupAddr ? (
                            <div className="space-y-2 text-sm">
                                <p><strong>Contact:</strong> {pickupAddr.contactName}</p>
                                <p><strong>Phone:</strong> {pickupAddr.contactPhone}</p>
                                {pickupAddr.contactEmail && <p><strong>Email:</strong> {pickupAddr.contactEmail}</p>}
                                <p className="text-gray-600">{pickupAddr.streetAddress}</p>
                                <p className="text-gray-600">{pickupAddr.subcity}, {pickupAddr.kebele}</p>
                                {pickupAddr.woreda && <p className="text-gray-600">Woreda: {pickupAddr.woreda}</p>}
                                {pickupAddr.houseNumber && <p className="text-gray-600">House: {pickupAddr.houseNumber}</p>}
                                {pickupAddr.landmark && <p className="text-gray-600">Landmark: {pickupAddr.landmark}</p>}
                            </div>
                        ) : (
                            <p className="text-gray-500">No pickup address</p>
                        )}
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-600">
                            <MapPin size={20} />
                            Delivery Address
                        </h3>
                        {deliveryAddr ? (
                            <div className="space-y-2 text-sm">
                                <p><strong>Contact:</strong> {deliveryAddr.contactName}</p>
                                <p><strong>Phone:</strong> {deliveryAddr.contactPhone}</p>
                                {deliveryAddr.contactEmail && <p><strong>Email:</strong> {deliveryAddr.contactEmail}</p>}
                                <p className="text-gray-600">{deliveryAddr.streetAddress}</p>
                                <p className="text-gray-600">{deliveryAddr.subcity}, {deliveryAddr.kebele}</p>
                                {deliveryAddr.woreda && <p className="text-gray-600">Woreda: {deliveryAddr.woreda}</p>}
                                {deliveryAddr.houseNumber && <p className="text-gray-600">House: {deliveryAddr.houseNumber}</p>}
                                {deliveryAddr.landmark && <p className="text-gray-600">Landmark: {deliveryAddr.landmark}</p>}
                            </div>
                        ) : (
                            <p className="text-gray-500">No delivery address</p>
                        )}
                    </div>
                </div>

                {/* Parcels */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Package size={20} />
                        Parcel Details
                    </h3>
                    {order.parcels && order.parcels.length > 0 ? (
                        <div className="space-y-4">
                            {order.parcels.map((parcel: any, idx: number) => (
                                <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Parcel Number</p>
                                            <p className="font-semibold">{parcel.parcelNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Weight</p>
                                            <p className="font-semibold">{parcel.weightKg} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Category</p>
                                            <p className="font-semibold">{parcel.category || 'General'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Description</p>
                                            <p className="font-semibold">{parcel.description || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-4 text-xs">
                                        {parcel.isFragile && (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Fragile</span>
                                        )}
                                        {parcel.isPerishable && (
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Perishable</span>
                                        )}
                                        {parcel.requiresSignature && (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Signature Required</span>
                                        )}
                                        {parcel.declaredValue && parseFloat(parcel.declaredValue) > 0 && (
                                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                Declared Value: ETB {parseFloat(parcel.declaredValue).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No parcel information</p>
                    )}
                </div>

                {/* Tracking Events */}
                {order.trackingEvents && order.trackingEvents.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Truck size={20} />
                            Tracking History
                        </h3>
                        <div className="space-y-3">
                            {order.trackingEvents
                                .sort((a: any, b: any) => new Date(b.eventTimestamp).getTime() - new Date(a.eventTimestamp).getTime())
                                .map((event: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 border-l-4 border-blue-500 pl-4 py-2">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">
                                                {event.eventType.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(event.eventTimestamp).toLocaleString()}
                                            </p>
                                            {event.notes && (
                                                <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                                            )}
                                            {event.locationText && (
                                                <p className="text-xs text-gray-500 mt-1">📍 {event.locationText}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Order Metadata */}
                <div className="bg-white rounded-lg shadow p-6 mt-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Calendar size={20} />
                        Order Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Priority</p>
                            <p className="font-semibold">{order.priority}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Service Type</p>
                            <p className="font-semibold">{order.serviceType || 'N/A'}</p>
                        </div>
                        {order.estimatedDeliveryTime && (
                            <div>
                                <p className="text-gray-600">Estimated Delivery</p>
                                <p className="font-semibold">{new Date(order.estimatedDeliveryTime).toLocaleString()}</p>
                            </div>
                        )}
                        {order.actualDeliveryTime && (
                            <div>
                                <p className="text-gray-600">Actual Delivery</p>
                                <p className="font-semibold">{new Date(order.actualDeliveryTime).toLocaleString()}</p>
                            </div>
                        )}
                        {order.price !== undefined && (
                            <div>
                                <p className="text-gray-600">Estimated Price</p>
                                <p className="font-semibold text-green-700">ETB {parseFloat(order.price).toFixed(2)}</p>
                            </div>
                        )}
                        {order.notes && (
                            <div className="col-span-2 md:col-span-3">
                                <p className="text-gray-600">Notes</p>
                                <p className="font-semibold">{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
