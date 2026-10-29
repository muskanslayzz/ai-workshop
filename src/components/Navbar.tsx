import React from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';
import {
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  User as UserIcon,
  ChefHat,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Flame,
} from 'lucide-react';
import { UserRole } from '../types/index.ts';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeRole,
    switchDemoRole,
    cart,
    setIsCartOpen,
    activeTab,
    setActiveTab,
    orders,
    resetDemoData,
    settings,
    setTrackedOrder,
    setIsAuthModalOpen,
  } = useCanteen();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Check if student has an active order that is in progress or ready
  const activeStudentOrder = orders.find(
    (o) => o.userId === currentUser.id && (o.orderStatus === 'preparing' || o.orderStatus === 'ready' || o.orderStatus === 'pending')
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top operational announcement banner */}
      {settings.activeNotice && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs sm:text-sm py-1.5 px-4 font-medium flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 truncate">
            <span className="inline-block animate-pulse">⚡</span>
            <span className="truncate">{settings.activeNotice}</span>
          </div>
        </div>
      )}

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & College name */}
          <div
            onClick={() => {
              if (activeRole === 'student') setActiveTab('home');
              else if (activeRole === 'staff') setActiveTab('staff');
              else setActiveTab('admin');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl sm:text-2xl text-stone-900 tracking-tight">
                  Bit<span className="text-orange-600">Bite</span>
                </span>
                <span className="hidden md:inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Campus
                </span>
              </div>
              <p className="hidden sm:block text-xs text-stone-500 font-medium">
                {settings.collegeName || 'Digital College Canteen Platform'}
              </p>
            </div>
          </div>

          {/* Navigation Links (Only in Student role) */}
          {activeRole === 'student' && (
            <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1.5 rounded-xl border border-stone-200/60">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'home'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'menu'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                Food Menu
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all relative ${
                  activeTab === 'orders'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                My Orders
                {activeStudentOrder && (
                  <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                Profile
              </button>
            </nav>
          )}

          {/* Staff Mode Indicator */}
          {activeRole === 'staff' && (
            <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-1.5 rounded-xl text-sm font-semibold">
              <ChefHat className="w-4 h-4 text-amber-600" />
              Kitchen Live Display (KDS)
            </div>
          )}

          {/* Admin Mode Indicator */}
          {activeRole === 'admin' && (
            <div className="hidden sm:flex items-center gap-2 bg-stone-900 text-white px-3.5 py-1.5 rounded-xl text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Canteen Admin Console
            </div>
          )}

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Token alert pill for student if they have an active order */}
            {activeRole === 'student' && activeStudentOrder && (
              <button
                onClick={() => {
                  setTrackedOrder(activeStudentOrder);
                  setActiveTab('orders');
                }}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  activeStudentOrder.orderStatus === 'ready'
                    ? 'bg-emerald-500 text-white animate-bounce'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {activeStudentOrder.orderStatus === 'ready'
                    ? `Token ${activeStudentOrder.tokenNumber} READY!`
                    : `Token ${activeStudentOrder.tokenNumber} Preparing`}
                </span>
              </button>
            )}

            {/* Role Switcher (Academic Project Feature for easy demo) */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                title="Switch to Student view"
                onClick={() => switchDemoRole('student')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'student'
                    ? 'bg-white text-orange-600 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Student</span>
              </button>
              <button
                title="Switch to Kitchen Staff view"
                onClick={() => switchDemoRole('staff')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'staff'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kitchen</span>
              </button>
              <button
                title="Switch to Admin view"
                onClick={() => switchDemoRole('admin')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeRole === 'admin'
                    ? 'bg-stone-900 text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>

            {/* Supabase Account button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              title="Supabase Authentication & Account"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentUser.name.split(' ')[0]}</span>
            </button>

            {/* Cart Trigger (Only in Student view) */}
            {activeRole === 'student' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 transition-all hover:scale-105 active:scale-95"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-emerald-500 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white animate-scale">
                    {totalCartCount}
                  </span>
                )}
              </button>
            )}

            {/* Reset Demo button */}
            <button
              onClick={resetDemoData}
              title="Reset sample menu & orders"
              className="p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation for Students */}
      {activeRole === 'student' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2 flex items-center justify-around shadow-lg">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              activeTab === 'home' ? 'text-orange-600' : 'text-stone-500'
            }`}
          >
            <span className="text-lg">🏠</span>
            Home
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              activeTab === 'menu' ? 'text-orange-600' : 'text-stone-500'
            }`}
          >
            <span className="text-lg">🍱</span>
            Menu
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold relative ${
              activeTab === 'orders' ? 'text-orange-600' : 'text-stone-500'
            }`}
          >
            <span className="text-lg">🧾</span>
            Orders
            {activeStudentOrder && (
              <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center gap-1 text-xs font-semibold text-orange-600 relative"
          >
            <span className="text-lg">🛒</span>
            Cart ({totalCartCount})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold ${
              activeTab === 'profile' ? 'text-orange-600' : 'text-stone-500'
            }`}
          >
            <span className="text-lg">👤</span>
            Profile
          </button>
        </div>
      )}
    </header>
  );
};
