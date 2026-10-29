import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types/index.ts';
import { useCanteen } from '../context/CanteenContext.tsx';
import confetti from 'canvas-confetti';
import {
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Star,
  MessageSquare,
  ArrowRight,
  RotateCcw,
  ChefHat,
  BellRing,
} from 'lucide-react';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  const { cancelOrder, rateOrder, refreshOrders } = useCanteen();
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [submittingRating, setSubmittingRating] = useState<boolean>(false);
  const [rated, setRated] = useState<boolean>(false);

  useEffect(() => {
    if (order && order.orderStatus === 'ready') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [order?.orderStatus]);

  if (!order) return null;

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await cancelOrder(order.id);
    }
  };

  const handleRate = async () => {
    setSubmittingRating(true);
    const ok = await rateOrder(order.id, rating, feedbackText);
    setSubmittingRating(false);
    if (ok) setRated(true);
  };

  // Status step calculations
  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Order Placed', desc: 'Received by Canteen POS' },
    { key: 'accepted', label: 'Kitchen Accepted', desc: 'Order sent to prep station' },
    { key: 'preparing', label: 'Cooking & Packing', desc: 'Chefs are preparing your meal' },
    { key: 'ready', label: 'Ready for Pickup', desc: `Collect from Counter ${order.counterNumber}` },
    { key: 'completed', label: 'Completed', desc: 'Collected by student' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex((s) => s.key === status);
  };

  const currentStepIdx = getStepIndex(order.orderStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Digital Token Badge */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white p-6 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Queue Tracking
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 font-medium">Digital Token Number</span>
              <div className="font-heading font-black text-4xl sm:text-5xl text-amber-400 tracking-tight">
                {order.tokenNumber}
              </div>
            </div>

            {/* Stylized QR Code for counter check-in */}
            <div className="bg-white p-2 rounded-2xl shadow-md text-stone-900 text-center">
              <svg viewBox="0 0 40 40" className="w-14 h-14" fill="currentColor">
                <rect x="2" y="2" width="14" height="14" rx="2" fill="#ea580c" />
                <rect x="5" y="5" width="8" height="8" rx="1" fill="#ffffff" />
                <rect x="7" y="7" width="4" height="4" rx="0.5" fill="#ea580c" />

                <rect x="24" y="2" width="14" height="14" rx="2" fill="#1c1917" />
                <rect x="27" y="5" width="8" height="8" rx="1" fill="#ffffff" />
                <rect x="29" y="7" width="4" height="4" rx="0.5" fill="#1c1917" />

                <rect x="2" y="24" width="14" height="14" rx="2" fill="#1c1917" />
                <rect x="5" y="27" width="8" height="8" rx="1" fill="#ffffff" />
                <rect x="7" y="29" width="4" height="4" rx="0.5" fill="#1c1917" />

                <circle cx="28" cy="28" r="3" fill="#ea580c" />
                <circle cx="34" cy="34" r="2" fill="#1c1917" />
                <rect x="20" y="18" width="4" height="6" fill="#1c1917" />
              </svg>
              <span className="text-[9px] font-extrabold text-stone-600 block mt-0.5">SCAN TOKEN</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300">
            <span>Order ID: #{order.id}</span>
            <span>Slot: {order.pickupSlot}</span>
          </div>
        </div>

        {/* Dynamic Estimated Pickup Time Banner */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            order.orderStatus === 'ready'
              ? 'bg-emerald-500 text-white border-emerald-600'
              : order.orderStatus === 'cancelled'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-amber-50 text-amber-950 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                order.orderStatus === 'ready'
                  ? 'bg-white text-emerald-600'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.orderStatus === 'ready' ? (
                <BellRing className="w-5 h-5 animate-bounce" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="font-bold text-sm">
                {order.orderStatus === 'ready' ? (
                  <span>Ready for Pickup at Counter {order.counterNumber}!</span>
                ) : order.orderStatus === 'cancelled' ? (
                  <span>Order Cancelled</span>
                ) : (
                  <span>
                    Ready in approx {order.estimatedPrepTimeMinutes} mins (ETA {order.estimatedReadyTime})
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90">
                {order.orderStatus === 'ready'
                  ? 'Please show your token number at Counter ' + order.counterNumber
                  : `Assigned pickup location: Counter ${order.counterNumber}`}
              </p>
            </div>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
          {order.orderStatus !== 'cancelled' ? (
            <div className="relative pl-6 space-y-6 border-l-2 border-stone-200 ml-3">
              {steps.map((st, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={st.key} className="relative">
                    {/* Step Icon */}
                    <div
                      className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isPassed
                          ? isCurrent
                            ? 'bg-orange-600 text-white ring-4 ring-orange-100 animate-pulse'
                            : 'bg-emerald-500 text-white'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          isCurrent
                            ? 'text-orange-600 font-extrabold'
                            : isPassed
                            ? 'text-stone-900'
                            : 'text-stone-400'
                        }`}
                      >
                        {st.label}
                      </h4>
                      <p className="text-xs text-stone-500">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-800 text-xs">
              This order was cancelled. Payment refunded or cash voided.
            </div>
          )}

          {/* Ordered Food Items */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Order Items ({order.items.length})
            </h4>
            <div className="divide-y divide-stone-100">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{it.quantity}x</span>
                    <span className="text-stone-700 font-medium">{it.name}</span>
                    {it.specialInstructions && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        "{it.specialInstructions}"
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-stone-900">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-between text-xs font-bold text-stone-900">
              <span>Total Paid ({order.paymentMethod.toUpperCase()})</span>
              <span className="text-orange-600">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Feedback & Rating Section if completed or ready */}
          {(order.orderStatus === 'completed' || order.orderStatus === 'ready') && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Rate your meal & canteen service
                </span>
                {rated && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Feedback Submitted!
                  </span>
                )}
              </div>

              {!rated && !order.ratingGiven ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-stone-600 ml-2">{rating}/5 Stars</span>
                  </div>

                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Taste, freshness, pickup speed feedback..."
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />

                  <button
                    onClick={handleRate}
                    disabled={submittingRating}
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Submit Feedback
                  </button>
                </div>
              ) : (
                <p className="text-xs text-stone-600 italic">
                  "{order.feedbackComment || feedbackText || 'Thank you for your rating!'}"
                </p>
              )}
            </div>
          )}

          {/* Cancellation button if still pending */}
          {order.orderStatus === 'pending' && (
            <div className="pt-2 text-center">
              <button
                onClick={handleCancel}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold transition-colors"
              >
                Cancel this Order (Free cancellation before prep)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => refreshOrders()}
            className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Queue Status</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
