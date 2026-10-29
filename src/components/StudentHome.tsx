import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { FoodCard } from './FoodCard.tsx';
import {
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Award,
  Coffee,
  HeartHandshake,
  TrendingUp,
} from 'lucide-react';
import { FoodCategory } from '../types/index.ts';

export const StudentHome: React.FC = () => {
  const { menuItems, setActiveTab, orders, currentUser, setTrackedOrder, settings } = useCanteen();
  const [selectedBudgetMax, setSelectedBudgetMax] = useState<number | null>(null);

  // Specials & Bestsellers
  const specials = menuItems.filter((item) => item.isSpecial || item.isPopular).slice(0, 4);

  // Active student order
  const activeOrder = orders.find(
    (o) => o.userId === currentUser.id && (o.orderStatus === 'preparing' || o.orderStatus === 'ready' || o.orderStatus === 'pending')
  );

  // Filtered by budget if active
  const budgetFilteredItems = selectedBudgetMax
    ? menuItems.filter((i) => i.price <= selectedBudgetMax).slice(0, 6)
    : [];

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-stone-800">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-amber-300 text-xs font-bold tracking-wide uppercase mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Skip Long 15-Minute Recess Queues</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight mb-4">
            Order Ahead. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
              Collect in Seconds.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed mb-6">
            Digitizing {settings.collegeName}'s canteen. Pre-book your meals for recess & lunch breaks, pay digitally, track kitchen preparation live, and collect your food without queueing.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Today's Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {activeOrder ? (
              <button
                onClick={() => {
                  setTrackedOrder(activeOrder);
                  setActiveTab('orders');
                }}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-sm backdrop-blur-xs transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Track Token {activeOrder.tokenNumber}</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('orders')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-xs transition-all"
              >
                <span>My Past Orders</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Canteen Operations Floating Widget */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-stone-400 font-semibold block">Average Prep Time</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-heading font-black text-xl text-amber-400">7-9</span>
              <span className="text-xs text-stone-300 font-semibold">minutes</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-stone-400 font-semibold block">Kitchen Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-sm text-emerald-300">Live & Cooking</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-stone-400 font-semibold block">Active Counters</span>
            <div className="font-bold text-sm text-stone-200 mt-1">
              3 Express Desks
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-stone-400 font-semibold block">Student Rating</span>
            <div className="flex items-center gap-1 font-bold text-sm text-amber-300 mt-1">
              <span>★ 4.8 / 5.0</span>
              <span className="text-stone-400 text-xs font-normal">(1,240+)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Budget Filter (Student Friendly Feature) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
              <Sparkles className="w-4 h-4" />
              Pocket Friendly Bites
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-stone-900">
              Filter by Student Budget
            </h2>
            <p className="text-xs text-stone-500">
              Find quick, delicious meals that match your daily pocket money.
            </p>
          </div>

          {/* Quick budget pill buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Items', max: null },
              { label: 'Under ₹30', max: 30 },
              { label: 'Under ₹50', max: 50 },
              { label: 'Under ₹70', max: 70 },
              { label: 'Under ₹100', max: 100 },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => setSelectedBudgetMax(b.max)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedBudgetMax === b.max
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {selectedBudgetMax && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {budgetFilteredItems.length > 0 ? (
              budgetFilteredItems.map((item) => <FoodCard key={item.id} item={item} />)
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-stone-500">
                No items found under ₹{selectedBudgetMax}. Try another budget tier.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Today's Special & Popular Campus Meals */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              Chef's Daily Picks
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900">
              Today's Campus Specials
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('menu')}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specials.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Explore Categories Preview */}
      <section className="bg-stone-100/70 rounded-3xl p-6 sm:p-8 border border-stone-200">
        <h3 className="font-heading font-extrabold text-xl text-stone-900 mb-4">
          Browse by Meal Time
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: 'breakfast', name: 'Breakfast', emoji: '🥞', desc: 'Parathas, Poha, Omelettes' },
            { id: 'lunch', name: 'Lunch', emoji: '🍛', desc: 'Veg Thalis, Rajma, Chole' },
            { id: 'snacks', name: 'Snacks', emoji: '🥟', desc: 'Samosas, Maggi, Momos' },
            { id: 'beverages', name: 'Beverages', emoji: '☕', desc: 'Masala Chai, Cold Coffee' },
            { id: 'fast_food', name: 'Fast Food', emoji: '🍔', desc: 'Burgers, Fries, Chowmein' },
          ].map((cat) => (
            <div
              key={cat.id}
              onClick={() => setActiveTab('menu')}
              className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group text-center"
            >
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                {cat.emoji}
              </span>
              <h4 className="font-heading font-bold text-sm text-stone-900 group-hover:text-orange-600 transition-colors">
                {cat.name}
              </h4>
              <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Solves Canteen Queueing Problem */}
      <section className="rounded-3xl bg-white border border-stone-200 p-8 sm:p-10 space-y-8">
        <div className="max-w-xl mx-auto text-center space-y-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
            Smart Queue Elimination
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900">
            How BitBite Saves Your 15-Minute Break
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            No more rushing to the canteen counter at lecture break only to find a 40-student crowd.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200/80 relative">
            <span className="w-8 h-8 rounded-xl bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
              1
            </span>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-1">
              Pre-Order & Choose Slot
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Order from class or your hostel before reaching the canteen. Pick a scheduled recess slot with capped limits to avoid sudden crowd surges.
            </p>
          </div>

          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200/80 relative">
            <span className="w-8 h-8 rounded-xl bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
              2
            </span>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-1">
              Live Cooking & Time ETA
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              The kitchen display organizes orders chronologically. You receive dynamic preparation estimates and notifications the instant your meal is ready.
            </p>
          </div>

          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200/80 relative">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center mb-4">
              3
            </span>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-1">
              Digital Token Express Pickup
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Walk up directly to Counter 1, 2, or 3, show your digital token number or scan QR, grab your hot meal, and enjoy your break with zero waiting!
            </p>
          </div>
        </div>
      </section>

      {/* College Student Testimonials */}
      <section className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border border-orange-200/70">
        <div className="flex items-center gap-2 mb-4">
          <HeartHandshake className="w-5 h-5 text-orange-600" />
          <h3 className="font-heading font-bold text-lg text-orange-950">
            What Campus Students Say
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-xs">
            <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
              {'★'.repeat(5)}
            </div>
            <p className="text-xs text-stone-700 italic mb-3">
              "During 11:15 AM recess, the line used to reach outside the canteen door. Now I order at 11:00 AM from my lab and pick up my samosa and tea in 30 seconds."
            </p>
            <div className="text-xs font-bold text-stone-900">Rahul Sharma</div>
            <div className="text-[10px] text-stone-500">Computer Science, 3rd Year</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-xs">
            <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
              {'★'.repeat(5)}
            </div>
            <p className="text-xs text-stone-700 italic mb-3">
              "The digital token and live countdown are so accurate. Plus being able to pay via UPI or card without carrying exact change makes it super convenient."
            </p>
            <div className="text-xs font-bold text-stone-900">Priya Patel</div>
            <div className="text-[10px] text-stone-500">Electronics & Comm, 2nd Year</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-xs">
            <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
              {'★'.repeat(5)}
            </div>
            <p className="text-xs text-stone-700 italic mb-3">
              "Best academic software project in our college! Even the kitchen staff loves it because they know exactly how many rotis and thalis to prepare ahead."
            </p>
            <div className="text-xs font-bold text-stone-900">Aman Verma</div>
            <div className="text-[10px] text-stone-500">Mechanical Engg, 4th Year</div>
          </div>
        </div>
      </section>
    </div>
  );
};
