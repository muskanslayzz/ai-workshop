import React, { useState, useMemo } from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { Order, OrderStatus } from '../types/index.ts';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  BellRing,
  Filter,
  Flame,
  Banknote,
  Smartphone,
  CreditCard,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sounds } from '../utils/audio.ts';

export const StaffDashboard: React.FC = () => {
  const { orders, updateOrderStatus, refreshOrders, settings } = useCanteen();

  const [counterFilter, setCounterFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [statusTab, setStatusTab] = useState<'active' | 'ready' | 'completed' | 'all'>('active');
  const [searchToken, setSearchToken] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Counter filter
      if (counterFilter !== 'all' && o.counterNumber.toString() !== counterFilter) return false;

      // Status filter
      if (statusTab === 'active') {
        if (o.orderStatus !== 'pending' && o.orderStatus !== 'accepted' && o.orderStatus !== 'preparing') {
          return false;
        }
      } else if (statusTab === 'ready') {
        if (o.orderStatus !== 'ready') return false;
      } else if (statusTab === 'completed') {
        if (o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled') return false;
      }

      // Search token
      if (searchToken.trim()) {
        const q = searchToken.toLowerCase();
        const matchToken = o.tokenNumber.toLowerCase().includes(q);
        const matchStudent = o.userName.toLowerCase().includes(q) || o.studentId.toLowerCase().includes(q);
        const matchId = o.id.toLowerCase().includes(q);
        if (!matchToken && !matchStudent && !matchId) return false;
      }

      return true;
    });
  }, [orders, counterFilter, statusTab, searchToken]);

  const handleAdvanceStatus = async (order: Order, nextStatus: OrderStatus) => {
    if (audioEnabled && nextStatus === 'ready') {
      sounds.playOrderReady();
    }
    await updateOrderStatus(order.id, nextStatus);
  };

  // Metrics
  const activeCount = orders.filter(
    (o) => o.orderStatus === 'pending' || o.orderStatus === 'accepted' || o.orderStatus === 'preparing'
  ).length;

  const readyCount = orders.filter((o) => o.orderStatus === 'ready').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl text-white">Kitchen Display System (KDS)</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                Live Stream
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Real-time kitchen prep queue & student counter collection management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Audio Chime toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              audioEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-stone-800 text-stone-400'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={() => refreshOrders()}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setStatusTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusTab === 'active'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Cooking Queue ({activeCount})
          </button>
          <button
            onClick={() => setStatusTab('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusTab === 'ready'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Ready at Counter ({readyCount})
          </button>
          <button
            onClick={() => setStatusTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusTab === 'completed'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Handed Over
          </button>
          <button
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusTab === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({orders.length})
          </button>
        </div>

        {/* Counter Filter & Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-bold">Desk:</span>
            <select
              value={counterFilter}
              onChange={(e) => setCounterFilter(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 font-bold px-2.5 py-1.5 rounded-xl focus:outline-none"
            >
              <option value="all">All Counters</option>
              <option value="1">Counter 1 (Breakfast/Snacks)</option>
              <option value="2">Counter 2 (Meals/Thalis)</option>
              <option value="3">Counter 3 (Beverages/FastFood)</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              placeholder="Search Token (e.g. A-14)..."
              className="w-48 text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-2">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
            ✨
          </div>
          <h3 className="font-heading font-bold text-base text-stone-800">
            No orders in this view
          </h3>
          <p className="text-xs text-stone-500">
            All kitchen tickets for this status and counter filter have been processed!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isReady = order.orderStatus === 'ready';
            const isCompleted = order.orderStatus === 'completed';
            const isPreparing = order.orderStatus === 'preparing';
            const isPending = order.orderStatus === 'pending' || order.orderStatus === 'accepted';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border shadow-sm flex flex-col justify-between overflow-hidden transition-all ${
                  isReady
                    ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                    : isPreparing
                    ? 'border-orange-300 ring-1 ring-orange-500/20'
                    : 'border-stone-200'
                }`}
              >
                {/* Order Top Bar */}
                <div
                  className={`p-4 flex items-center justify-between ${
                    isReady
                      ? 'bg-emerald-500 text-white'
                      : isPreparing
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-100 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-2xl tracking-tight">
                      {order.tokenNumber}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-black/20">
                      Counter {order.counterNumber}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[11px] font-extrabold uppercase tracking-wider">
                      {order.orderStatus.toUpperCase()}
                    </span>
                    <span className="text-[10px] opacity-80">{order.pickupSlot}</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Student & Payment Bar */}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-stone-100">
                    <div>
                      <span className="font-bold text-stone-900 block">{order.userName}</span>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {order.studentId}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-stone-900 block">
                        ₹{order.totalAmount}
                      </span>
                      {order.paymentMethod === 'cash_on_pickup' ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Banknote className="w-3 h-3" />
                          COLLECT CASH
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          PAID DIGITAL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Food Items to Prepare:
                    </div>
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-stone-50 rounded-xl flex items-start justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-stone-900">
                            <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-700 flex items-center justify-center text-xs">
                              {it.quantity}x
                            </span>
                            <span>{it.name}</span>
                          </div>
                          {it.specialInstructions && (
                            <p className="text-[11px] text-amber-800 bg-amber-100/70 font-semibold px-2 py-0.5 rounded-md mt-1">
                              ⚠️ Note: "{it.specialInstructions}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-xl">
                      <strong>Student Note:</strong> {order.notes}
                    </div>
                  )}
                </div>

                {/* Action Advance Bar */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 space-y-2">
                  {isPending && (
                    <button
                      onClick={() => handleAdvanceStatus(order, 'preparing')}
                      className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Flame className="w-4 h-4" />
                      <span>Start Preparing Now</span>
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => handleAdvanceStatus(order, 'ready')}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>Mark Ready & Alert Student</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => handleAdvanceStatus(order, 'completed')}
                      className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Hand Over to Student (Complete)</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="text-center text-xs text-stone-400 font-semibold py-1">
                      Order Handed Over at Counter {order.counterNumber}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
