import React from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { Order } from '../types/index.ts';
import {
  Clock,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Star,
  ArrowRight,
  ShoppingBag,
  BellRing,
} from 'lucide-react';

export const StudentOrders: React.FC = () => {
  const { orders, currentUser, setTrackedOrder, addToCart, menuItems, setIsCartOpen, setActiveTab, refreshOrders } =
    useCanteen();

  // Student orders
  const studentOrders = orders.filter((o) => o.userId === currentUser.id);

  const activeOrders = studentOrders.filter(
    (o) => o.orderStatus === 'pending' || o.orderStatus === 'accepted' || o.orderStatus === 'preparing' || o.orderStatus === 'ready'
  );

  const pastOrders = studentOrders.filter(
    (o) => o.orderStatus === 'completed' || o.orderStatus === 'cancelled'
  );

  // Quick Reorder
  const handleReorder = (order: Order) => {
    order.items.forEach((it) => {
      const food = menuItems.find((f) => f.id === it.foodId);
      if (food && food.isAvailable) {
        addToCart(food, it.quantity, it.specialInstructions);
      }
    });
    setIsCartOpen(true);
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white animate-pulse shadow-sm">
            <BellRing className="w-3.5 h-3.5 animate-bounce" />
            READY FOR PICKUP
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Cooking in Kitchen
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            Kitchen Accepted
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            Order Queued
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Collected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900 tracking-tight">
            My Orders & Digital Tokens
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Logged in as {currentUser.name} ({currentUser.studentId})
          </p>
        </div>

        <button
          onClick={() => refreshOrders()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Active Orders Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Live Orders in Preparation ({activeOrders.length})
        </h2>

        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/80 shadow-xs space-y-3">
            <p className="text-xs text-stone-500">You don't have any active orders right now.</p>
            <button
              onClick={() => setActiveTab('menu')}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-600/20"
            >
              Order Food for Next Recess
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-md relative overflow-hidden flex flex-col justify-between ${
                  order.orderStatus === 'ready'
                    ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-orange-200'
                }`}
              >
                {/* Top strip */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Digital Token
                    </span>
                    <div className="font-heading font-black text-3xl sm:text-4xl text-orange-600">
                      {order.tokenNumber}
                    </div>
                  </div>
                  <div>{getStatusBadge(order.orderStatus)}</div>
                </div>

                {/* Information */}
                <div className="space-y-2 py-3 border-y border-stone-100 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Pickup Slot:</span>
                    <strong className="text-stone-900">{order.pickupSlot}</strong>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Counter:</span>
                    <strong className="text-orange-600">Counter {order.counterNumber}</strong>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Estimated Prep:</span>
                    <strong className="text-stone-900">{order.estimatedReadyTime}</strong>
                  </div>
                  <div className="pt-2 text-stone-700">
                    <span className="font-bold text-stone-900">Items: </span>
                    {order.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-4 flex items-center justify-between gap-3">
                  <span className="font-heading font-black text-lg text-stone-900">
                    ₹{order.totalAmount}
                  </span>
                  <button
                    onClick={() => setTrackedOrder(order)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>View Token & Live Status</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Orders Section */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          Past Meal History ({pastOrders.length})
        </h2>

        {pastOrders.length === 0 ? (
          <p className="text-xs text-stone-400">No past orders yet.</p>
        ) : (
          <div className="space-y-3">
            {pastOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-base text-stone-900">
                      Token {order.tokenNumber}
                    </span>
                    <span className="text-xs text-stone-400">• #{order.id}</span>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                  <p className="text-xs text-stone-600">
                    {order.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Slot: {order.pickupSlot} • Counter {order.counterNumber} • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                  <span className="font-heading font-bold text-base text-stone-900">
                    ₹{order.totalAmount}
                  </span>

                  <button
                    onClick={() => setTrackedOrder(order)}
                    className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder 1-Click</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
