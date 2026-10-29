import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { PaymentModal } from './PaymentModal.tsx';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  Clock,
  Flame,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  CreditCard,
  Smartphone,
  Banknote,
  Check,
} from 'lucide-react';
import { PaymentMethod } from '../types/index.ts';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    taxAmount,
    cartTotal,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    pickupSlots,
    selectedSlotId,
    setSelectedSlotId,
    createOrder,
    setActiveTab,
  } = useCanteen();

  const [couponInput, setCouponInput] = useState<string>('');
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [notes, setNotes] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponInput.trim());
    setCouponLoading(false);
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (method: PaymentMethod, gatewayRef: string) => {
    const res = await createOrder(method, gatewayRef, notes);
    if (res.success) {
      setActiveTab('orders');
    }
  };

  const selectedSlot = pickupSlots.find((s) => s.id === selectedSlotId);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <h2 className="font-heading font-extrabold text-lg text-stone-900">
                Your Food Tray ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-4">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-stone-800 mb-1">Your tray is empty</h3>
              <p className="text-xs text-stone-500 max-w-xs mb-6">
                Browse our delicious college canteen menu and add your favorite snacks and meals.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveTab('menu');
                }}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-600/20"
              >
                Explore Today's Menu
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Selected Food Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
                  <span>Selected Dishes</span>
                  <button
                    onClick={clearCart}
                    className="text-stone-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                {cart.map((ci) => (
                  <div
                    key={ci.foodItem.id}
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-3"
                  >
                    <img
                      src={ci.foodItem.imageUrl}
                      alt={ci.foodItem.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-3 h-3 border-2 flex items-center justify-center shrink-0 ${
                            ci.foodItem.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 ${
                              ci.foodItem.isVeg ? 'rounded-full bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </div>
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-stone-900 truncate">
                          {ci.foodItem.name}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-stone-900">
                        ₹{ci.foodItem.price * ci.quantity}
                      </span>
                      {ci.specialInstructions && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 truncate mt-0.5">
                          Note: {ci.specialInstructions}
                        </p>
                      )}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center bg-white border border-stone-200 rounded-xl p-0.5 shadow-xs shrink-0">
                      <button
                        onClick={() => updateQuantity(ci.foodItem.id, ci.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-stone-900">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(ci.foodItem.id, ci.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pickup Time Slot Selection */}
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-orange-950 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-orange-600" />
                    Select Pickup Slot
                  </label>
                  <span className="text-[10px] font-semibold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                    Queue Protection
                  </span>
                </div>

                <p className="text-[11px] text-stone-600 leading-normal">
                  Choose when you want to collect your meal. Each slot limits orders to prevent long counter lines.
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {pickupSlots.map((slot) => {
                    const isFull = slot.currentBookings >= slot.maxCapacity;
                    const isSelected = selectedSlotId === slot.id;
                    const spotsLeft = slot.maxCapacity - slot.currentBookings;

                    return (
                      <div
                        key={slot.id}
                        onClick={() => !isFull && setSelectedSlotId(slot.id)}
                        className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isFull
                            ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white border-stone-200 hover:border-orange-300 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {slot.isRushHour && (
                            <span
                              title="Peak Rush Hour Slot"
                              className={`p-1 rounded-md text-[10px] ${
                                isSelected ? 'bg-orange-700 text-white' : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              <Flame className="w-3 h-3" />
                            </span>
                          )}
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{slot.timeLabel}</span>
                              <span
                                className={`text-[10px] font-medium opacity-80 ${
                                  isSelected ? 'text-white' : 'text-stone-500'
                                }`}
                              >
                                ({slot.slotName})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {isFull ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                              Slot Full
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-semibold ${
                                isSelected ? 'text-orange-100' : 'text-stone-500'
                              }`}
                            >
                              {spotsLeft} slots left
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coupons & Promo Codes */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-orange-500" />
                  Have a Campus Coupon?
                </label>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>
                        <strong>{appliedCoupon.code}</strong> applied (-₹{discountAmount})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="e.g. CAMPUS50"
                        className="flex-1 text-xs uppercase px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-[11px]">
                      <span className="text-stone-400">Try:</span>
                      <button
                        onClick={() => {
                          setCouponInput('CAMPUS50');
                          applyCoupon('CAMPUS50');
                        }}
                        className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-700 font-semibold"
                      >
                        CAMPUS50
                      </button>
                      <button
                        onClick={() => {
                          setCouponInput('WELCOME20');
                          applyCoupon('WELCOME20');
                        }}
                        className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-700 font-semibold"
                      >
                        WELCOME20
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">UPI / QR</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'card'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash_on_pickup')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'cash_on_pickup'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] block">Cash</span>
                  </button>
                </div>
              </div>

              {/* Special Note */}
              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Order note for counter staff (optional)..."
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Bill Details */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Canteen Tax (5% GST)</span>
                  <span className="font-semibold text-stone-900">₹{taxAmount}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Savings</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-extrabold text-stone-900 font-heading">
                  <span>Grand Total</span>
                  <span className="text-orange-600 text-base">₹{cartTotal}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Checkout Bar */}
          {cart.length > 0 && (
            <div className="p-4 bg-white border-t border-stone-200">
              <button
                onClick={handleCheckoutClick}
                disabled={!selectedSlotId}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl font-heading font-extrabold shadow-lg shadow-orange-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="text-left">
                  <span className="block text-xs uppercase tracking-wider text-orange-100 font-medium">
                    {selectedSlot ? `Pickup: ${selectedSlot.timeLabel}` : 'Select a Slot'}
                  </span>
                  <span className="text-lg">Place Order • ₹{cartTotal}</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={cartTotal}
        selectedMethod={paymentMethod}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};
