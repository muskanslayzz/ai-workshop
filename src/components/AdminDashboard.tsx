import React, { useState, useEffect } from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { FoodItem, FoodCategory, Coupon, PickupSlot } from '../types/index.ts';
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Clock,
  Plus,
  Trash2,
  Edit,
  Tag,
  Star,
  Settings,
  Flame,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  BarChart3,
  Users,
  RotateCcw,
  Key,
  Lock,
  Copy,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { menuItems, refreshMenu, orders, settings, updateSettings, pickupSlots, refreshSlots, addToast } =
    useCanteen();

  const [adminTab, setAdminTab] = useState<'analytics' | 'menu' | 'slots' | 'coupons' | 'settings' | 'gateway'>('analytics');
  const [gatewayConfig, setGatewayConfig] = useState<any>(null);
  const [verifyingHandshake, setVerifyingHandshake] = useState(false);
  const [handshakeResult, setHandshakeResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Add Item Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // Form states for adding/editing dish
  const [formName, setFormName] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formCategory, setFormCategory] = useState<FoodCategory>('snacks');
  const [formPrice, setFormPrice] = useState<number>(40);
  const [formIsVeg, setFormIsVeg] = useState<boolean>(true);
  const [formStock, setFormStock] = useState<number>(50);
  const [formPrepTime, setFormPrepTime] = useState<number>(6);
  const [formCounter, setFormCounter] = useState<number>(1);
  const [formImageUrl, setFormImageUrl] = useState<string>('');

  // Settings form
  const [canteenOpen, setCanteenOpen] = useState<boolean>(settings.isCanteenOpen);
  const [noticeText, setNoticeText] = useState<string>(settings.activeNotice || '');
  const [taxPercent, setTaxPercent] = useState<number>(settings.taxRatePercent || 5);

  // Coupons
  const [newCouponCode, setNewCouponCode] = useState<string>('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(15);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(60);
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState<number>(25);

  // Fetch Analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.summary);
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchGatewayConfig = async () => {
    try {
      const res = await fetch('/api/payments/config');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setGatewayConfig(data);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchGatewayConfig();
  }, [orders]);

  const handleTestHandshake = async () => {
    setVerifyingHandshake(true);
    setHandshakeResult(null);
    try {
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100, paymentMethod: 'upi' }),
      });
      const intent = await intentRes.json();

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: intent.orderId,
          razorpayPaymentId: intent.transactionRef,
          razorpaySignature: intent.signature,
        }),
      });
      const verify = await verifyRes.json();
      if (verify.success && verify.verified) {
        setHandshakeResult(`✅ Success: Cryptographic signature verified via HMAC SHA256! (Ref: ${verify.transactionRef})`);
        addToast('Payment gateway cryptographic signature check passed!', 'success');
      } else {
        setHandshakeResult(`❌ Verification failed: ${verify.message}`);
        addToast(verify.message || 'Verification failed', 'error');
      }
    } catch (err: any) {
      setHandshakeResult(`❌ Network error: ${err.message}`);
    } finally {
      setVerifyingHandshake(false);
    }
  };

  // Handle Save Dish (Add or Edit)
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) {
      addToast('Please enter a valid dish name and price', 'error');
      return;
    }

    try {
      if (editingItem) {
        // Edit
        const res = await fetch(`/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            description: formDesc,
            category: formCategory,
            price: formPrice,
            isVeg: formIsVeg,
            stockQuantity: formStock,
            preparationTimeMinutes: formPrepTime,
            counterNumber: formCounter,
            imageUrl: formImageUrl || editingItem.imageUrl,
          }),
        });
        const data = await res.json();
        if (data.success) {
          addToast(`Updated ${formName}!`, 'success');
          await refreshMenu();
          setIsAddModalOpen(false);
          setEditingItem(null);
        }
      } else {
        // Add
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            description: formDesc,
            category: formCategory,
            price: formPrice,
            isVeg: formIsVeg,
            stockQuantity: formStock,
            preparationTimeMinutes: formPrepTime,
            counterNumber: formCounter,
            imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
          }),
        });
        const data = await res.json();
        if (data.success) {
          addToast(`Added new dish: ${formName}!`, 'success');
          await refreshMenu();
          setIsAddModalOpen(false);
        }
      }
    } catch {
      addToast('Failed to save food item', 'error');
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (item: FoodItem) => {
    try {
      const res = await fetch(`/api/menu/${item.id}/toggle-availability`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        addToast(
          `${item.name} is now ${data.item.isAvailable ? 'AVAILABLE' : 'SOLD OUT'}`,
          'info'
        );
        await refreshMenu();
      }
    } catch {
      addToast('Error updating availability', 'error');
    }
  };

  // Delete Dish
  const handleDeleteDish = async (item: FoodItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) {
      try {
        const res = await fetch(`/api/menu/${item.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          addToast(`Deleted ${item.name}`, 'info');
          await refreshMenu();
        }
      } catch {
        addToast('Error deleting item', 'error');
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormIsVeg(item.isVeg);
    setFormStock(item.stockQuantity);
    setFormPrepTime(item.preparationTimeMinutes);
    setFormCounter(item.counterNumber);
    setFormImageUrl(item.imageUrl);
    setIsAddModalOpen(true);
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormCategory('snacks');
    setFormPrice(40);
    setFormIsVeg(true);
    setFormStock(50);
    setFormPrepTime(6);
    setFormCounter(1);
    setFormImageUrl('');
    setIsAddModalOpen(true);
  };

  // Save Settings
  const handleSaveSettings = async () => {
    await updateSettings({
      isCanteenOpen: canteenOpen,
      activeNotice: noticeText,
      taxRatePercent: taxPercent,
    });
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode.trim(),
          discountPercent: newCouponDiscount,
          minOrderValue: newCouponMinOrder,
          maxDiscount: newCouponMaxDiscount,
          description: `${newCouponDiscount}% off on orders above ₹${newCouponMinOrder}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Created coupon ${newCouponCode}!`, 'success');
        setNewCouponCode('');
      }
    } catch {
      addToast('Failed to create coupon', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
                Canteen Administrator Console
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 uppercase tracking-wider">
                Manager Access
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {settings.collegeName} • Real-time sales, menu control, slot queue pacing & settings
            </p>
          </div>
        </div>

        {/* Canteen Status Toggle */}
        <div className="flex items-center gap-3 bg-stone-800/80 p-2.5 rounded-2xl border border-stone-700">
          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
              Canteen Orders
            </span>
            <span
              className={`text-xs font-black ${
                settings.isCanteenOpen ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {settings.isCanteenOpen ? 'OPEN & TAKING ORDERS' : 'PAUSED / CLOSED'}
            </span>
          </div>
          <button
            onClick={() => updateSettings({ isCanteenOpen: !settings.isCanteenOpen })}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
              settings.isCanteenOpen ? 'bg-emerald-500' : 'bg-stone-600'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.isCanteenOpen ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200">
        {[
          { id: 'analytics', label: 'Sales & Peak Rush Analytics', icon: BarChart3 },
          { id: 'menu', label: `Menu & Dishes (${menuItems.length})`, icon: ShoppingBag },
          { id: 'slots', label: 'Recess Slot Capacities', icon: Clock },
          { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
          { id: 'settings', label: 'Canteen Settings & Notices', icon: Settings },
          { id: 'gateway', label: 'Payment Gateway & Keys', icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS */}
      {adminTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
                Today's Canteen Sales
              </span>
              <div className="font-heading font-black text-3xl text-stone-900 mt-1">
                ₹{analytics.todayRevenue}
              </div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +18% from last week
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
                Total Orders Served
              </span>
              <div className="font-heading font-black text-3xl text-orange-600 mt-1">
                {analytics.todayOrdersCount}
              </div>
              <span className="text-xs text-stone-500 mt-1 block">Digital pre-orders placed</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
                Avg Preparation Turnaround
              </span>
              <div className="font-heading font-black text-3xl text-amber-500 mt-1">
                {analytics.avgPreparationTimeMinutes} min
              </div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                60% faster than line orders
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
                Active Kitchen Backlog
              </span>
              <div className="font-heading font-black text-3xl text-stone-900 mt-1">
                {analytics.activeQueueLength}
              </div>
              <span className="text-xs text-stone-500 mt-1 block">Tickets cooking right now</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Rush Hour Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900">
                    Campus Rush Hour Distribution
                  </h3>
                  <p className="text-xs text-stone-500">
                    Order volume clustered by college lecture breaks
                  </p>
                </div>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>

              <div className="space-y-3 pt-2">
                {analytics.hourlyRush.map((slot: any) => (
                  <div key={slot.hour} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-700">{slot.hour}</span>
                      <span className="font-bold text-stone-900">
                        {slot.orders} orders{' '}
                        {slot.load === 'peak' && (
                          <span className="text-rose-600 font-extrabold">(Peak Rush 🔥)</span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          slot.load === 'peak'
                            ? 'bg-rose-500'
                            : slot.load === 'moderate'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((slot.orders / 70) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Dishes */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-stone-900">
                    Top Selling Campus Dishes
                  </h3>
                  <p className="text-xs text-stone-500">Ranked by volume ordered</p>
                </div>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>

              <div className="divide-y divide-stone-100">
                {analytics.popularDishes.map((dish: any, idx: number) => (
                  <div key={dish.name} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 font-extrabold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-stone-900 block">{dish.name}</span>
                        <span className="text-[10px] text-stone-400 uppercase">
                          {dish.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-900 block">
                        {dish.ordersCount} portions
                      </span>
                      <span className="text-xs text-stone-500">₹{dish.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU MANAGEMENT */}
      {adminTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-stone-900">
                Canteen Food Catalog
              </h2>
              <p className="text-xs text-stone-500">
                Add, edit prices, update images, or mark dishes as out-of-stock instantly.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Dish</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price (₹)</th>
                    <th className="p-4">Counter</th>
                    <th className="p-4">Prep Time</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block">{item.name}</span>
                            <span className="text-[10px] text-stone-400">
                              {item.isVeg ? '🟢 Pure Veg' : '🔴 Non-Veg'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 uppercase font-semibold text-stone-600">{item.category}</td>
                      <td className="p-4 font-bold text-stone-900">₹{item.price}</td>
                      <td className="p-4 font-semibold text-stone-700">Counter {item.counterNumber}</td>
                      <td className="p-4 text-stone-600">{item.preparationTimeMinutes} min</td>
                      <td className="p-4 font-semibold text-stone-700">{item.stockQuantity}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Sold Out'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                            title="Edit Dish"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDish(item)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Dish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SLOTS & CAPACITY */}
      {adminTab === 'slots' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-heading font-extrabold text-xl text-stone-900">
              Pickup Slot Capacity Management
            </h2>
            <p className="text-xs text-stone-500">
              Prevent kitchen overflow by setting maximum order capacity per recess/lunch break.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pickupSlots.map((slot) => {
              const percent = Math.round((slot.currentBookings / slot.maxCapacity) * 100);
              return (
                <div
                  key={slot.id}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-heading font-black text-lg text-stone-900 block">
                        {slot.timeLabel}
                      </span>
                      <span className="text-xs font-semibold text-stone-500">{slot.slotName}</span>
                    </div>
                    {slot.isRushHour && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Rush
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-500">Booked Capacity</span>
                      <span className="font-bold text-stone-900">
                        {slot.currentBookings} / {slot.maxCapacity} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent >= 90
                            ? 'bg-rose-500'
                            : percent >= 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500">Max Capacity:</span>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={slot.maxCapacity}
                      onChange={async (e) => {
                        const val = Number(e.target.value);
                        await fetch(`/api/pickup-slots/${slot.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ maxCapacity: val }),
                        });
                        refreshSlots();
                      }}
                      className="w-16 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COUPONS */}
      {adminTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-stone-900">
              Create New Promo Coupon
            </h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-bold mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EXAM25"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">Discount %</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">Min Order Value (₹)</label>
                <input
                  type="number"
                  min={20}
                  value={newCouponMinOrder}
                  onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold mb-1">Max Discount Cap (₹)</label>
                <input
                  type="number"
                  min={10}
                  value={newCouponMaxDiscount}
                  onChange={(e) => setNewCouponMaxDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Create Promo Code
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-stone-900">
              Active Campus Discount Coupons
            </h3>
            <div className="space-y-3">
              {[
                {
                  code: 'CAMPUS50',
                  disc: '15% off up to ₹30',
                  min: '₹80 min order',
                  status: 'Active',
                },
                {
                  code: 'WELCOME20',
                  disc: '20% off up to ₹25',
                  min: '₹50 min order',
                  status: 'Active',
                },
                {
                  code: 'CHAI20',
                  disc: '10% off up to ₹15',
                  min: '₹30 min order',
                  status: 'Active',
                },
              ].map((c) => (
                <div
                  key={c.code}
                  className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-black text-sm text-stone-900 block">
                      {c.code}
                    </span>
                    <span className="text-stone-500">
                      {c.disc} • {c.min}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {adminTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs max-w-2xl space-y-6">
          <h2 className="font-heading font-extrabold text-xl text-stone-900">
            Canteen Operational Settings
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Campus Announcement Broadcast Banner
              </label>
              <textarea
                rows={2}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="Alert text displayed at the top of the student app..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Canteen Subsidy / Tax GST %
              </label>
              <input
                type="number"
                min={0}
                max={18}
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-32 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-600/20 cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PAYMENT GATEWAY & KEYS */}
      {adminTab === 'gateway' && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-stone-900">
                Payment Gateway & API Keys
              </h2>
              <p className="text-xs text-stone-500">
                Configure Razorpay publishable and secret credentials for campus online orders and UPI payments.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  gatewayConfig?.isTestMode
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    gatewayConfig?.isTestMode ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
                {gatewayConfig?.isTestMode ? 'Sandbox / Test Mode Active' : 'Production Live Mode'}
              </span>
            </div>
          </div>

          {/* Cards for Publishable Key and Secret Key */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Publishable Key (Client Key ID) */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  <Key className="w-4 h-4 text-orange-600" />
                  Publishable Key (Key ID)
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Client Safe
                </span>
              </div>

              <div>
                <span className="text-xs text-stone-500 block mb-1">
                  Passed to client browser & checkout SDK to initiate transactions:
                </span>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-2">
                  <code className="text-xs font-mono font-bold text-stone-900 truncate">
                    {gatewayConfig?.publishableKey || 'rzp_test_campus_canteen_demo_key'}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(gatewayConfig?.publishableKey || '');
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                      addToast('Publishable Key copied to clipboard!', 'info');
                    }}
                    className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors shrink-0"
                    title="Copy Key"
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 space-y-1">
                <p>
                  <strong>Env Variable:</strong> <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-800">RAZORPAY_KEY_ID</code>
                </p>
                <p>
                  Starts with <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">rzp_test_</code> in sandbox or <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">rzp_live_</code> in production.
                </p>
              </div>
            </div>

            {/* Secret Key (Server Private Key) */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Gateway Secret Key
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Strictly Confidential
                </span>
              </div>

              <div>
                <span className="text-xs text-stone-500 block mb-1">
                  Kept strictly on the backend to verify HMAC SHA256 signatures:
                </span>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-2">
                  <code className="text-xs font-mono font-bold text-stone-600 tracking-wider">
                    {gatewayConfig?.maskedSecret || '••••••••••••••••'}
                  </code>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                    {gatewayConfig?.hasSecretConfigured ? 'Custom Key Active' : 'Default Sandbox'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 space-y-1">
                <p>
                  <strong>Env Variable:</strong> <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-800">RAZORPAY_KEY_SECRET</code>
                </p>
                <p className="text-stone-500">
                  Never exposed in HTML, client JavaScript, or network requests.
                </p>
              </div>
            </div>
          </div>

          {/* Test Handshake & Signature Verification Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-stone-900">
                  Live Gateway Cryptographic Check
                </h3>
                <p className="text-xs text-stone-500">
                  Test the end-to-end payment intent generation and HMAC SHA256 signature verification handshake.
                </p>
              </div>
              <button
                onClick={handleTestHandshake}
                disabled={verifyingHandshake}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${verifyingHandshake ? 'animate-spin' : ''}`} />
                <span>{verifyingHandshake ? 'Testing Handshake...' : 'Run Verification Test'}</span>
              </button>
            </div>

            {handshakeResult && (
              <div
                className={`p-4 rounded-2xl border text-xs font-mono ${
                  handshakeResult.startsWith('✅')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {handshakeResult}
              </div>
            )}
          </div>

          {/* Configuration Instructions Guide */}
          <div className="bg-stone-900 text-stone-200 rounded-3xl p-6 sm:p-8 space-y-4 border border-stone-800">
            <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              How to Configure Your Own Production or Test Keys
            </h3>

            <p className="text-xs text-stone-300 leading-relaxed">
              To use your official college Razorpay account, obtain your API keys from the{' '}
              <strong className="text-white">Razorpay Dashboard ➔ Settings ➔ API Keys</strong>, then set them as environment variables:
            </p>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 font-mono text-xs text-amber-300 space-y-1 overflow-x-auto">
              <p className="text-stone-500"># In your .env or server environment:</p>
              <p>RAZORPAY_KEY_ID="rzp_test_YourKeyIdHere" <span className="text-stone-500"># Or rzp_live_...</span></p>
              <p>RAZORPAY_KEY_SECRET="YourSecretKeyHere" <span className="text-stone-500"># Server only</span></p>
              <p>PAYMENT_MODE="test" <span className="text-stone-500"># or "live"</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/60">
                <strong className="text-white block mb-0.5">Test / Sandbox Mode</strong>
                <p className="text-stone-400">
                  Pre-configured by default. Allows full end-to-end checkout, test UPI QR scanning, card validation, and token generation without real charges.
                </p>
              </div>
              <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/60">
                <strong className="text-white block mb-0.5">Live Production Mode</strong>
                <p className="text-stone-400">
                  Active automatically when <code className="text-amber-300 font-mono">RAZORPAY_KEY_ID</code> starts with <code className="text-amber-300 font-mono">rzp_live_</code>. Connects to real Indian student bank accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Dish */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
            <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-xl text-white">
                {editingItem ? 'Edit Canteen Dish' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Paneer Butter Masala Roll"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Ingredients, taste, and serving details..."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                    <option value="fast_food">Fast Food</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Prep Time (Min)</label>
                  <input
                    type="number"
                    min={1}
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Counter</label>
                  <select
                    value={formCounter}
                    onChange={(e) => setFormCounter(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  >
                    <option value={1}>Counter 1</option>
                    <option value={2}>Counter 2</option>
                    <option value={3}>Counter 3</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVeg"
                  checked={formIsVeg}
                  onChange={(e) => setFormIsVeg(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isVeg" className="font-bold text-stone-800">
                  Pure Vegetarian Food
                </label>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-600/20"
                >
                  {editingItem ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
